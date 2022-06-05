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
import { addDoc, collection, doc, serverTimestamp, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL, uploadString } from 'firebase/storage';

function customAdd() {
    const router = useRouter();
    const {data: session} = useSession();

    const createItem = async () => {
        if(loading) {
            return;
        }
        setLoading(true);

        if(!nameRef.current.value || !descRef.current.value || 
            !msrpRef.current.value || images.length < 1 || !providerRef.current.value) {
                //TODO: show error
                console.log('error message');
                setLoading(false);
                return
        }

        const cat = categoryRef.current.value || '';
        const catList = cat.split(' ');        

        //TODO: Items provider validation

        //Create a item
        const docRef = await addDoc(collection(db, 'items'), {
            name: nameRef.current.value,
            categories: catList, //nullable
            description: descRef.current.value,
            created: serverTimestamp(),
            images: [],
            status: '1',
            price: Number(msrpRef.current.value),
            ordered: 0,
            review_avg: 0,
            provider: doc(db,'providers',providerDocRef),
            provider_name: providerName
        }).then(async (snapshot) => {
            const id = snapshot.id;
            //Create images in storage in folder with item id
            let imageLinks = [];
            const len = images.length - 1;
            
            let counter = 0;
            images.map(async (image, i) => {
                const imageRef = ref(storage, `items/${id}/${uuid().slice(0,6)}`);
                await uploadString(imageRef, image, "data_url").then(async snapshot => {
                    const downloadUrl = await getDownloadURL(imageRef);

                    imageLinks.push(downloadUrl);
                    
                    if (len == counter) {

                        await updateDoc(doc(db,'items',id), {
                            images: imageLinks
                        });

                        router.back();
                    }

                    counter = counter + 1;
                })
            })
        });
        
        
    }    

  return (
    <div className="bg-gray-200 h-full min-h-screen">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
            {session && session.user.isAdmin ? (
                <>
                    <div>
                        { providerValidated && 
                            <div className='px-5 py-1 bg-primary text-white text-center mb-2'>
                                Provider Validated
                            </div>
                        }
                        { providerInvalid && 
                            <div className='px-5 py-1 bg-red-500 text-white text-center mb-2'>
                                Invalid Provider
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
                                    type="number"
                                    min={1}
                                    ref={msrpRef}
                                    placeholder="Price" />
                                </div>
                                <div className='mt-2 flex'>
                                    <input
                                    className='basicInput'
                                    type="text"
                                    ref={providerRef}
                                    placeholder="Provider Name" />
                                    <button onClick={() => searchForProvider()} className='bg-primary rounded-lg 
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
                                </div>
                            </div>
                        </div>

                        <div className='mt-5 sm:mt-6'>
                            <button type='button' className='inline-flex justify-center w-full rounded-md
                            border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium bg-opacity-90
                            text-white hover:bg-opacity-100 focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-primary sm:text-sm disabled:bg-gray-300
                            disabled:cursor-not-allowed hover:disabled:bg-gray-300' 
                            onClick={createItem}
                            disabled={!nameRef || !providerValidated}>
                                {loading ? "Creating..." : "Create Item"}
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

export default customAdd