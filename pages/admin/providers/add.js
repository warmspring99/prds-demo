import React, { useState, useRef } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { BriefcaseIcon, OfficeBuildingIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BanIcon, CameraIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon, PlusCircleIcon } from '@heroicons/react/solid';
import { FaBed, FaBath } from "react-icons/fa";
import { BsFillDoorClosedFill } from "react-icons/bs";
import BannerMap from '../../../components/BannerMap';
import noImage from '../../../assets/noImage.png';

// Firebase
import { db } from '../../../firebase';
import { doc, serverTimestamp, GeoPoint, setDoc } from 'firebase/firestore';

function add() {
    const router = useRouter();
    const {data: session} = useSession();

    const nameRef = useRef(null);
    const addressRef = useRef(null);
    const locationRef = useRef(null);
    const phoneRef = useRef(null);
    const emailRef = useRef(null);

    const latitudeRef = useRef(null);
    const longitudeRef = useRef(null);

    const createProvider = async () => {
        if(loading) {
            return;
        }
        setLoading(true);

        if(!nameRef.current.value || !addressRef.current.value 
            || !latitudeRef.current.value || !longitudeRef.current.value
            || !phoneRef.current.value || !emailRef.current.value) {
                //TODO: show error
                console.log('error message');
                setLoading(false);
                return
        }

        //Create a provider
        const docRef = await setDoc(doc(db, 'providers',emailRef.current.value), {
            name: nameRef.current.value,
            created: serverTimestamp(),
            location: new GeoPoint(latitudeRef.current.value, longitudeRef.current.value),
            status: '1',
            address: addressRef.current.value,
            phone: phoneRef.current.value,

        }).then(async (snapshot) => {
            console.log('provider created')
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
                            <BriefcaseIcon
                            className='h-6 w-6 text-primary'
                            aria-hidden="true" />
                        </div>
                        <h3 className="text-lg leading-6 font-semibold text-gray-900 text-center">
                            Create a provider
                        </h3>
                        <div className='grid mt-2 grid-cols-1'>
                            <div className='text-center mt-5 sm:px-2'>
                                <h2 className='text-gray-900 text-lg font-medium'>Basic Information</h2>
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
                                    ref={phoneRef}
                                    placeholder="Phone number" />
                                </div>
                                <div className='mt-2'>
                                    <input
                                    className='basicInput'
                                    type="text"
                                    min={1}
                                    ref={emailRef}
                                    placeholder="Email" />
                                </div>
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

                        <div className='mt-5 sm:mt-6'>
                            <button type='button' className='inline-flex justify-center w-full rounded-md
                            border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium bg-opacity-90
                            text-white hover:bg-opacity-100 focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-primary sm:text-sm disabled:bg-gray-300
                            disabled:cursor-not-allowed hover:disabled:bg-gray-300' 
                            onClick={createProvider}
                            disabled={!nameRef || !emailRef || !phoneRef}>
                                {loading ? "Creating..." : "Create Provider"}
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