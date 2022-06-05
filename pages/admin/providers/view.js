import React, { useState } from 'react';
import Header from '../../../components/Header';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BanIcon, PlusIcon } from '@heroicons/react/solid';
import DataTable from '../../../components/DataTable';
import Tr from '../../../components/Tr';
import { db } from '../../../firebase';
import { getDocs, collection  } from "firebase/firestore";
import Footer from '../../../components/Footer';


function view() {
    const router = useRouter();
    const {data: session} = useSession();

    const [providerInfo, setProviderInfo] = useState([]);

    const getInfo = (id) => {
        router.push({
            pathname: "/admin/providers/info",
            query: {
              id: id,
            }
          });
    }

    const getProviders = async () => {
        const collectionRef = collection(db, "providers");
        const docSnap = await getDocs(collectionRef).then( (snapshot) => {
            const information = [];
            snapshot.forEach((doc) => {
                const tempData = doc.data();
                tempData.id = doc.id;
                tempData.createdToString = doc.data().created.toDate().toDateString();
                information.push(tempData);
            });
            setProviderInfo(information);
        })
    }

    const addProvider = () => {
        router.push("/admin/providers/add");
    }
    
    getProviders();

  return (
    <div className="bg-gray-200 h-screen">
        <Header></Header>
        <main className='mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5 md:max-w-7xl'>
            {session && session.user.isAdmin ? (
                <>
                    <section className='pt-6 border-b-2 mb-3 pb-3 flex justify-between'>
                        <h2 className='text-3xl font-semibold text-center flex justify-center'>
                            Provider Managment Tools
                        </h2>
                        <div className='justify-end flex col-start-4'>
                            <button className='bg-blue-500 rounded-lg text-white text-sm 
                            sm:text-lg justify-end my-1 hover:bg-blue-600 p-2 mr-4 flex'
                            onClick={addProvider}><PlusIcon className='w-5 h-5'/></button>
                        </div>
                    </section>
                    <section className='mx-auto flex justify-center'>
                        <DataTable 
                        items = {providerInfo}
                        renderHead={()=> 
                        <tr key={'id'}>
                            <Tr label='ID'/>
                            <Tr label='Name' sortable/>
                            <Tr label='Phone' sortable/>
                            <Tr label='Created' sortable/>
                            <Tr label='More Info' />
                        </tr>
                        }

                        renderRow={(row) => 
                        <tr className='border-collapse' key={row.id}>
                            <td className='dataTableColumn font-bold text-primary hover:underline'>{row.id}</td>
                            <td className='dataTableColumn'>{row.name}</td>
                            {/* { row.status == 1 ?
                            <td className='dataTableColumn'>
                                <p className='text-green-800 rounded-lg font-sm
                                bg-green-500 bg-opacity-50 tracking-wide p-1 text-center w-16'>Active</p>
                            </td>
                            : 
                            <td className='dataTableColumn'>
                                <p className='text-red-800 rounded-lg font-sm w-16
                                bg-red-500 bg-opacity-50 tracking-wide p-1 text-center'>Inactive</p>
                            </td>
                            } */}
                            <td className='dataTableColumn'>{row.phone}</td> 
                            <td className='dataTableColumn'>{row.createdToString}</td>   
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
                    <h2 className='text-3xl font-semibold pb-3 text-center border-b-2 mb-3'>You don't have permission to see this page</h2>
                    <BanIcon className='text-3xl font-semibold mt-2 w-36 text-red-400 mx-auto' />
                </section>
            )}
        </main>
        <Footer />
    </div>
  )
}

export default view