//Next.js and React imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Footer from '../../../components/Footer';

//Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

//Iconography imports
import { BanIcon, LocationMarkerIcon } from '@heroicons/react/solid';

//Custom Components
import Header from '../../../components/Header';
import BannerMap from '../../../components/BannerMap';

function info() {
    // Navigation and session information
    const router = useRouter();
    const {data: session} = useSession();
    const { id } = router.query;

    // Provider Information states
    const [name, setName] = useState('Default name');
    const [created, setCreated] = useState('jan');
    const [phone, setPhone] = useState('')
    const [location, setLocation] = useState([]);
    const [address, setAddress] = useState('');
    
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

    // // Property Disabeling information TODO: Make provider deletion?
    // const onDelete = async () => {
    //     if (status == "1"){
    //         await updateDoc(doc(db, 'properties', id), {
    //             status: "2"
    //         }).then(function() {
    //             setStatus('2')
    //         }).catch(function() {
    //             console.log('error updating')
    //         });
    
    //     } else {
            
    //         await updateDoc(doc(db, 'properties', id), {
    //             status: "1"
    //         }).then(function() {
    //             setStatus('1');
    //         }).catch(function() {
    //             console.log('error updating')
    //         });
    //     }
    // }

    // Edition page routing
    const getInfo = () => {
        router.push({
            pathname: "/admin/providers/edit",
            query: {
              id: id,
            }
          });
    }

    // Schedule history page routing
    const openProviderOrderHistory = () => {
        router.push({
            pathname: "/provider/pending",
            query: {
              id: id,
            }
          });
    }
    
  return (
    <div className="bg-gray-200">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
            {session && session.user.isAdmin ? (
                <>
                    <div className='mb-10 pb-10'>
                        <section className='pt-6 border-b-2 pd-3 mb-2 grid grid-cols-4'>
                            <h2 className='text-3xl font-semibold pb-3 text-left col-span-3'>Provider Info</h2>
                            <div className='justify-end flex col-start-4'>
                                <button className='bg-yellow-500 rounded-lg text-white text-sm sm:text-lg
                                justify-end w-20 my-1 hover:bg-yellow-600 mr-2 px-2' onClick={getInfo}>Edit</button>
                            </div>
                            {/* <div className='justify-end flex col-start-4'>
                                <button className='bg-yellow-500 rounded-lg text-white text-sm sm:text-lg
                                justify-end w-20 my-1 hover:bg-yellow-600 mr-2 px-2' onClick={getInfo}>Edit</button>
                                {status == 1 ? 
                                <button className='bg-red-500 rounded-lg text-white text-sm sm:text-lg 
                                justify-end w-24 my-1 hover:bg-red-600 px-4' onClick={onDelete}>Delete</button>
                                :
                                <button className='bg-green-500 rounded-lg text-white text-sm sm:text-lg 
                                justify-end w-24 my-1 hover:bg-green-600 px-4' onClick={onDelete}>Activate</button>
                                }
                            </div> */}
                        </section>
                        <div className='relative mt-2 rounded-sm sm:px-10'>
                            <BannerMap locations={location} zoomLevel={16} center={center}/>
                        </div>
                        <div className='px-2 justify-center'>
                            <h2 className='text-2xl font-semibold pt-2 flex'>
                                <p className='mr-2 flex-1'>{name}</p>
                                {/* { status == 1 ? (
                                    <div className='w-4 h-4 rounded-full bg-green-500 flex m-2'></div>
                                ) : (
                                    <div className='w-4 h-4 rounded-full bg-red-500 flex m-2'></div>
                                )} */}
                            </h2>
                            <div className='mt-1 mb-2 te xt-sm text-gray-40'>
                                <p>{created}</p>
                            </div>
                            <div className='flex'><p className='font-semibold mr-2'>Email: </p>{id}</div>
                            <div className='flex'><p className='font-semibold mr-2'>Phone: </p>{phone}</div>
                            <div className='flex'><p className='font-semibold mr-2'>Address: </p>{address}<LocationMarkerIcon className='w-4 text-gray-500 ml-1' /></div>                           
                            <div className='mt-2 border-b-2 mx-5'/>
                            <div className='flex-col mt-3 align-bottom justify-center'>
                                <div className='bg-primary mx-auto px-4 py-2 text-white text-semibold text-lg  mt-4
                                text-center rounded-lg hover:bg-opacity-100 bg-opacity-90 cursor-pointer' onClick={() => openProviderOrderHistory()}>
                                    <h2>Provider Managment Tool</h2>
                                </div>
                                                               
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