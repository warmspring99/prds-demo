import React, { useState, useRef, useEffect } from 'react';
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

    // Provider Information states
    const [name, setName] = useState('Default name');
    const [created, setCreated] = useState('jan');
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('');

    const [location, setLocation] = useState([]);
    
    const [center, setCenter] = useState({
        lat: 10.574511,
        lng: -85.68
    });

    useEffect(async () => {
        if(id){
            loadProviderInfo();
        }
    }, [id]);

    const loadProviderInfo = async () => {
        if(id){
            const providersRef = doc(db, 'providers', id);
            const unsub = await getDoc(providersRef).then(async (doc) => {
                if (!doc.exists()) {
                    router.push({
                        pathname: "/generics/not_found",
                      });

                    return;
                }
                setName(doc.data().name);
                setCreated(doc.data().created.toDate().toDateString());
                setPhone(doc.data().phone);
                setAddress(doc.data().address);
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
                    price: 0,
                }
                
                const tempArray = [];
                tempArray.push(locationTemp);
                setLocation(tempArray);
            });
        }
    }

    const save = async () => {
        updateDocument();
        //TODO: make validation for empty fields
    }

    async function updateDocument() { //TODO: add location update
        await updateDoc(doc(db, 'providers', id), {
            name: name,
            address: address,
            phone: phone,
        }).then(function() {
            console.log('provider updated succesfully');
            router.back();
        }).catch(function() {
            console.log('error updating')
        });
    }

    return (
        <div className="bg-gray-200">
            <Header></Header>
            <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
                {session && session.user.isAdmin ? (
                    <>
                        <div>
                            <section className='pt-6 border-b-2 pd-3 mb-2 grid grid-cols-4'>
                                <h2 className='text-3xl font-semibold pb-3 text-left col-span-3'>Edit Provider</h2>
                                <div className='justify-end flex col-start-4'>
                                    <button className='bg-yellow-500 rounded-lg text-white text-sm sm:text-lg
                                    justify-end w-20 my-1 hover:bg-yellow-600 mr-2 px-2' onClick={() => router.back()}>Cancel</button>
                                    <button className='bg-blue-500 rounded-lg text-white text-sm sm:text-lg 
                                    justify-end w-24 my-1 hover:bg-blue-600 px-4' onClick={save}>Save</button>
                                </div>
                            </section>
                            <div className='px-2 justify-center'>
                                <div className='text-2xl font-semibold pt-2 flex w-full justify-between'>
                                    <input className='focus:ring-0 text-lg sm:text2xl font-bold' placeholder={name} onChange={(e)=> setName(e.target.value)}></input>
                                    {/* <div className='flex m-2'>
                                        { status == 1 ? (
                                            <div className='w-4 h-4 rounded-full bg-green-500 flex'></div>
                                        ) : (
                                            <div className='w-4 h-4 rounded-full bg-red-500 flex'></div>
                                        )}
                                    </div> */}
                                </div>
                                <div className='mt-1 mb-2 text-xs sm:text-sm text-gray-40'>
                                    <p>{created}</p>
                                </div>
                                <div className='flex'><p className='font-semibold mr-2'>Email: </p>{id}</div>
                                <div className='flex mb-1'><p className='font-semibold mr-2'>Phone: </p>
                                    <input className='focus:ring-0' placeholder={phone} onChange={(e)=> setPhone(e.target.value)}></input>
                                </div>
                                <div className='mt-2 border-b-2 mx-5'/>
                                <div className='mt-3 justify-center mx-auto'>
                                    <h3 className='text-xl text-center mt-5'>Address</h3>
                                    <textarea className='text-center mt-3 text-sm focus:ring-0 w-3/4 self-center mx-[14%]' 
                                    placeholder={address} onChange={(e)=> setAddress(e.target.value)}/>
                                    <div className='relative mt-2 rounded-sm sm:px-10'>
                                        <BannerMap locations={location} zoomLevel={16} center={center}/>
                                    </div>
                                </div>
                                <div className='mt-2 border-b-2 sm:marker:mx-5'/>
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