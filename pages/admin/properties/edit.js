import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { BanIcon, PlusCircleIcon,UserIcon,ChevronLeftIcon, ChevronRightIcon, CameraIcon, XCircleIcon, KeyIcon, WifiIcon } from '@heroicons/react/solid';
import { FaBed, FaBath } from "react-icons/fa";
import { BsFillDoorClosedFill } from "react-icons/bs";

// Firebase
import { db, storage } from '../../../firebase';
import { query, collection, doc, updateDoc, getDoc, where, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL, uploadString } from 'firebase/storage';

import { useSession } from 'next-auth/react';

import { v4 as uuid } from 'uuid'
import BannerMap from '../../../components/BannerMap';
import noImage from '../../../assets/noImage.png';

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { OfficeBuildingIcon } from '@heroicons/react/outline';

function edit() {
    const router = useRouter();
    const {data: session} = useSession();

    const { id } = router.query;

    const filePickerRef = useRef(null);

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
    
    const [center, setCenter] = useState({
        lat: 10.574511,
        lng: -85.68
    });

    const [changedImages, setChangedImages] = useState(false);
      
    

    //Priv info edition
    const [privAdditional, setPrivAdditional] = useState([]);
    const [privDoor, setPrivDoor] = useState("");
    const [privWIFI, setPrivWIFI] = useState("");
    const [privId, setPrivId] = useState("");

    const [showingPriv, setShowingPriv] = useState(false);
    const [editingPrivInfo, setEditingPrivInfo] = useState(false);

    const savePrivInfo = async () => {
        if (privDoor == "" || privWIFI == "") {
            console.log("Found empty");
            return;
        }
        if (privId != "") {
            const propertyRef = doc(db, 'propertyPrivate', privId);
            await updateDoc(propertyRef, {
                Door: privDoor,
                WIFI: privWIFI,
                Additional: privAdditional,
            }).then(() => {
                console.log('update succesful')
                setEditingPrivInfo(false);
            })
        } else {
            console.log("priv Id not found");
        }
    }

    const [isValidPrivateEntry, setIsValidPrivateEntry] = useState(true);
    const [isNullPrivateEntry, setIsNullPrivateEntry] = useState(false);

    //Private info appender
    const [privInfoAddName, setPrivInfoAddName] = useState("");
    const [privInfoAddValue, setPrivInfoAddValue] = useState("");

    const addPrivInfo = () => {
        let name = privInfoAddName;
        let tempPrivInfoList = [...privAdditional];
        if (name.trim() == "" || privInfoAddValue.trim() == ""){
            setIsNullPrivateEntry(true);
            return;
        }
        if (tempPrivInfoList.indexOf(name) == -1) {
            setIsValidPrivateEntry(true);
            tempPrivInfoList.push({
                name: privInfoAddName,
                value: privInfoAddValue,
            })
       
            setPrivAdditional(tempPrivInfoList);
            resetPrivInfo();
        } else {
            //Show error of attribute already exists
            setIsValidPrivateEntry(false);
        }
    }

    const resetPrivInfo = () => {
        setPrivInfoAddName("")
        setPrivInfoAddValue("")
    }

    const removeFromPrivInfo = (name) => {
        let filtered = privAdditional.filter(item => item.name != name)
        setPrivAdditional(filtered);
    }

    //Property info load
    const [loaded, setLoaded] = useState(false);
    const loadPropertyInfo = async () => {
        if(id && !loaded){
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

                setLoaded(true);
                
                const tempCenter = {
                    lat: loc._lat,
                    lng: loc._long
                }
                setCenter(tempCenter);

                const locationTemp = {
                    name: name,
                    lat: loc._lat,
                    lng: loc._long,
                    id: 1
                }
                
                const tempArray = [];
                tempArray.push(locationTemp);
                setLocation(tempArray);

                //Load private info
                const scheduleRef = collection(db, 'propertyPrivate');
                const q = query(scheduleRef, where("Property", '==', propertyRef ));
                
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((res) => {
                    setPrivDoor(res.data().Door);
                    setPrivWIFI(res.data().WIFI);
                    setPrivAdditional(res.data().Additional);
                    setPrivId(res.id);
                });

             });
        }
    }

    const save = async () => {
        const len = images.length;
        let counter = 0;

        if (changedImages) {
            images.map(async (image) => {
                if(image.startsWith("data:image")) {
                    const imageRef = ref(storage, `properties/${id}/${uuid().slice(0,6)}`);
                    await uploadString(imageRef, image, "data_url").then(async snapshot => {
                        const downloadUrl = await getDownloadURL(imageRef);

                        images[counter] = downloadUrl;

                        if (counter == len - 1) {
                            updateDocument();
                        }
                    })
                }
                counter = counter + 1;
            })
        } else {
            updateDocument();
        }

        //TODO: make validation for empty fields
        
    
    }

    async function updateDocument() { //TODO: add location update
        await updateDoc(doc(db, 'properties', id), {
            name: name,
            description: description,
            address: address,
            region: region,
            cancellation: cancellation,
            houseRules: houseRules,
            msrp: msrp,
            baths: baths,
            bedrooms: bedrooms,
            beds: beds,
            guests: guests,
            images: images,
        }).then(function() {
            console.log('property updated succesfully');
            router.back();
        }).catch(function() {
            console.log('error updating')
        });
    }

    loadPropertyInfo();

    const [currentImage, setCurrentImage] = useState(0);

    const addImageToList = (e) => {
        const reader = new FileReader();
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0]);
        }

        reader.onload = (readerEvent) => {
            if(images.length == 0) {
                console.log('first entry');
                setCurrentImage(0);
            }
            let temp = [...images];
            temp.push(readerEvent.target.result);
            setImages(temp);
            setChangedImages(true);
        };
    }

    const removeImageFromList = () => {
        let len = images.length;

        if (len == 1) {
            console.log('cant delete your only image');
            return
        }
        // let temp = images.splice(currentImage, 1);
        // setImages(temp);
        setImages(images => {
            return images.filter((value, i) => i !== currentImage)
        })
        if (len - 1 == 0) {
            setCurrentImage(-1);
        } else {
            setCurrentImage((currentImage == 0 ? 0 : currentImage - 1 ));
        }        
    }

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
                        <div>
                            <section className='pt-6 border-b-2 pd-3 mb-2 grid grid-cols-4'>
                                <h2 className='text-3xl font-semibold pb-3 text-left col-span-3'>Edit Property</h2>
                                <div className='justify-end flex col-start-4'>
                                    <button className='bg-yellow-500 rounded-lg text-white text-sm sm:text-lg
                                    justify-end w-20 my-1 hover:bg-yellow-600 mr-2 px-2' onClick={() => router.back()}>Cancel</button>
                                    <button className='bg-blue-500 rounded-lg text-white text-sm sm:text-lg 
                                    justify-end w-24 my-1 hover:bg-blue-600 px-4' onClick={save}>Save</button>
                                </div>
                            </section>
                            <section className='flex'>
                                <div>
                                    <input ref={filePickerRef}
                                    type="file"
                                    hidden
                                    onChange={addImageToList}
                                    />
                                </div>
                                <div className='flex-rows w-full'>
                                    <div className='bg-primary p-3 items-center mx-10 lg:mx-10 rounded-full 
                                        px-auto sm:px-2 flex cursor-pointer opacity-90 hover:opacity-100 w-100 flex-1'
                                        onClick={()=> filePickerRef.current.click()}>
                                            <CameraIcon className='text-white mr-10 ml-5 w-6'/>
                                            <h2 className='text-white text-lg font-semibold text-center'>Add Images</h2>
                                    </div>
                                    { currentImage >= 0 ? 
                                        // Fix why image isn't cycling
                                        <div className='flex relative justify-center w-full bg-gray-200 rounded-sm mt-2'> 
                                            <div className='bg-black bg-opacity-30 absolute w-12 hover:bg-opacity-75 left-0 top-[50%]'>
                                                <ChevronLeftIcon onClick={prevImage} className='w-10 text-white 
                                                cursor-pointer my-3'/>
                                            </div>
                                            <img src={images[currentImage]} alt="Image of property"
                                            layout="fill" objectfit='cover' className='lg:mx-2 ml-auto mr-auto'/> 
                                            <div className='w-[50%] h-[50%] opacity-0 
                                                    hover:opacity-100 top-[50%] absolute left-[25%]
                                                    transition ease-out duration-200'>
                                                <XCircleIcon className=' w-14 text-red-500 top-[50%] absolute left-[50%]' onClick={removeImageFromList}/> 
                                            </div>
                                                

                                            <div className='bg-black bg-opacity-30 absolute right-0 w-12  hover:bg-opacity-75 top-[50%]'> 
                                                <ChevronRightIcon onClick={nextImage} className='text-white 
                                                w-10 cursor-pointer my-3'/>
                                            </div>
                                        </div>
                                    : 
                                        <img src={noImage.src} layout="fill" objectfit='cover' className='max-h-64 ml-auto mr-auto'/>
                                    }
                                </div>
                            </section>
                            <div className='px-2 justify-center'>
                                <div className='text-2xl font-semibold pt-2 flex w-full justify-between'>
                                    <input className='focus:ring-0 text-lg sm:text2xl font-bold' placeholder={name} onChange={(e)=> setName(e.target.value)}></input>
                                    <div className='flex m-2'>
                                        { status == 1 ? (
                                            <div className='w-4 h-4 rounded-full bg-green-500 flex'></div>
                                        ) : (
                                            <div className='w-4 h-4 rounded-full bg-red-500 flex'></div>
                                        )}
                                        <input className='font-semibold text-center text-sm sm:text2xl w-20' placeholder={'$' + msrp} onChange={(e)=> setMSRP(e.target.value)}/>
                                    </div>
                                </div>
                                <div className='mt-1 mb-2 text-xs sm:text-sm text-gray-40'>
                                    <p>{created}</p>
                                </div>
                                <div className='flex px-1'>
                                    <div className='flex pr-3 py-2 items-center'>
                                        <UserIcon className='text-gray-500 w-5 mr-3' />
                                        <input className='basicInput' type='number' min={0} placeholder={guests} onChange={(e) => setGuests(e.target.value)}/>
                                    </div>
                                    <div className='flex px-3 py-2 items-center'>
                                        <FaBed className='text-gray-500 w-5 mr-3' />
                                        <input className='basicInput' type='number' min={0} placeholder={beds} onChange={(e) => setBeds(e.target.value)}/>
                                    </div>
                                    <div className='flex px-3 py-2 items-center'>
                                        <BsFillDoorClosedFill className='text-gray-500 w-5 mr-3' />
                                        <input className='basicInput' type='number' min={0} placeholder={bedrooms} onChange={(e) => setBedrooms(e.target.value)}/>
                                    </div>
                                    <div className='flex px-3 py-2 items-center'>
                                        <FaBath className='text-gray-500 w-5 mr-3' />
                                        <input className='basicInput' type='number' min={0} placeholder={baths} onChange={(e) => setBaths(e.target.value)}/>
                                    </div>
                                </div>
                                <div className='flex mb-1'><p className='font-semibold mr-2'>Owner: </p>{owner}</div>
                                <div className='flex mb-1'><p className='font-semibold mr-2'>Region: </p>
                                    <input className='focus:ring-0' placeholder={region} onChange={(e)=> setRegion(e.target.value)}></input>
                                </div>
                                <textarea className='text-gray-600 text-sm mt-1 h-52 w-full break-words focus:ring-0'
                                 placeholder={description} value={description} onChange={(e)=> setDescription(e.target.value)}></textarea>
                                {/* Categories */}
                                <div className='flex mt-2'>
                                    {categories.map(function(category, i){
                                        return <p className='bg-primary text-white text-sm px-2 
                                        py-1 mr-1 rounded-lg cursor-pointer' key={i}>{category}</p>
                                    })}
                                </div>
                                {/* Amenities */}
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
                                <div className='mt-2 border-b-2 mx-5'/>
                                <div className='flex-col mt-3 align-bottom'>
                                    <h3 className='text-xl text-center mt-5'>Address</h3>
                                    <input className='text-center mt-3 text-sm mx-auto w-4/5 focus:ring-0' 
                                    placeholder={address} onChange={(e)=> setAddress(e.target.value)}/>
                                    <div className='relative mt-2 rounded-sm sm:px-10'>
                                        <BannerMap locations={location} zoomLevel={16} center={center}/>
                                    </div>
                                </div>
                                <div className='mt-2 border-b-2 sm:marker:mx-5'/>
                                    <div className='grid sm:grid-cols-2'>
                                        <div className='col-start-1 p-5'>
                                            <h2 className='text-xl text-center font-gray-500 mb-2'>House Rules</h2>
                                            <textarea className='text-sm w-full h-44' placeholder={houseRules} onChange={(e) => setHouseRules(e.target.value)}/>
                                        </div>
                                        <div className='sm:col-start-2 p-5'>
                                            <h2 className='text-xl text-center font-gray-500 mb-2'>Cancellation</h2>
                                            <textarea className='text-sm w-full h-44' placeholder={cancellation} onChange={(e) => setCancellation(e.target.value)}/>
                                        </div>

                                    </div>
                                </div>
                                <div className='mt-3 mx-auto'>
                                <div className='flex justify-between'>
                                    <h2 className='text-xl text-center font-gray-500 mb-2 font-semibold'>Private Information</h2>
                                    { showingPriv ? 
                                        <div className='flex'>
                                            <button className='text-white bg-primary bg-opacity-90 hover:bg-opacity-100 rounded-lg px-2 py-1 mr-1'
                                            onClick={() => setShowingPriv(false)}>Hide</button>
                                            {editingPrivInfo ? (
                                                <div className='flex'>
                                                    <button className='text-white bg-red-400 bg-opacity-90 hover:bg-opacity-100 rounded-lg px-2 py-1 mr-1'
                                                    onClick={() => setEditingPrivInfo(false)}>Cancel</button> 
                                                    <button className='text-white bg-blue-400 bg-opacity-90 hover:bg-opacity-100 rounded-lg px-2 py-1'
                                                    onClick={() => savePrivInfo()}>Save</button>                                                    
                                                </div>
                                            ): (
                                                <button className='text-white bg-yellow-400 bg-opacity-90 hover:bg-opacity-100 rounded-lg px-2 py-1'
                                                onClick={() => setEditingPrivInfo(true)}>Edit</button>
                                            )}
                                        </div>
                                    :
                                        <button className='text-white bg-primary bg-opacity-90 hover:bg-opacity-100 rounded-lg px-2 py-1'
                                        onClick={() => setShowingPriv(true)}>Show</button>
                                    }
                                </div>
                                { showingPriv && (
                                    <div className='mx-5'>
                                        <div className='flex my-1'>
                                            <KeyIcon className='w-10 text-white bg-primary p-2 mr-2 rounded-full'/>
                                            {editingPrivInfo ? (
                                                <input value={privDoor} type='password' onChange={(e) => setPrivDoor(e.target.value)} />
                                            ): (
                                                <p className='mt-2'>{privDoor}</p>
                                            )}
                                        </div>
                                        <div className='flex my-1'>
                                            <WifiIcon className='w-10 text-white bg-primary p-2 mr-2 rounded-full'/>
                                            {editingPrivInfo ? (
                                                <input value={privWIFI} type='password' onChange={(e) => setPrivWIFI(e.target.value)} />
                                            ): (
                                                <p className='mt-2'>{privWIFI}</p>
                                            )}
                                        </div>
                                        {!editingPrivInfo ? (
                                            <div>
                                                <h2 className='text-lg font-gray-500 mt-2 mb-1'>Additional Info</h2>
                                                {privAdditional.map((info) => {
                                                    return <div key={info.name} className='flex text-white bg-primary rounded-full px-2 sm:px-5 my-1 sm:mx-4 w-fit'> 
                                                        <p className='pl-1'>{info.name}</p>:
                                                        <p className='px-1'>{info.value}</p>
                                                    </div>
                                                })}
                                            </div>
                                        ) : (
                                            <div>
                                                <div className='flex justify-between'>
                                                    <h3 className='text-gray-400 font-semibold pl-2'>Add more information</h3>
                                                    <PlusCircleIcon className='text-primary mx-5  w-8 hover:scale-110 transition duration-150 ease-out' onClick={addPrivInfo} />
                                                </div>
                                                { !isValidPrivateEntry && (
                                                    <div className='bg-red-400 text-white px-3 text-sm text-center mx-auto my-2'><h4>This name already exists</h4></div>
                                                )}
                                                { isNullPrivateEntry && (
                                                    <div className='bg-red-400 text-white px-3 text-sm text-center mx-auto my-2'><h4>All values must be filled</h4></div>
                                                )}
                                                <div className='w-full px-2 py-1'>
                                                    <div className='px-2 py-1'>
                                                        <h3 className='text-sm text-gray-500'>Name</h3>
                                                        <input
                                                        className='basicInput'
                                                        type="text"
                                                        value={privInfoAddName}
                                                        onChange={(e)=> setPrivInfoAddName(e.target.value)}
                                                        placeholder="" />
                                                    </div>
                                                    <div className='px-2 py-1'>
                                                        <h3 className='text-sm text-gray-500'>Content</h3>
                                                        <input
                                                        className='basicInput'
                                                        type="text"
                                                        value={privInfoAddValue}
                                                        onChange={(e)=> setPrivInfoAddValue(e.target.value)}
                                                        placeholder="" />
                                                    </div>
                                                </div>
                                                <div className='h-fit w-full'>
                                                    {privAdditional.map(function(privInfo, i){
                                                        return <div key={i} className="w-fit shadow-sm rounded-lg px-5 py-1 flex mx-auto">
                                                            <h3 className='text-lg font-semibold mx-3'>{privInfo.name}:</h3>
                                                            <h3 className='text-sm text-gray-500 my-1'>{privInfo.value}</h3>
                                                            <XCircleIcon className='w-8 text-primary mx-3 hover:scale-110 transition duration-150 ease-out' onClick={() => removeFromPrivInfo(privInfo.name)} />
                                                        </div>
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                                        
                                    </div>
                                )}
                                

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

export default edit