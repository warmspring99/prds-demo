import React, { useState, useRef } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { OfficeBuildingIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BanIcon, LocationMarkerIcon, CameraIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon, PlusCircleIcon } from '@heroicons/react/solid';
import { FaBed, FaBath } from "react-icons/fa";
import { BsFillDoorClosedFill } from "react-icons/bs";
import BannerMap from '../../../components/BannerMap';
import noImage from '../../../assets/noImage.png';

import { v4 as uuid } from 'uuid'

// Firebase
import { db, storage } from '../../../firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc, GeoPoint } from 'firebase/firestore';
import { ref, getDownloadURL, uploadString } from 'firebase/storage';

function add() {
    const router = useRouter();
    const {data: session} = useSession();

    const filePickerRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const nameRef = useRef(null);
    const descRef = useRef(null);
    const addressRef = useRef(null);
    const locationRef = useRef(null);
    const regionRef = useRef(null);
    const categoryRef = useRef(null);
    const msrpRef = useRef(null);
    const guestsRef = useRef(null);
    const bedroomsRef = useRef(null);
    const bedsRef = useRef(null);
    const bathsRef = useRef(null);
    const cancellationDataRef = useRef(null);
    const amenitiesRef = useRef(null);
    const ownerRef = useRef(null);
    const houseRules = useRef(null);

    //Private info ()
    const wifiPass = useRef(null);
    const doorPass = useRef(null);
    const [privInfoList, setPrivInfoList] = useState([]);

    const [isValidPrivateEntry, setIsValidPrivateEntry] = useState(true);
    const [isNullPrivateEntry, setIsNullPrivateEntry] = useState(false);

    //Private info appender
    const [privInfoAddName, setPrivInfoAddName] = useState("");
    const [privInfoAddValue, setPrivInfoAddValue] = useState("");

    const addPrivInfo = () => {
        let name = privInfoAddName;
        let tempPrivInfoList = [...privInfoList];
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
       
            setPrivInfoList(tempPrivInfoList);
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

        let filtered = privInfoList.filter(item => item.name != name)
        setPrivInfoList(filtered);
    }


    const latitudeRef = useRef(null);
    const longitudeRef = useRef(null);

    const [images, setImages] = useState([]);
    const [currentImage, setCurrentImage] = useState(-1);

    const addImageToList = (e) => {
        const reader = new FileReader();
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0]);
        }

        reader.onload = (readerEvent) => {
            if(images.length == 0) {
                setCurrentImage(0);
            }
            let temp = [...images];
            temp.push(readerEvent.target.result);
            setImages(temp);
        };
    }

    const removeImageFromList = () => {
        let len = images.length;
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

    const createProperty = async () => {
        if(loading) {
            return;
        }
        setLoading(true);

        if(!nameRef.current.value || !descRef.current.value || !addressRef.current.value 
            || !regionRef.current.value || !msrpRef.current.value || images.length < 1
            || !guestsRef.current.value || !bedroomsRef.current.value 
            || !bedsRef.current.value || !bathsRef.current.value 
            || !amenitiesRef.current.value || !ownerRef.current.value
            || !latitudeRef.current.value || !longitudeRef.current.value
            || !wifiPass.current.value || !doorPass.current.value) {
                //TODO: show error
                console.log('error message');
                setLoading(false);
                return
        }

        const cat = categoryRef.current.value || '';
        const catList = cat.split(' ');
        const amenities = amenitiesRef.current.value || '';
        const amenitiesList = amenities.split(' ');

        //TODO: make owner validation and auto add

        //Create a property
        const docRef = await addDoc(collection(db, 'properties'), {
            name: nameRef.current.value,
            categories: catList, //nullable
            description: descRef.current.value,
            timestamp: serverTimestamp(),
            images: [],
            location: new GeoPoint(latitudeRef.current.value, longitudeRef.current.value),
            owner: ownerRef.current.value,
            owner_id: ownerRef.current.value,
            region: regionRef.current.value,
            status: '1',
            msrp: Number(msrpRef.current.value),
            guests: Number(guestsRef.current.value),
            bedrooms: Number(bedroomsRef.current.value),
            beds: Number(bedsRef.current.value),
            baths: Number(bathsRef.current.value),
            address: addressRef.current.value,
            cancellation: cancellationDataRef.current.value, //nullable
            amenities: amenitiesList,
            houseRules: houseRules.current.value, //nullable

        }).then(async (snapshot) => {
            const id = snapshot.id;
            //Create images in storage in folder with property id
            let imageLinks = [];
            const len = images.length - 1;
            
            const privInfoRef = await addDoc(collection(db, 'propertyPrivate'), {
                WIFI: wifiPass.current.value,
                Door: doorPass.current.value,
                Additional: privInfoList,
                Property: doc(db, 'properties', id),
            })

            let counter = 0;
            images.map(async (image, i) => {
                const imageRef = ref(storage, `properties/${id}/${uuid().slice(0,6)}`);
                await uploadString(imageRef, image, "data_url").then(async snapshot => {
                    const downloadUrl = await getDownloadURL(imageRef);

                    imageLinks.push(downloadUrl);
                    
                    if (len == counter) {

                        await updateDoc(doc(db,'properties',id), {
                            images: imageLinks
                        });

                        router.back();
                    }

                    counter = counter + 1;
                })
            })
        });
        
        
    }

    const [location, setLocation] = useState([
        {
            name: 'New Point',
            lat: 10.574511,
            lng: -85.68,
            id: 1,
            price: 'your price',
        }
    ]);

    

    const changeLatitude = (value) => {
        let tempLocation = [...location];

        tempLocation[0].lat = Number(value);

        setLocation(tempLocation);
    }

    const changeLongitude = (value) => {
        let tempLocation = [...location];

        tempLocation[0].lng = Number(value);

        setLocation(tempLocation);
    }

  return (
    <div className="bg-gray-200 h-full">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
            {session && session.user.isAdmin ? (
                <>
                    <div>
                        <div
                        className="mx-auto flex items-center justify-center h-12 w-12 rounded-full
                        bg-gray-100"
                        >
                            <OfficeBuildingIcon
                            className='h-6 w-6 text-primary'
                            aria-hidden="true" />
                        </div>
                        <h3 className="text-lg leading-6 font-semibold text-gray-900 text-center">
                            Create a property
                        </h3>
                        <div className='grid md:grid-cols-2 mt-2 grid-cols-1'>
                            <div className='text-center mt-5 sm:px-2'>
                                <h2 className='text-gray-900 text-lg font-medium'>Basic Information</h2>
                                <div>
                                    <input ref={filePickerRef}
                                    type="file"
                                    hidden
                                    onChange={addImageToList}
                                    />
                                </div>

                                <div className='mt-2'>
                                    <input
                                    className='basicInput'
                                    type="text"
                                    ref={nameRef}
                                    placeholder="Name" />
                                </div>
                                <div className='mt-2'>
                                    <input
                                    className='basicInput'
                                    type="text"
                                    ref={regionRef}
                                    placeholder="Region" />
                                </div>
                                <div className='mt-2'>
                                    <input
                                    className='basicInput'
                                    type="number"
                                    min={1}
                                    ref={msrpRef}
                                    placeholder="MSRP day" />
                                </div>
                                <div className='mt-2'>
                                    <input
                                    className='basicInput'
                                    type="text"
                                    ref={ownerRef}
                                    placeholder="Owner Email" />
                                </div>
                                <div className='mt-2'>
                                    <textarea
                                    className='basicInput h-64'
                                    type="text"
                                    ref={descRef}
                                    placeholder="Description" />
                                </div>
                            </div>
                            <div className='mt-5 '>
                                <div className='bg-primary p-3 items-center mx-5 lg:mx-10 rounded-full 
                                px-auto sm:px-2 flex cursor-pointer opacity-90 hover:opacity-100'
                                 onClick={()=> filePickerRef.current.click()}>
                                    <CameraIcon className='text-white mr-10 ml-5 w-6'/>
                                    <h2 className='text-white text-lg font-semibold text-center'>Add Images</h2>
                                </div>
                                <div className='row-start-2 rounded-lg mt-3 h-64 max-h-64 max-w-2xl mx-10'>
                                    { currentImage >= 0 ? 
                                        <div className='flex relative justify-center h-64 bg-gray-200'> 
                                            <div className='bg-black bg-opacity-30 absolute h-64 w-12 hover:bg-opacity-75 left-0'>
                                                <ChevronLeftIcon onClick={prevImage} className='w-10 text-white 
                                                cursor-pointer pt-24 mt-3'/>
                                            </div>

                                            <img src={images[currentImage]} alt="Image of property"
                                            layout="fill" objectfit='cover' className='max-h-64 lg:mx-2 ml-auto mr-auto'/> 
                                            <XCircleIcon className=' w-14 text-red-500 opacity-0 
                                            hover:opacity-100 top-[75%] absolute 
                                            transition ease-out duration-200' onClick={removeImageFromList}/>

                                            <div className='bg-black bg-opacity-30 absolute right-0 top-0 h-64 w-12  hover:bg-opacity-75'> 
                                                <ChevronRightIcon onClick={nextImage} className='text-white 
                                                w-10 cursor-pointer pt-24 mt-3'/>
                                            </div>

                                        </div>
                                    :
                                        <img src={noImage.src} layout="fill" objectfit='cover' className='max-h-64 ml-auto mr-auto'/>
                                    }
                                </div>
                                
                                <div className='items-end align-sub mt-3'>
                                    {/* category picker */}
                                <div className='mt-2'>
                                    <input
                                    className='basicInput'
                                    type="text"
                                    ref={categoryRef}
                                    placeholder="Categories (temporal)" />
                                </div>
                                {/* amenity picker */}
                                <div className='mt-2'>
                                    <input
                                    className='basicInput'
                                    type="text"
                                    ref={amenitiesRef}
                                    placeholder="Amenities (temporal)" />
                                </div>
                                {/* capacity information */}
                                <div className='flex justify-around px-5'>
                                    <div className='flex px-3 py-2 items-center'>
                                        <UserIcon className='text-gray-500 w-8 mr-1' />
                                        <input
                                        className='basicInput'
                                        type="number"
                                        min={0}
                                        ref={guestsRef}
                                        placeholder="" />
                                    </div>
                                    <div className='flex px-3 py-2 items-center'>
                                        <FaBed className='text-gray-500 w-8 mr-1' />
                                        <input
                                        className='basicInput'
                                        type="number"
                                        min={0}
                                        ref={bedsRef}
                                        placeholder="" />
                                    </div>
                                    <div className='flex px-3 py-2 items-center'>
                                        <BsFillDoorClosedFill className='text-gray-500 w-8 mr-1' />
                                        <input
                                        className='basicInput'
                                        type="number"
                                        min={0}
                                        ref={bedroomsRef}
                                        placeholder="" />
                                    </div>
                                    <div className='flex px-3 py-2 items-center'>
                                        <FaBath className='text-gray-500 w-8 mr-1' />
                                        <input
                                        className='basicInput'
                                        type="number"
                                        min={0}
                                        ref={bathsRef}
                                        placeholder="" />
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                        {/* documents */}
                        <div className='grid sm:grid-cols-2 mt-2 grid-cols-1'>
                            <div className='mt-2 col-start-1 mx-2'>
                                <textarea
                                className='basicInput h-64'
                                type="text"
                                ref={houseRules}
                                placeholder="House Rules" />
                            </div>
                            <div className='mt-2 sm:col-start-2 mx-2'>
                                <textarea
                                className='basicInput h-64'
                                type="text"
                                ref={cancellationDataRef}
                                placeholder="Cancellation Rules" />
                            </div>
                        </div>
                        {/* map features */}
                        <div className='mt-5'>
                            <h2 className='text-gray-900 text-lg font-medium'>Location Information</h2>
                            {/* map picker */}
                            <div className='mt-3'>
                                <div>
                                    <h3 className='text-gray-500 px-2'>Address</h3>
                                    <div className='mt-2'>
                                        <input
                                        className='basicInput'
                                        type="text"
                                        ref={addressRef}
                                        placeholder="Address" />
                                    </div>
                                    <div className='grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 mb-5 mt-3'>
                                        <div className='px-2'>
                                            <h3 className='text-sm text-gray-500'>Latitude</h3>
                                            <input
                                            className='basicInput'
                                            type="number"
                                            ref={latitudeRef}
                                            onChange={(e) => {changeLatitude(e.target.value)}}
                                            placeholder={location[0].lat} />
                                        </div>
                                        <div className='px-2'>
                                            <h3 className='text-sm text-gray-500'>Longitude</h3>
                                            <input
                                            className='basicInput'
                                            type="number"
                                            ref={longitudeRef}
                                            onChange={(e) => {changeLongitude(e.target.value)}}
                                            placeholder={location[0].lng} />
                                        </div>
                                    </div>
                                    
                                </div>
                                <BannerMap className='mt-5' locations={location}/>
                            </div>
                        </div>
                        <div className='pt-3'>
                            <h2 className='text-gray-900 text-lg font-medium'>Security Information</h2>
                            <div className='grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 mb-5 mt-3'>
                                <div className='px-2'>
                                    <h3 className='text-sm text-gray-500'>Door Password</h3>
                                    <input
                                    className='basicInput'
                                    type="password"
                                    ref={doorPass}
                                    placeholder="" />
                                </div>
                                <div className='px-2'>
                                    <h3 className='text-sm text-gray-500'>WIFI Password</h3>
                                    <input
                                    className='basicInput'
                                    type="password"
                                    ref={wifiPass}
                                    placeholder="" />
                                </div>
                            </div>
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
                                {privInfoList.map(function(privInfo, i){
                                    return <div key={i} className="w-fit shadow-sm rounded-lg px-5 py-1 flex mx-auto">
                                        <h3 className='text-lg font-semibold mx-3'>{privInfo.name}:</h3>
                                        <h3 className='text-sm text-gray-500 my-1'>{privInfo.value}</h3>
                                        <XCircleIcon className='w-8 text-primary mx-3 hover:scale-110 transition duration-150 ease-out' onClick={() => removeFromPrivInfo(privInfo.name)} />
                                    </div>
                                })}
                            </div>
                        </div>
                        <div className='mt-5 sm:mt-6'>
                            <button type='button' className='inline-flex justify-center w-full rounded-md
                            border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium bg-opacity-90
                            text-white hover:bg-opacity-100 focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-primary sm:text-sm disabled:bg-gray-300
                            disabled:cursor-not-allowed hover:disabled:bg-gray-300' 
                            onClick={createProperty}
                            disabled={!nameRef}>
                                {loading ? "Creating..." : "Create Property"}
                            </button>
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

export default add