import React, { useState, useRef } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { OfficeBuildingIcon, ShoppingBagIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BanIcon, CameraIcon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon, CheckIcon } from '@heroicons/react/solid';
import noImage from '../../../assets/noImage.png';

import { v4 as uuid } from 'uuid';

// Firebase
import { db, storage } from '../../../firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { ref, getDownloadURL, uploadString } from 'firebase/storage';

function add() {
    const router = useRouter();
    const {data: session} = useSession();
    const { id } = router.query;

    const [loading, setLoading] = useState(false);
    const descRef = useRef(null);
    const limitRef = useRef(null);
    const propertyRef = useRef(null);

    const [propertyName, setPropertyName] = useState(""); 
    const [propertyDocRef, setPropertyDocRef] = useState("");

    const [propertyValidated, setPropertyValidated] = useState(false);
    const [propertyInvalid, setPropertyInvalid] = useState(false);



    const searchForProperty = async () => {
        const propertiesRef = collection(db, 'properties');
        const q = query(propertiesRef, where("name", '==', propertyRef.current.value ));
        
        const querySnapshot = await getDocs(q);

        if(querySnapshot.empty) {
            setPropertyInvalid(true);
            setPropertyValidated(false);
        }

        querySnapshot.forEach((doc) => {
            setPropertyName(doc.data().name);

            setPropertyValidated(true);
            setPropertyDocRef(doc.id);
            setPropertyInvalid(false);
        });
    }

    const createAvailability = async () => {
        if(loading) {
            return;
        }
        setLoading(true);

        if(!descRef.current.value || !propertyRef.current.value) {
                //TODO: show error
                console.log('error message');
                setLoading(false);
                return
        }
        //TODO: Avail property validation

        if(!limitRef.current.value) {
            limitRef.current.value = 0
        }

        //Create a item
        const docRef = await addDoc(collection(db, 'itemAvail'), {
            description: descRef.current.value,
            created: serverTimestamp(),
            status: '1',
            ordered: 0,
            limit: limitRef.current.value,
            property: doc(db,'properties',propertyDocRef),
            property_name: propertyName,
            item: doc(db,'items',id)
        }).then(

            router.back()
        ).catch(
            console.log('Error')
        ); 
    }    

  return (
    <div className="bg-gray-200 h-full min-h-screen">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
            {session && session.user.isAdmin ? (
                <>
                    <div>
                        { propertyValidated && 
                            <div className='px-5 py-1 bg-primary text-white text-center mb-2'>
                                Property Validated
                            </div>
                        }
                        { propertyInvalid && 
                            <div className='px-5 py-1 bg-red-500 text-white text-center mb-2'>
                                Invalid Property
                            </div>
                        }
                        <div
                        className="mx-auto flex items-center justify-center h-12 w-12 rounded-full
                        bg-gray-100"
                        >
                            <ShoppingBagIcon
                            className='h-6 w-6 text-primary'
                            aria-hidden="true" />
                        </div>
                        <h3 className="text-lg leading-6 font-semibold text-gray-900 text-center">
                            Create an Item
                        </h3>
                        <div className='mt-2'>
                            <div className='text-center mt-5 sm:px-2'>
                                <h2 className='text-gray-900 text-lg font-medium'>Basic Information</h2>
                                <div className='mt-2 flex'>
                                    <input
                                    className='basicInput'
                                    type="text"
                                    ref={propertyRef}
                                    placeholder="Property Name" />
                                    <button onClick={() => searchForProperty()} className='bg-primary rounded-lg 
                                    text-white ml-3 bg-opacity-90 hover:bg-opacity-100'>
                                        <CheckIcon className='w-5 m-3' />
                                    </button>
                                </div>
                                <div className='mt-2'>
                                    <textarea
                                    className='basicInput h-64'
                                    type="text"
                                    ref={descRef}
                                    placeholder="Description" />
                                </div>
                                <div className='mt-2'>
                                    <input
                                    className='basicInput'
                                    type="number"
                                    ref={limitRef}
                                    placeholder="Limit" />
                                </div>
                            </div>
                            <div className='mt-5 '>

                            </div>
                        </div>

                        <div className='mt-5 sm:mt-6'>
                            <button type='button' className='inline-flex justify-center w-full rounded-md
                            border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium bg-opacity-90
                            text-white hover:bg-opacity-100 focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-primary sm:text-sm disabled:bg-gray-300
                            disabled:cursor-not-allowed hover:disabled:bg-gray-300' 
                            onClick={createAvailability}
                            disabled={!descRef || !propertyValidated}>
                                {loading ? "Creating..." : "Create Availability"}
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