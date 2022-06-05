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
    const [description, setDescription] = useState('default description');
    const [msrp, setMSRP] = useState(1);
    const [created, setCreated] = useState('jan');
    const [ordered, setOrdered] = useState(0);
    const [review_avg, setReview_avg] = useState(0);
    const [provider, setProvider] = useState("")

    const [changedImages, setChangedImages] = useState(false);

    //Item info load
    const [loaded, setLoaded] = useState(false);
    const loadItemInfo = async () => {
        if(id && !loaded){
             setLoaded(true);
             const itemRef = doc(db, 'items', id);
             const unsub = await getDoc(itemRef).then(async (doc) => {
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
                setDescription(doc.data().description);
                setCreated(doc.data().created.toDate().toDateString());
                setOrdered(doc.data().ordered);
                setReview_avg(doc.data().review_avg);
                setProvider(doc.data().provider_name);
                setMSRP(doc.data().price);
            });
        }
    }

    loadItemInfo();

    const save = async () => {
        const len = images.length;
        let counter = 0;

        if (changedImages) {
            images.map(async (image) => {
                if(image.startsWith("data:image")) {
                    const imageRef = ref(storage, `items/${id}/${uuid().slice(0,6)}`);
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

    async function updateDocument() {
        await updateDoc(doc(db, 'items', id), {
            name: name,
            description: description,
            price: msrp,
            images: images,
        }).then(function() {
            console.log('item updated succesfully');
            router.back();
        }).catch(function() {
            console.log('error updating')
        });
    }

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
                                <h2 className='text-3xl font-semibold pb-3 text-left col-span-3'>Edit Item</h2>
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
                                    <input className='focus:ring-0 text-lg sm:text2xl font-bold w-full' placeholder={name} onChange={(e)=> setName(e.target.value)}></input>
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
                                <div className='flex mb-1'><p className='font-semibold mr-2'>Provider: </p>{provider}</div>
                                <div className='flex'><p className='font-semibold mr-2'>Stars: </p>{review_avg}</div>
                                <div className='flex'><p className='font-semibold mr-2'>Times Ordered: </p>{ordered}</div>
                                <textarea className='text-gray-600 text-sm mt-1 h-52 w-full break-words focus:ring-0'
                                 placeholder={description} value={description} onChange={(e)=> setDescription(e.target.value)}></textarea>
                                {/* Categories TODO: ADD CATEGORY UPDATE AND CREATION*/}
                                <div className='flex mt-2'>
                                    {categories.map(function(category, i){
                                        return <p className='bg-primary text-white text-sm px-2 
                                        py-1 mr-1 rounded-lg cursor-pointer' key={i}>{category}</p>
                                    })}
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

export default edit