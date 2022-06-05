//Next.js and React imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

//Firebase imports
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

//Iconography imports
import { BanIcon } from '@heroicons/react/solid';

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
    const [tax, setTax] = useState(0);
    const [created, setCreated] = useState('jan');
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([]);
    const [paymentSource, setPaymentSource] = useState("");
    const [providerOrderId, setProviderOrderId] = useState("");
    const [providerPayerId, setProviderPayerId] = useState("");
    const [userId, setUserId] = useState("");
    
    useEffect(() => {
      loadOrderInfo()
    }, [id])
    

    const loadOrderInfo = async () => {
        if(id){
             const orderRef = doc(db, 'orders', id);
             const unsub = await getDoc(orderRef).then(async (snapshot) => {
                if (!snapshot.exists()) {
                    router.push({
                        pathname: "/generics/not_found",
                      });

                    return;
                }
                setStatus(snapshot.data().status);
                setTax(snapshot.data().Tax);
                setTotal(snapshot.data().Total);
                setCreated(snapshot.data().created.toDate().toDateString());
                setItems(snapshot.data().items);
                setPaymentSource(snapshot.data().paymentSource);
                setProviderOrderId(snapshot.data().providerOrderId);
                setProviderPayerId(snapshot.data().providerPayerId);
                setUserId(snapshot.data().userId);
            });
        }
    }
    // Item Disabeling information
    const onDelete = async () => {
        if (status == "1"){
            await updateDoc(doc(db, 'orders', id), {
                status: "2"
            }).then(function() { 
                setStatus('2')
            }).catch(function() {
                console.log('error updating')
            });
    
        } else {
            
            await updateDoc(doc(db, 'orders', id), {
                status: "1"
            }).then(function() {
                setStatus('1');
            }).catch(function() {
                console.log('error updating')
            });
        }
    }
    // TODO: add schedule viewer admin 
    function goToSchedule(scheduleId) {
        router.push({ 
            pathname: "/admin/schedule/orderHistory",
            query: {
              id: scheduleId,
            }
          });
    }

    function goToItem(itemId) {
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
                            <h2 className='text-3xl font-semibold pb-3 text-left col-span-3'>Order Info</h2>
                        </section>
                        {/* Main Item Avail Info */}
                        <div className='px-2 justify-center'>
                            <h2 className='text-2xl font-semibold pt-2 flex'>
                                <p className='mr-2 flex-1 hidden md:inline-block'>{id}</p>
                                <p className='font-semibold text-lg text-center'>${total} - tax ${tax}</p>
                            </h2>
                            <div className='mt-1 mb-2 te xt-sm text-gray-40'>
                                <p>{created}</p>
                            </div>
                            <div className='flex'><p className='font-semibold mr-2'>Status: </p>
                                <p className='text-gray-500'>{status}</p>
                            </div>
                            <div className='flex'><p className='font-semibold mr-2'>User: </p>
                                <p className='hover:underline text-primary cursor-pointer'>{userId}</p>
                            </div>
                            <div className='flex'><p className='font-semibold mr-2'>Payment Source: </p>
                                <p className='text-gray-500'>{paymentSource} - {providerOrderId} / {providerPayerId}</p>
                            </div>
                            <div className='mt-2 border-b-2 mx-5'/>
                            <p className='font-semibold mr-2'>Items:</p>
                            {items.map((item) => {
                                return <div key={item.itemId.id} className='md:mx-5 flex justify-between border-b-2'>
                                    <p className='hover:underline text-gray-500 cursor-pointer' onClick={()=>goToItem(item.itemId.id)}>{item.name}</p>
                                    <p className='hover:underline text-primary cursor-pointer'>Schedule</p>
                                    <p className='text-gray-500 md:inline-block hidden'>{item.itemQty} units</p>
                                    <p className='text-gray-500'>${item.price*item.itemQty}</p>
                                </div>
                            })}
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