//Next.js and React imports
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

//Firebase imports
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

//Iconography imports
import { BanIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

//Assets 
import noImage from '../../../assets/noImage.png';

//Custom Components
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

function info() {
    // Navigation and session information
    const router = useRouter();
    const {data: session} = useSession();
    const { id } = router.query;

    // Item Information states
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

    const [currentImage, setCurrentImage] = useState(0);

    const [showModal, setShowModal] = useState(false);
    
    //First item info load logic
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

    // Item Disabeling information
    const onDelete = async () => {
        if (status == "1"){
            await updateDoc(doc(db, 'items', id), {
                status: "2"
            }).then(function() { 
                setStatus('2')
            }).catch(function() {
                console.log('error updating')
            });
    
        } else {
            
            await updateDoc(doc(db, 'items', id), {
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
            pathname: "/admin/items/edit",
            query: {
              id: id,
            }
          });
    }

    // Get item->propertyInfo page routing
    const openItemAvailability = () => {
        router.push({
            pathname: "/admin/availability/view",
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
                            <h2 className='text-3xl font-semibold pb-3 text-left col-span-3'>Item Info</h2>
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
                        {/* Main Item Info */}
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
                            <div className='flex'><p className='font-semibold mr-2'>Provider: </p>{provider}</div>
                            <div className='flex'><p className='font-semibold mr-2'>Stars: </p>{review_avg}</div>
                            <div className='flex'><p className='font-semibold mr-2'>Times Ordered: </p>{ordered}</div>
                            <p className='text-gray-600 text-sm mt-1'>{description}</p>
                            {/* Categories */}
                            <div className='flex mt-2'>
                                {categories.map(function(category, i){
                                    return <p className='bg-primary text-white text-sm px-2 
                                    py-1 mr-1 rounded-lg cursor-pointer' key={i}>{category}</p>
                                })}
                            </div>
                            <div className='mt-2 border-b-2 mx-5'/>
                        </div>
                        {/* Add properties to  */}
                        <div className='text-center mt-2'>
                             <h2 className='text-3xl font-semibold pb-3 text-center mt-3'>Item Availability</h2>
                             <button className='rounded-lg px-5 py-2 text-white bg-primary transition ease-out duration-150 bg-opacity-90
                                mt-5 hover:bg-opacity-100 hover:-translate-y-0.5 mx-auto'
                                onClick={openItemAvailability}>Manage availability</button>
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