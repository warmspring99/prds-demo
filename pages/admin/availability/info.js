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

    // Availability Information states
    const [status, setStatus] = useState('1');
    const [description, setDescription] = useState('default description');
    const [created, setCreated] = useState('jan');
    const [ordered, setOrdered] = useState(0);
    const [limit, setLimit] = useState(0);
    const [property, setProperty] = useState("");
    const [item, setItem] = useState("");
    const [price, setPrice] = useState(0);

    const [propId, setPropId] = useState('');
    const [itemId, setItemId] = useState('');
    
    //First avail info load logic
    const [loaded, setLoaded] = useState(false);

    const loadItemInfo = async () => {
        if(id && !loaded){
             setLoaded(true);
             const itemRef = doc(db, 'itemAvail', id);
             const unsub = await getDoc(itemRef).then(async (snapshot) => {
                if (!snapshot.exists()) {
                    router.push({
                        pathname: "/generics/not_found",
                      });

                    return;
                }
                setStatus(snapshot.data().status);
                setLimit(snapshot.data().limit);
                setDescription(snapshot.data().description);
                setCreated(snapshot.data().created.toDate().toDateString());
                setOrdered(snapshot.data().ordered);
                const itemRef = doc(db, 'items', snapshot.data().item.id);
                const propertyRef = doc(db, 'properties', snapshot.data().property.id);

                const itemInfo = await getDoc(itemRef).then((itemSnapshot) => {
                    setItem(itemSnapshot.data().name);
                    setPrice(itemSnapshot.data().price);
                    setItemId(itemSnapshot.id);
                });

                const propertyInfo = await getDoc(propertyRef).then((propertySnapshot) => {
                    setProperty(propertySnapshot.data().name);
                    setPropId(propertySnapshot.id);
                });
            });
        }
    }

    loadItemInfo();

    // Item Disabeling information
    const onDelete = async () => {
        if (status == "1"){
            await updateDoc(doc(db, 'itemAvail', id), {
                status: "2"
            }).then(function() { 
                setStatus('2')
            }).catch(function() {
                console.log('error updating')
            });
    
        } else {
            
            await updateDoc(doc(db, 'itemAvail', id), {
                status: "1"
            }).then(function() {
                setStatus('1');
            }).catch(function() {
                console.log('error updating')
            });
        }
    }

    // Get property page
    const openProperty = () => {
        router.push({
            pathname: "/admin/properties/info",
            query: {
              id: propId,
            }
          });
    }

    // Get item page
    const openItem = () => {
        router.push({
            pathname: "/admin/items/info",
            query: {
              id: itemId,
            }
          });
    }
    
  return (
    <div className="bg-gray-200 min-h-screen">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
            {session && session.user.isAdmin ? (
                <>
                    <div className='mb-10 pb-10'>
                        <section className='pt-6 border-b-2 pd-3 mb-2 grid grid-cols-4'>
                            <h2 className='text-3xl font-semibold pb-3 text-left col-span-3'>Availability Info</h2>
                            <div className='justify-end flex col-start-4'>
                                {status == 1 ? 
                                <button className='bg-red-500 rounded-lg text-white text-sm sm:text-lg 
                                justify-end w-24 my-1 hover:bg-red-600 px-4' onClick={onDelete}>Delete</button>
                                :
                                <button className='bg-green-500 rounded-lg text-white text-sm sm:text-lg 
                                justify-end w-24 my-1 hover:bg-green-600 px-4' onClick={onDelete}>Activate</button>
                                }
                            </div>
                        </section>
                        {/* Main Item Avail Info */}
                        <div className='px-2 justify-center'>
                            <h2 className='text-2xl font-semibold pt-2 flex'>
                                <p className='mr-2 flex-1'>{id}</p>
                                { status == 1 ? (
                                    <div className='w-4 h-4 rounded-full bg-green-500 flex m-2'></div>
                                ) : (
                                    <div className='w-4 h-4 rounded-full bg-red-500 flex m-2'></div>
                                )}
                                <p className='font-semibold text-lg text-center'>${price}</p>
                            </h2>
                            <div className='mt-1 mb-2 te xt-sm text-gray-40'>
                                <p>{created}</p>
                            </div>
                            <div className='flex'><p className='font-semibold mr-2'>Property: </p>
                                <p className='hover:underline text-primary cursor-pointer' onClick={() => openProperty()}>{property}</p>
                            </div>
                            <div className='flex'><p className='font-semibold mr-2'>Item: </p>
                                <p className='hover:underline text-primary cursor-pointer' onClick={() => openItem()}>{item}</p>
                            </div>
                            <div className='flex'><p className='font-semibold mr-2'>Ordered: </p>{ordered}</div>
                            <div className='flex'><p className='font-semibold mr-2'>Purchase Limit: </p>{limit}</div>
                            <p className='text-gray-600 text-sm mt-1'>{description}</p>
                            <div className='mt-2 border-b-2 mx-5'/>
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