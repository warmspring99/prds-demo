import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { BanIcon } from '@heroicons/react/solid'

function dashboard() {
  const router = useRouter();
  const {data: session} = useSession();
  return ( 
    <div className="bg-gray-200">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
        {session ? (
            <>
                <section className='pt-6'>
                    <h2 className='text-3xl font-semibold pb-3 text-center border-b-2 mb-3'>Admin Dashboard</h2>
                </section>
                <section className='mx-auto items-center'>
                    <div className="flex flex-col sm:flex-row sm:space-x-10 py-3 px-6">
                        <div className='adminMenuCard' onClick={() => router.push('/admin/properties/view')}>
                            {/* Image */}
                            <div className='relative h-80 w-80'>
                                <img className='rounded-xl'
                                src='https://links.papareact.com/2io' layout='fill' />
                            </div>
                            <div className='adminMenuCardTitle'>
                                <h3>Properties</h3>
                            </div>
                        </div>
                        <div className='adminMenuCard' onClick={() => router.push('/admin/items/view')}>
                            {/* Image */}
                            <div className='relative h-80 w-80'>
                                <img className='rounded-xl'
                                src='https://links.papareact.com/2io' layout='fill' />
                            </div>
                            <div className='adminMenuCardTitle'>
                                <h3>Items</h3>
                            </div>
                        </div>
                        <div className='adminMenuCard'>
                            {/* Image */}
                            <div className='relative h-80 w-80'>
                                <img className='rounded-xl'
                                src='https://links.papareact.com/2io' layout='fill' />
                            </div>
                            <div className='adminMenuCardTitle'>
                                <h3>Users</h3>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:space-x-10 py-3 px-6 mt-5">
                        <div className='adminMenuCard'>
                            {/* Image */}
                            <div className='relative h-80 w-80'>
                                <img className='rounded-xl'
                                src='https://links.papareact.com/2io' layout='fill' />
                            </div>
                            <div className='adminMenuCardTitle'>
                                <h3>Promotions</h3>
                            </div>
                        </div>
                        <div className='adminMenuCard' onClick={() => router.push('/admin/providers/view')}>
                            {/* Image */}
                            <div className='relative h-80 w-80'>
                                <img className='rounded-xl'
                                src='https://links.papareact.com/2io' layout='fill' />
                            </div>
                            <div className='adminMenuCardTitle'>
                                <h3>Providers</h3>
                            </div>
                        </div>
                        <div className='adminMenuCard'>
                            {/* Image */}
                            <div className='relative h-80 w-80'>
                                <img className='rounded-xl'
                                src='https://links.papareact.com/2io' layout='fill' />
                            </div>
                            <div className='adminMenuCardTitle'>
                                <h3>Logs</h3>
                            </div>
                        </div>
                    </div>
                </section>
            </>
      ) : (
        <section className='pt-6 py-[100%]'>
            <h2 className='text-3xl font-semibold pb-3 text-center border-b-2 mb-3'>You don't have permission to see this page</h2>
            <BanIcon className='text-3xl font-semibold mt-2 w-36 text-red-400 mx-auto' />
        </section>
      ) }
        </main>
        <Footer />
    </div>
  )
}

export default dashboard