import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';

//Firebase imports
import { doc, getDoc, collection, query, where, getDocs, updateDoc, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

//Iconography imports
import { LocationMarkerIcon,UserIcon,ChevronLeftIcon, ChevronRightIcon, ExclamationCircleIcon, KeyIcon, LockOpenIcon, WifiIcon } from '@heroicons/react/solid';
import { OfficeBuildingIcon, InformationCircleIcon } from '@heroicons/react/outline';
import { FaBed, FaBath } from "react-icons/fa";
import { BsFillDoorClosedFill } from "react-icons/bs";

//Assets 
import noImage from '../../assets/noImage.png';

//Custom Components
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BannerMap from '../../components/BannerMap';

//Libs
import { format } from 'date-fns';
import ItemMiniCart from '../../components/ItemMiniCart';
import PropertyItemRecomendation from '../../components/PropertyItemRecomendation';

function info() {
    const router = useRouter();
    const {data: session} = useSession();
    const { id } = router.query;

    // Property Information states
    const [name, setName] = useState('Default name');
    const [status, setStatus] = useState('1');
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [address, setAddress] = useState('default address');
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

    const [location, setLocation] = useState([]);
    
    const [center, setCenter] = useState({
        lat: 10.159549,
        lng: -84.152433
    });

    //Schedule information state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [userId, setUserId] = useState('');
    const [priceTotal, setPriceTotal] = useState(0);
    const [daysLeft, setDaysLeft] = useState(0);
    const [endedSince,setEndedSince] = useState(false);
    const [startHours, setStartHours] = useState('');
    const [endHours, setEndHours] = useState('');

    //First schedule and property info load logic
    const [loaded, setLoaded] = useState(false);

    //First property info load logic
    const [privInfo, setPrivInfo] = useState({});
    const [showingPriv, setShowingPriv] = useState(false);

    const [propertyId, setPropertyId] = useState("");

    const loadInfo = async () => {
        if(id && !loaded){
             setLoaded(true);
             try {
                const unsub = await getDoc(doc(db, 'schedule', id)).then(async (schedule) => {

                    if (!schedule.exists()) {
                        router.push({
                            pathname: "/generics/not_found",
                          });
    
                        return;
                    }
                    
                    let tempStartDate = schedule.data().startDate.toDate();
                    let tempEndDate = schedule.data().endDate.toDate();
                    let today = new Date();
                    setStartDate(tempStartDate.toDateString());
                    setEndDate(tempEndDate.toDateString());
                    setPriceTotal(schedule.data().PriceTotal);
                    setUserId(schedule.data().userId);
    
                    setStartHours(`${format(tempStartDate, 'H')} : ${format(tempStartDate, 'mm')}`);
                    setEndHours(`${format(tempEndDate, 'H')} : ${format(tempEndDate, 'mm')}`);
    
                    setDaysLeft(tempStartDate.getTime() - today.getTime());
                    setEndedSince(tempEndDate.getTime() - today.getTime() <= 0);
                    
                    
                    //get property info
                    const property = await getDoc(schedule.data().propertyId).then(async (doc) => {
    
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
                        setRegion(doc.data().region);
                        setAddress(doc.data().address);
                        setDescription(doc.data().description);
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
                            price: doc.data().msrp
                        }
                        
                        const tempArray = [];
                        tempArray.push(locationTemp);
                        setLocation(tempArray);
                        
                        //Load private info
                        const scheduleRef = collection(db, 'propertyPrivate');
                        const q = query(scheduleRef, where("Property", '==', schedule.data().propertyId ));
                        
                        const querySnapshot = await getDocs(q);
                        querySnapshot.forEach((res) => {
                            setPrivInfo(res.data());
                        });
                        

                        //Load items
                        setPropertyId(schedule.data().propertyId.id);

                     }).catch(error  => {
                        console.log('Experiencing error in property fetching');
                        console.log(error);
                        router.push({
                            pathname: "/generics/error",
                          });
                     })
                 }).catch(error  => {
                    console.log('Experiencing error in schedule fetching');
                    console.log(error);
                    router.push({
                        pathname: "/generics/error",
                      });
                 });
             } catch (error) {
                console.log('internal service error');
                console.log(error);
                router.push({
                    pathname: "/generics/error",
                  });
             }
        }
    }

    loadInfo();

    const [showModal, setShowModal] = useState(true);

    // Image Carousel behaviour logic
    const [currentImage, setCurrentImage] = useState(0);

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

    //Associate property logic
    const associateSchedule = async () => {
        setUserId(session.user.email);

        await updateDoc(doc(db, 'schedule', id), {
            userId: session.user.email
        }).then(function() {
            console.log('schedule updated succesfully');
        }).catch(function() {
            console.log('error updating')
        });
    }

  return (
    <div className="bg-gray-200">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
            <>
                    <div className='mb-10 pb-10'>
                        { status == 2 && showModal && (
                            <div className='bg-white shadow-lg rounded-lg p-5 py-5 flex-col justify-center absolute w-[80%] sm:w-[50%] h-fill z-50
                            transition translate ease-out duration-150 align-middle left-[10%] sm:left-[25%] mt-2'>
                                <ExclamationCircleIcon className='text-gray-600 text-center w-10 mx-auto'/>
                                <h1 className='text-center w-full text-gray-600 text-2xl mt-1'>Warning!</h1>
                                <p className='text-center w-full text-gray-400 text-sm mt-1'>
                                    This property is inactive. If you have a upcoming reservation please contact the support team.
                                </p>
                                <p className='text-center w-full text-blue-500 underline text-xl px-10 py-2 mt-2 max-w-[90%] mx-auto flex-wrap
                                cursor-pointer'>Contact us</p>
                                <div className='flex justify-center'>
                                    <button className='bg-primary text-white text-lg rounded-xl px-6 py-1 mt-4 bg-opacity-80 hover:bg-opacity-100' 
                                    onClick={() => {setShowModal(false)}}>Close</button>
                                </div>
                            </div>

                        )}
                        <div>
                            <section className='pt-6 border-b-2 mb-2 grid grid-cols-4'>
                                <h2 className='text-3xl font-semibold pb-3 text-left col-span-3'>Property Info</h2>
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
                                    { daysLeft < 0 &&
                                    <div className='px-5 py-1 text-white
                                     bg-yellow-400 rounded-full text-center w-fit font-semibold mx-auto flex'>
                                        <InformationCircleIcon className='w-7 pr-1'/><h3>This reservation's date has passed</h3>
                                    </div>
                                    }
                                    <h3 className='text-xl text-center mt-5 pb-2 font-semibold'>My Reservation</h3>
                                    { (userId == null || (session && ( userId == session.user.email || session.user.isAdmin))) && 
                                        <div className='grid grid-cols-2'>
                                            <div className='w-full h-20 text-gray-500 text-center border-r-2 font-thin' >
                                                <h2 className='text-black font-semibold mb-1 text-xl'>Check-in</h2>
                                                <p className=''>{startDate}</p>
                                                <p className=''>{startHours}</p>
                                            </div>
                                            <div className='w-full h-20 text-gray-500 text-center font-thin'>
                                                <h2 className='text-black font-semibold mb-1 text-xl'>Check-out</h2>
                                                <p className=''>{endDate}</p>
                                                <p className=''>{endHours}</p>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {/* Reservation claiming UI */}
                                <div className='mx-10 bg-primary rounded-lg my-5 py-3'>
                                    <div className='text-white border-white border-4 p-5 mx-3 rounded-lg text-center'>
                                        {session ? (
                                            <div>
                                                {userId == null ? (
                                                    <div>
                                                        <h1 className='text-2xl font-semibold text-center capitalize'>Hello {session.user.name}</h1>
                                                        <button className='bg-white rounded-full px-5 py-2 transaition ease-out duration-150 mt-4
                                                        text-primary mt-5hover:bg-gray-100 hover:-translate-y-0.5' onClick= {associateSchedule}>Claim this reservation</button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {userId == session.user.email ? (
                                                            <div>
                                                                <h1 className='text-2xl font-semibold text-center capitalize'>Hello {session.user.name}</h1>
                                                                <p className='text-lg text-center'>We are all setup! Love to have you with us</p>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <h1 className='text-2xl font-semibold text-center capitalize'>Oops!</h1>
                                                                <p className='text-lg text-center'>It seems like someone else claimed this reservation.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <h1 className='text-2xl font-serif text-center'>Not part of our family?</h1>
                                                <button className='bg-white rounded-full px-5 py-2 transaition ease-out duration-150
                                                text-primary mt-5 w-28 hover:bg-gray-100 hover:-translate-y-0.5' onClick= {signIn}>Sign up</button>
                                            </div>
                                        )}
                                        
                                    </div>
                                </div>
                                <div className='mt-2 border-b-2 mx-5'/>
                                {/* Item Recomendation UI */}
                                { ( !endedSince && (userId == null || (session && ( userId == session.user.email || session.user.isAdmin)))) &&
                                    <PropertyItemRecomendation propertyId={propertyId} scheduleId={id}/>
                                }

                                
                                <div className='mt-2 border-b-2 mx-5'/>
                                <div className='flex-col mt-3 align-bottom justify-center'>
                                    <h3 className='text-xl text-center mt-5 my-2 font-semibold'>Address</h3>
                                    <p className='text-center mt-3 flex justify-center font-thin'>
                                        {address}<LocationMarkerIcon className='w-4 text-gray-500 ml-1' />
                                    </p>
                                    <div className='relative mt-2 rounded-sm sm:px-10'>
                                        <BannerMap locations={location} zoomLevel={10} center={center}/>
                                    </div>
                                </div>

                                {/* Load private info specific for each schedule */}
                                <div className='mt-2 border-b-2 mx-5'/>
                                <div className='mt-5'>
                                    <div className='mt-3 mx-auto'>
                                        { (userId == null || (session && ( userId == session.user.email || session.user.isAdmin))) && 
                                            <div>
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
                                        }
                                        
                                

                                    </div>
                                </div>
                                
                                <div className='mt-5 border-b-2 mx-5'/>
                                <div className='grid grid-cols-2'>
                                    <div className='col-start-1 p-5'>
                                        <h2 className='text-xl text-center font-gray-500 mb-2'>House Rules</h2>
                                        <p className='text-sm'>{houseRules}</p>
                                    </div>
                                    <div className='col-start-2 p-5'>
                                        <h2 className='text-xl text-center font-gray-500 mb-2'>Cancellation</h2>
                                        <p className='text-sm'>{cancellation}</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                        
                    </div>
                </>
        </main>
        <Footer />
    </div>
  )
}

export default info