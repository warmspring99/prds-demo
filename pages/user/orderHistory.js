import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BanIcon, PlusIcon } from '@heroicons/react/solid';
import DataTable from '../../components/DataTable';
import Tr from '../../components/Tr';
import { db } from '../../firebase';
import { getDocs, collection, where, query  } from "firebase/firestore";
import Footer from '../../components/Footer';

function orderHistory() {
    const router = useRouter();
    const {data: session} = useSession();

    const [orderInfo, setOrderInfo] = useState([]);

    const getInfo = (id) => {
        router.push({
            pathname: "/admin/orders/info",
            query: {
              id: id,
            }
          });
    }

    useEffect(() => {
        if(session){
            getOrders();
        }
    }, [session])
    

    const getOrders = async () => {
        const collectionRef = collection(db, "orders");
        const q = query(collectionRef, where("userId", '==', session.user.email ));
            
        const querySnapshot = await getDocs(q);
        
        const information = [];
        querySnapshot.forEach((snapshot) => {

            const tempData = snapshot.data();
            tempData.id = snapshot.id;
            tempData.createdToString = snapshot.data().created ? snapshot.data().created.toDate().toDateString() : "";
            information.push(tempData);
            
         })
         setOrderInfo(information);
    }   


  return (
    <div className="bg-gray-200 h-screen">
        <Header></Header>
        <main className='mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5 md:max-w-7xl'>
            {session ? (
                <>
                    <section className='pt-6 border-b-2 mb-3 pb-3 flex justify-start'>
                        <h2 className='text-3xl font-semibold text-center flex justify-center'>
                            Order Managment Tools
                        </h2>
                    </section>
                    <section className='mx-auto flex justify-center'>
                        <DataTable 
                        items = {orderInfo}
                        renderHead={()=> 
                        <tr key={'id'}>
                            <Tr label='ID'/>
                            <Tr label='UserId' sortable/>
                            <Tr label='Created' sortable/>
                            <Tr label='Payment Type' sortable/>
                            <Tr label='Status' sortable/>
                            <Tr label='Total' sortable/>
                            <Tr label='More Info' />
                        </tr>
                        }

                        renderRow={(row) => 
                        <tr className='border-collapse' key={row.id}>
                            <td className='dataTableColumn font-bold text-primary hover:underline'>{row.id}</td>
                            <td className='dataTableColumn'>{row.userId}</td>
                            <td className='dataTableColumn'>{row.createdToString}</td> 
                            <td className='dataTableColumn'>{row.paymentSource}</td>  
                            { row.status == 1 ?
                            <td className='dataTableColumn'>
                                <p className='text-yellow-800 rounded-lg font-sm
                                bg-yellow-500 bg-opacity-50 tracking-wide p-1 text-center w-16'>Pending</p>
                            </td>
                            : 
                            <td className='dataTableColumn'>
                                <p className='text-red-800 rounded-lg font-sm w-16
                                bg-red-500 bg-opacity-50 tracking-wide p-1 text-center'>Error</p>
                            </td>
                            }
                            <td className='dataTableColumn'>${row.Total}</td> 
                            <td className='dataTableColumn'>
                                <button className='text-blue-800 rounded-lg font-sm w-16 cursor-pointer
                                bg-blue-500 bg-opacity-50 tracking-wide p-1 text-center hover:bg-opacity-75'
                                onClick={() => getInfo(row.id)}>Info</button>
                            </td>                       
                        </tr>
                        }
                        />
                    </section>
                </>
            ) : (
                <section className='pt-6 py-[100%]'>
                    <h2 className='text-3xl font-semibold pb-3 text-center border-b-2 mb-3'>You are not logged in</h2>
                    <BanIcon className='text-3xl font-semibold mt-2 w-36 text-red-400 mx-auto' />
                </section>
            )}
        </main>
        <Footer />
    </div>
  )
}

export default orderHistory