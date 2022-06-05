import React, { useState } from 'react';
import Header from '../../../components/Header';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BanIcon, PlusIcon } from '@heroicons/react/solid';
import DataTable from '../../../components/DataTable';
import Tr from '../../../components/Tr';
import Footer from '../../../components/Footer';
import { addPropertyState } from '../../../atoms/modalAtom';
import { useRecoilState, useRecoilState_TRANSITION_SUPPORT_UNSTABLE } from 'recoil';


//Firebase imports
import { doc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '../../../firebase';


function view() {
    const router = useRouter();
    const {data: session} = useSession();
    const { id } = router.query;

    const [scheduleLoaded, setScheduleLoaded] = useState(false);
    const [schedules, setSchedules] = useState([]);

    const getScheduleData = async () => {
        if (!scheduleLoaded && id){
            setScheduleLoaded(true);
            
            const scheduleRef = collection(db, 'schedule');
            const propertyRef = doc(db, 'properties', id);
            const q = query(scheduleRef, where("propertyId", '==', propertyRef ));
            
            const querySnapshot = await getDocs(q);
            

            querySnapshot.forEach((doc) => {
                
                let tempSchedules = [...schedules];
                tempSchedules.push({
                    id: doc.id,
                    createdDate: doc.data().createdDate.toDate().toDateString(),
                    userId: doc.data().userId ? doc.data().userId : 'NONE',
                    startDate: doc.data().startDate.toDate().toDateString(),
                    endDate: doc.data().endDate.toDate().toDateString(),
                    PriceTotal: doc.data().PriceTotal,
                });
                setSchedules(tempSchedules);
            });
        }
    }
    getScheduleData();

    

  return (
    <div className="bg-gray-200 h-screen">
        <Header></Header>
        <main className='mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5 md:max-w-7xl'>
            {session ? (
                <>
                    <section className='pt-6 border-b-2 mb-3 pb-3 flex justify-between'>
                        <h2 className='text-3xl font-semibold text-center flex justify-center'>
                            Schedule History for {id}
                        </h2>
                        <div className='justify-end flex col-start-4'>
                        </div>
                    </section>
                    <section className='mx-auto flex justify-center'>
                        <DataTable 
                        items = {schedules}
                        renderHead={()=> 
                        <tr key={'id'}>
                            <Tr label='ID'/>
                            <Tr label='Created' sortable/>
                            <Tr label='User'/>
                            <Tr label='Start Day' sortable/>
                            <Tr label='End Day' sortable/>
                            <Tr label='Price' sortable/>
                        </tr>
                        }

                        renderRow={(row) => 
                        <tr className='border-collapse' key={row.id}>
                            <td className='dataTableColumn font-bold text-primary hover:underline'>{row.id}</td>
                            <td className='dataTableColumn'>{row.createdDate}</td>
                            <td className='dataTableColumn'>{row.userId}</td>
                            <td className='dataTableColumn'>{row.startDate}</td>
                            <td className='dataTableColumn'>{row.endDate}</td>
                            <td className='dataTableColumn'>{row.PriceTotal}</td>
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