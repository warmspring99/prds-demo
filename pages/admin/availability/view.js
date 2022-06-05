import React, { useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BanIcon, PlusIcon } from '@heroicons/react/solid';
import DataTable from '../../../components/DataTable';
import Tr from '../../../components/Tr';
import { db } from '../../../firebase';
import { getDocs, collection, doc, query, where, getDoc } from "firebase/firestore";



function view() {
    const router = useRouter();
    const {data: session} = useSession();

    const [itemsInfo, setItemsInfo] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const { id } = router.query;

    const [name, setName] = useState("");

    const goToProperty = (id) => {
        router.push({
            pathname: "/admin/properties/info",
            query: {
              id: id,
            }
          });
    }

    const getInfo = (id) => {
        router.push({
            pathname: "/admin/availability/info",
            query: {
              id: id,
            }
          });
    }

    const getItems = async () => {
        if(!loaded && id) {
            const collectionRef = collection(db, "itemAvail");
            const itemRef = doc(db, 'items', id);

            const q = query(collectionRef, where("item", '==', itemRef ));
            
            const querySnapshot = await getDocs(q);
            
            let information = []
            querySnapshot.forEach((doc) => {
                const tempData = {
                    id: doc.id,
                    item: doc.data().item.id,
                    limit: doc.data().limit,
                    ordered: doc.data().ordered,
                    property: doc.data().property.id,
                    description: doc.data().description,
                    status: doc.data().status,
                    property_name: doc.data().property_name
                }
                tempData.id = doc.id;
                information.push(tempData);
                
            });

            const unsub = await getDoc(itemRef).then(async (doc) => {
                if (!doc.exists()) {
                    router.push({
                        pathname: "/generics/not_found",
                      });

                    return;
                }
                setName(doc.data().name);
            });

            setItemsInfo(information);
            setLoaded(true);
        }
        
    }

    const addNormalAvail = () => {
        router.push({
            pathname: "/admin/availability/add",
            query: {
                id: id
            }});
    }

    const addCustomAvailPage = () => {
        router.push("/admin/availability/customAdd");
    }
    
    getItems();

  return (
    <div className="bg-gray-200 h-screen">
        <Header></Header>
        <main className='mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5 md:max-w-7xl'>
            {session && session.user.isAdmin ? (
                <>
                    <section className='pt-6 border-b-2 mb-3 pb-3 flex justify-between'>
                        <h2 className='text-3xl font-semibold text-left flex justify-center'>
                            {name} Availability
                        </h2>
                        <div className='justify-end flex col-start-4'>
                            <button className='bg-blue-500 rounded-lg text-white text-sm 
                            sm:text-lg justify-end my-1 hover:bg-blue-600 p-2 mr-4 flex h-9'
                            onClick={addNormalAvail}><PlusIcon className='w-5 h-5'/></button>
                            <button className='bg-primary rounded-lg text-white text-sm 
                            sm:text-lg justify-end my-1 hover:bg-blue-600 p-2 mr-4 flex h-9'
                            onClick={addCustomAvailPage}><PlusIcon className='w-5 h-5'/></button>
                        </div>
                    </section>
                    <section className='mx-auto flex justify-center'>
                        <DataTable 
                        items = {itemsInfo}
                        renderHead={()=> 
                        <tr key={'id'}>
                            <Tr label='ID'/>
                            <Tr label='Status' sortable/>
                            <Tr label='Limit' sortable/>
                            <Tr label='Ordered' sortable/>                          
                            <Tr label='Property' sortable/>
                            <Tr label='Description' sortable/>
                            <Tr label='Disable' />
                        </tr>
                        }

                        renderRow={(row) => 
                        <tr className='border-collapse' key={row.id}>
                            <td className='dataTableColumn font-bold'>{row.id}</td>
                            { row.status == 1 ?
                            <td className='dataTableColumn'>
                                <p className='text-green-800 rounded-lg font-sm
                                bg-green-500 bg-opacity-50 tracking-wide p-1 text-center w-16'>Active</p>
                            </td>
                            : 
                            <td className='dataTableColumn'>
                                <p className='text-red-800 rounded-lg font-sm w-16
                                bg-red-500 bg-opacity-50 tracking-wide p-1 text-center'>Inactive</p>
                            </td>
                            }
                            <td className='dataTableColumn'>{row.limit}</td>
                            <td className='dataTableColumn'>{row.ordered}</td>
                            <td className='dataTableColumn font-bold text-primary hover:underline cursor-pointer' 
                            onClick={() => goToProperty(row.property)}>{row.property_name}</td>
                            <td className='dataTableColumn'>{row.description}</td>
                            <td className='dataTableColumn' onClick={() => getInfo(row.id)}>
                                <button className='text-blue-800 rounded-lg font-sm w-16 cursor-pointer
                                bg-blue-500 bg-opacity-50 tracking-wide p-1 text-center hover:bg-opacity-75'
                                >Info</button>
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