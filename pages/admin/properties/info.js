//Next.js and React imports
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Footer from '../../../components/Footer';

//Firebase imports
import { doc, getDoc, updateDoc, query, where, getDocs, collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

//Iconography imports
import { BanIcon, LocationMarkerIcon,UserIcon,ChevronLeftIcon, ChevronRightIcon, KeyIcon, LockOpenIcon, WifiIcon } from '@heroicons/react/solid';
import { OfficeBuildingIcon } from '@heroicons/react/outline';
import { FaBed, FaBath } from "react-icons/fa";
import { BsFillDoorClosedFill } from "react-icons/bs";

//Assets 
import noImage from '../../../assets/noImage.png';

//Custom Components
import Header from '../../../components/Header';
import BannerMap from '../../../components/BannerMap';

//Libs
import {DateRange} from 'react-date-range';
import { format } from 'date-fns';

function info() {
    // Navigation and session information
    const router = useRouter();
    const {data: session} = useSession();
    const { id } = router.query;

    // Property Information states
    const [name, setName] = useState('Default name');
    const [status, setStatus] = useState('1');
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [address, setAddress] = useState('default address');
    const [owner, setOwner] = useState('default owner');
    const [region, setRegion] = useState('Default region');
    const [description, setDescription] = useState('default description');
    const [baths, setBaths] = useState(1);
    const [bedrooms, setBedrooms] = useState(1);
    const [beds, setBeds] = useState(1);
    const [guests, setGuests] = useState(1);
    const [msrp, setMSRP] = useState(1);
    const [cancellation, setCancellation] = useState('default cancellation');
    const [houseRules, setHouseRules] = useState('default house rules');
    const [created, setCreated] = useState('jan');
    const [amenities, setAmenities] = useState([])
    const [owner_id, setOwner_id] = useState('Default owner_id');

    const [location, setLocation] = useState([]);

    const [currentImage, setCurrentImage] = useState(0);
    
    const [center, setCenter] = useState({
        lat: 10.574511,
        lng: -85.68
    });

    //Schedule Calendar
    const [scheduleLoaded, setScheduleLoaded] = useState(false);
    const [disabledDates, setDisabledDates] = useState([]);
        //Get the firebase schedule data

    const getScheduleData = async () => {
        if (!scheduleLoaded && id && disabledDates.length == 0){
            setScheduleLoaded(true);
            

            const scheduleRef = collection(db, 'schedule');
            const propertyRef = doc(db, 'properties', id);
            const q = query(scheduleRef, where("propertyId", '==', propertyRef ));
            
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {

                let tempDate = doc.data().startDate.toDate();
                const endDate = doc.data().endDate.toDate();
                let tempDisabledDates = disabledDates;

                while(tempDate <= endDate){
                    const newDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())
                    tempDisabledDates.push(newDate);
                    tempDate.setDate(tempDate.getDate() + 1);
                }
                setDisabledDates(tempDisabledDates);
            });
        }
    }
    getScheduleData();

    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState(new Date());

    const selectionRange = {
        startDate:startDate,
        endDate:endDate,
        key: 'selection',
    }

    const [dateSelected, setDateSelected] = useState(false);

    const handleSelect = (ranges) => {
        setDateSelected(true);

        setStartDate(ranges.selection.startDate);
        setEndDate(ranges.selection.endDate);
    }

    const setUpDefaultDate = () => {
        setStartDate();
        setEndDate(new Date());

        setDateSelected(false);
    }

    const [showModal, setShowModal] = useState(false);
    const [currentLink, setCurrentLink] = useState('');

    const [creatingSchedule, setCreatingSchedule] = useState(false);

    async function createScheduleLink() {
        if(creatingSchedule) {
            return;
        }
        setCreatingSchedule(true);

        endDate.setHours(11,30);
        startDate.setHours(14);

        const docRef = await addDoc(collection(db, 'schedule'), {
            PriceTotal: msrp,
            createdDate: serverTimestamp(),
            endDate: Timestamp.fromDate(endDate),
            propertyId: doc(db, 'properties',id),
            startDate: Timestamp.fromDate(startDate),
            Door: privInfo.Door, //Temporal door pass TODO: change it to hash
            WIFI: privInfo.WIFI,
            PrivInfo: privInfo.Additional,
            userId: null,
            propertyName: name
        }).then((snapshot) => {
            // Create a sub function to add the items to the disabled list and reset the selection
            setCurrentLink(`${window.location.origin.toString()}/property/greeting?id=${snapshot.id}`);
            setShowModal(true);
            setCreatingSchedule(false);
            setDateSelected(false);

            //Add the schedule to the disabled dates
            let tempDate = startDate
            let tempDisabledDates = disabledDates;

            while(tempDate <= endDate){
                const newDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())
                tempDisabledDates.push(newDate);
                tempDate.setDate(tempDate.getDate() + 1);

                if (tempDate == endDate) {
                    break;
                }
            }
            setDisabledDates(tempDisabledDates);

            setUpDefaultDate();
        })
    }

    function customDayContent(day) {
        let extraDot = null;
        
        const isDisabled = disabledDates.find(
            date =>
                date.toDateString() === day.toDateString()
        )
        if (isDisabled) {
          extraDot = (
            <div
              style={{
                height: "100%",
                width: "90%",
                borderRadius: "10%",
                background: "red",
                opacity: "30%",
                position: "absolute",
                top: 0,
                left: "5%"

              }}
            />
          )
        }
        return (
          <div>
            {extraDot}
            <span>{format(day, "d")}</span>
          </div>
        )
    }
    
    //First property info load logic
    const [privInfo, setPrivInfo] = useState({});
    const [showingPriv, setShowingPriv] = useState(false);

    const [loaded, setLoaded] = useState(false);

    const loadPropertyInfo = async () => {
        if(id && !loaded){
             setLoaded(true);
             const propertyRef = doc(db, 'properties', id);
             const unsub = await getDoc(propertyRef).then(async (doc) => {
                if (!doc.exists()) {
                    router.push({
                        pathname: "/generics/not_found",
                      });

                    return;
                }
                setName(doc.data().name);
                setStatus(doc.data().status);
                setCategories(doc.data().categories); 
                setImages(doc.data().images);
                setOwner(doc.data().owner);
                setRegion(doc.data().region);
                setAddress(doc.data().address);
                setDescription(doc.data().description);
                setOwner_id(doc.data().owner_id);
                setBaths(doc.data().baths);
                setBeds(doc.data().beds);
                setBedrooms(doc.data().bedrooms);
                setGuests(doc.data().guests);
                setCancellation(doc.data().cancellation);
                setHouseRules(doc.data().houseRules);
                setCreated(doc.data().timestamp.toDate().toDateString());
                setAmenities(doc.data().amenities);
                setMSRP(doc.data().msrp);
                const loc = doc.data().location;
                
                const tempCenter = {
                    lat: loc._lat,
                    lng: loc._long
                }
                setCenter(tempCenter);

                const locationTemp = {
                    name: doc.data().name,
                    lat: loc._lat,
                    lng: loc._long,
                    id: 1,
                    price: doc.data().msrp,
                }
                
                const tempArray = [];
                tempArray.push(locationTemp);
                setLocation(tempArray);

                //Load private info
                const scheduleRef = collection(db, 'propertyPrivate');
                const q = query(scheduleRef, where("Property", '==', propertyRef ));
                
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((res) => {
                    setPrivInfo(res.data());
                });
            });
        }
    }

    loadPropertyInfo();

    // Property Disabeling information
    const onDelete = async () => {
        if (status == "1"){
            await updateDoc(doc(db, 'properties', id), {
                status: "2"
            }).then(function() {
                setStatus('2')
            }).catch(function() {
                console.log('error updating')
            });
    
        } else {
            
            await updateDoc(doc(db, 'properties', id), {
                status: "1"
            }).then(function() {
                setStatus('1');
            }).catch(function() {
                console.log('error updating')
            });
        }
    }

    // Edition page routing
    const getInfo = () => {
        router.push({
            pathname: "/admin/properties/edit",
            query: {
              id: id,
            }
          });
    }

    // Schedule history page routing
    const openScheduleHistory = () => {
        router.push({
            pathname: "/admin/schedules/view",
            query: {
              id: id,
            }
          });
    }


    // Image Carousel behaviour logic
    const nextImage = () => {
        if(currentImage < images.length - 1 && images.length != 0) {
            setCurrentImage(currentImage + 1);
        } else {
            console.log('cant go to next');
        }
    }

    const prevImage = () => {
        if(currentImage > 0 && images.length != 0) {
            setCurrentImage(currentImage - 1);
        } else {
            console.log('cant go to prev');
        }
    }
    
  return (
    <div className="bg-gray-200">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
            {session && session.user.isAdmin ? (
                <>
                    <div className='mb-10 pb-10'>
                        <section className='pt-6 border-b-2 pd-3 mb-2 grid grid-cols-4'>
                            <h2 className='text-3xl font-semibold pb-3 text-left col-span-3'>Property Info</h2>
                            <div className='justify-end flex col-start-4'>
                                <button className='bg-yellow-500 rounded-lg text-white text-sm sm:text-lg
                                justify-end w-20 my-1 hover:bg-yellow-600 mr-2 px-2' onClick={getInfo}>Edit</button>
                                {status == 1 ? 
                                <button className='bg-red-500 rounded-lg text-white text-sm sm:text-lg 
                                justify-end w-24 my-1 hover:bg-red-600 px-4' onClick={onDelete}>Delete</button>
                                :
                                <button className='bg-green-500 rounded-lg text-white text-sm sm:text-lg 
                                justify-end w-24 my-1 hover:bg-green-600 px-4' onClick={onDelete}>Activate</button>
                                }
                            </div>
                        </section>
                        <section className='flex'>
                        { currentImage >= 0 ? 
                            // Fix why image isn't cycling
                            <div className='flex relative justify-center w-full bg-gray-200'> 
                                <div className='bg-black bg-opacity-30 absolute w-12 hover:bg-opacity-75 left-0 top-[50%]'>
                                    <ChevronLeftIcon onClick={prevImage} className='w-10 text-white 
                                    cursor-pointer my-3'/>
                                </div>
                                <img src={images[currentImage]} alt="Image of property"
                                layout="fill" objectfit='cover' className='lg:mx-2 ml-auto mr-auto'/> 

                                <div className='bg-black bg-opacity-30 absolute right-0 w-12  hover:bg-opacity-75 top-[50%]'> 
                                    <ChevronRightIcon onClick={nextImage} className='text-white 
                                    w-10 cursor-pointer my-3'/>
                                </div>
                            </div>
                        : 
                            <img src={noImage.src} layout="fill" objectfit='cover' className='max-h-64 ml-auto mr-auto'/>
                        }

                        </section>
                        <div className='px-2 justify-center'>
                            <h2 className='text-2xl font-semibold pt-2 flex'>
                                <p className='mr-2 flex-1'>{name}</p>
                                { status == 1 ? (
                                    <div className='w-4 h-4 rounded-full bg-green-500 flex m-2'></div>
                                ) : (
                                    <div className='w-4 h-4 rounded-full bg-red-500 flex m-2'></div>
                                )}
                                <p className='font-semibold text-lg text-center'>${msrp}</p>
                            </h2>
                            <div className='mt-1 mb-2 te xt-sm text-gray-40'>
                                <p>{created}</p>
                            </div>
                            <div className='flex px-1'>
                                    <div className='flex pr-3 py-2 items-center'>
                                        <UserIcon className='text-gray-500 w-5 mr-3' />
                                        <p>{guests}</p>
                                    </div>
                                    <div className='flex px-3 py-2 items-center'>
                                        <FaBed className='text-gray-500 w-5 mr-3' />
                                        <p>{beds}</p>
                                    </div>
                                    <div className='flex px-3 py-2 items-center'>
                                        <BsFillDoorClosedFill className='text-gray-500 w-5 mr-3' />
                                        <p>{bedrooms}</p>
                                    </div>
                                    <div className='flex px-3 py-2 items-center'>
                                        <FaBath className='text-gray-500 w-5 mr-3' />
                                        <p>{baths}</p>
                                    </div>
                            </div>
                            <div className='flex'><p className='font-semibold mr-2'>Owner: </p>{owner}</div>
                            <div className='flex'><p className='font-semibold mr-2'>Region: </p>{region}</div>
                            <p className='text-gray-600 text-sm mt-1'>{description}</p>
                            {/* Categories */}
                            <div className='flex mt-2'>
                                {categories.map(function(category, i){
                                    return <p className='bg-primary text-white text-sm px-2 
                                    py-1 mr-1 rounded-lg cursor-pointer' key={i}>{category}</p>
                                })}
                            </div>
                            {/* Amenities */}
                            {amenities.length > 0 && (
                                <div>
                                    <h2 className='text-gray-500 font-semibold mb-1 mt-3'>Amenities</h2>
                                    <div className='flex flex-col sm:flex-row sm:space-x-10 mt-2'>
                                        {amenities.map(function(amenity, i){
                                            return <div className='flex align-center' key={i}>
                                                        <div className='rounded-full w-10 h-10 text-white bg-primary text-center'>
                                                            <OfficeBuildingIcon className='w-7 mx-auto mt-1' />
                                                        </div>
                                                        <p className='text-sm px-2 font-semibold text-center
                                                        py-1 mr-1 rounded-lg cursor-pointer'>{amenity}</p>
                                                    </div>
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className='mt-2 border-b-2 mx-5'/>
                            <div className='flex-col mt-3 align-bottom justify-center'>
                                <h3 className='text-xl text-center'>Availability</h3>
                                <div className='text-center items-center'>
                                    <DateRange 
                                    minDate={new Date()}
                                    rangeColors={["#AAC6A7"]}
                                    disabledDates={disabledDates}
                                    onChange={handleSelect}
                                    dayContentRenderer={customDayContent}
                                    ranges={[selectionRange]}
                                    />
                                </div>
                                { dateSelected && (
                                    <div className='flex justify-center'>
                                        <button className='px-2 w-28 text-white 
                                        rounded-lg hover:bg-gray-700 bg-gray-500 text-lg 
                                        cursor-pointer' onClick={setUpDefaultDate}>Cancel
                                        </button>
                                        { creatingSchedule ? (
                                            <button className='ml-3 px-5 w-28 text-white 
                                            rounded-lg hover:bg-opacity-100 bg-opacity-80 bg-primary text-lg 
                                            cursor-pointer' disabled={true} onClick={createScheduleLink}>Saving
                                            </button>
                                        ) : (
                                            <button className='ml-3 px-5 w-28 text-white 
                                            rounded-lg hover:bg-opacity-100 bg-opacity-80 bg-primary text-lg 
                                            cursor-pointer' onClick={createScheduleLink}>Save
                                            </button>
                                        )}
                                        
                                    </div>
                                )}

                                {showModal && (
                                    <div className='bg-white shadow-lg rounded-lg p-5 py-10 flex-col justify-center absolute w-[80%] sm:w-[50%] h-fill z-50
                                    transition translate ease-out duration-150 align-middle left-[10%] sm:left-[25%] mt-2 cursor-pointer'>
                                        <h1 className='text-center w-full text-gray-600 text-2xl mt-1'>Schedule created succesfully</h1>
                                        <p className='text-center w-full text-gray-400 text-lg mt-1'>This is the link provided for the property:</p>
                                        <p className='text-center w-full text-white text-xl px-10 py-2 mt-2 max-w-[90%] mx-auto flex-wrap
                                        border-[1px] border-black bg-gray-500 rounded-xs'>{currentLink}</p>
                                        <div className='flex justify-end'>
                                            <button className='bg-primary text-white text-lg rounded-lg px-5 mt-4 bg-opacity-80 hover:bg-opacity-100' 
                                            onClick={() => {setShowModal(false); navigator.clipboard.writeText(currentLink)}}>Copy</button>
                                        </div>
                                    </div>
                                )}
                                <div className='bg-primary mx-auto px-4 py-2 text-white text-semibold text-lg  mt-4
                                text-center rounded-lg hover:bg-opacity-100 bg-opacity-90' onClick={() => openScheduleHistory()}>
                                    <h2>Schedule History</h2>
                                </div>
                                <h3 className='text-xl text-center mt-5'>Address</h3>
                                <p className='text-center mt-3 text-sm flex justify-center'>
                                    {address}<LocationMarkerIcon className='w-4 text-gray-500 ml-1' />
                                </p>
                                <div className='relative mt-2 rounded-sm sm:px-10'>
                                    <BannerMap locations={location} zoomLevel={16} center={center}/>
                                </div>
                            </div>
                            <div className='mt-2 border-b-2 mx-5'/>
                            <div className='grid grid-rows-2 sm:grid-cols-2 sm:grid-rows-1'>
                                <div className='col-start-1 p-5'>
                                    <h2 className='text-xl text-center font-gray-500 mb-2'>House Rules</h2>
                                    <p className='text-sm'>{houseRules}</p>
                                </div>
                                <div className='sm:col-start-2 row-start-2 sm:row-start-1 p-5'>
                                    <h2 className='text-xl text-center font-gray-500 mb-2'>Cancellation</h2>
                                    <p className='text-sm'>{cancellation}</p>
                                </div>

                            </div>
                            <div className='mt-3 mx-auto'>
                                <div className='flex justify-between'>
                                    <h2 className='text-xl text-center font-gray-500 mb-2 font-semibold'>Private Information</h2>
                                    { showingPriv ? 
                                        <button className='text-white bg-primary bg-opacity-90 hover:bg-opacity-100 rounded-lg px-2 py-1'
                                        onClick={() => setShowingPriv(false)}>Hide</button>
                                    :
                                        <button className='text-white bg-primary bg-opacity-90 hover:bg-opacity-100 rounded-lg px-2 py-1'
                                        onClick={() => setShowingPriv(true)}>Show</button>
                                    }
                                </div>
                                { showingPriv && (
                                    <div className='mx-5'>
                                        <div className='flex my-1'>
                                            <KeyIcon className='w-10 text-white bg-primary p-2 mr-2 rounded-full'/>
                                            <p className='mt-2'>{privInfo.Door}</p>
                                        </div>
                                        <div className='flex my-1'>
                                            <WifiIcon className='w-10 text-white bg-primary p-2 mr-2 rounded-full'/>
                                            <p className='mt-2'>{privInfo.WIFI}</p>
                                        </div>

                                        <h2 className='text-lg font-gray-500 mt-2 mb-1'>Additional Info</h2>
                                        {privInfo.Additional.map((info) => {
                                            return <div key={info.name} className='flex text-white bg-primary rounded-full px-2 sm:px-5 my-1 sm:mx-4 w-fit'> 
                                                <p className='pl-1'>{info.name}</p>:
                                                <p className='px-1'>{info.value}</p>
                                            </div>
                                        })}
                                    </div>
                                )}
                                

                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <section className='pt-6 py-[100%]'>
                    <h2 className='text-3xl font-semibold pb-3 text-center border-b-2 mb-3'>You don't have permission to see this page</h2>
                    <BanIcon className='text-3xl font-semibold mt-2 w-36 text-red-400 mx-auto' />
                </section>
            )}
        </main>
        <Footer />
    </div>
  )
}

export default info