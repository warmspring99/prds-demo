import React, {useEffect, useState} from 'react';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BanIcon, EmojiHappyIcon } from '@heroicons/react/solid';
import { db } from '../../firebase';
import { getDocs, collection, where, query, doc, updateDoc } from "firebase/firestore";
import Footer from '../../components/Footer';

import { addMinutes } from 'date-fns';
import CompletedProviderOrder from '../../components/CompletedProviderOrder';

function history() {
    const router = useRouter();
    const {data: session} = useSession();
    const { id } = router.query;

    const [orderInfo, setOrderInfo] = useState([]);

    useEffect(() => {
        if(id){
            getOrders()
        }
    }, [id])
    
    const getOrders = async () => {
        const collectionRef = collection(db, "providerOrders");
        const providersRef = doc(db, 'providers', id);
        console.log(id);
        const q = query(collectionRef, where("provider", '==', providersRef ), where("status","==","2"));
            
        const querySnapshot = await getDocs(q);
        
        const information = [];
        querySnapshot.forEach((snapshot) => {
            const tempData = snapshot.data();
            tempData.id = snapshot.id;
            tempData.createdToString = snapshot.data().created ? snapshot.data().created.toDate().toDateString() : "";
            let timeToDeliver = Date.now();
            if(snapshot.data().scheduledStartDate && snapshot.data().scheduledEndDate && snapshot.data().created) {
                let startDate = snapshot.data().scheduledStartDate.toDate();
                let endDate = snapshot.data().scheduledEndDate.toDate();
                let created = snapshot.data().created.toDate();

                console.log(snapshot.data())

                if(startDate <= created){
                    timeToDeliver = addMinutes(created, snapshot.data().deliveryTime)
                } else {
                    timeToDeliver = startDate
                }
                tempData.deliveryTime = timeToDeliver;
            } else {
                router.push('/generics/error');
            }
            information.push(tempData);
            
         })
         setOrderInfo(information);
    }   

    async function complete(index) {
        let temp = [...orderInfo];
        let deleted = temp.splice(index, 1);
        setOrderInfo(temp);

        if(deleted.length > 0){
            await updateDoc(doc(db, 'providerOrders', deleted[0].id), {
                status: '2',
            }).then(function() {
                console.log('cart item updated succesfully');
                console.log(changedIndex)
            }).catch(function() {
                console.log('error updating')
            });
        }   
    }

    function goToManage(){
        router.push({
            pathname: "/provider/pending",
            query: {
              id: id,
            }
          });
    }

    return (
        <div className="bg-gray-200 h-screen">
            <Header></Header>
            <main className='mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5 md:max-w-7xl'>
                {session && (session.user.isAdmin || isProvider) ? (
                    <>
                        <section className='pt-6 border-b-2 mb-3 pb-3 flex justify-between'>
                            <h2 className='text-3xl font-semibold text-center flex justify-center'>
                                Order History
                            </h2>
                            <button className='px-4 py-1 bg-primary text-white rounded-lg'
                            onClick={goToManage}>
                                Order Managment
                            </button>
                        </section>
                        <section className=''>
                            { orderInfo.length > 0 ? 
                                <div>
                                    { orderInfo.map((row, index) => {
                                        return <div>
                                            <CompletedProviderOrder key={row.id}
                                            name={row.itemName}
                                            quantity={row.quantity}
                                            property={row.property}
                                            created={row.createdToString}
                                            completed={row.completedTime}
                                            deliveryTime={row.deliveryTime}
                                            />
                                        </div>
                                    })}
                                </div>
                            :
                             <div className='mx-auto'>
                                 <EmojiHappyIcon className='text-gray-600 mx-auto w-10' />
                                 <h2 className='font-semibold text-center text-xl'>This looks empty, orders are coming!</h2>
                             </div>
                            }
                            

                        </section>
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

export default history