import React from 'react';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

function not_found() {
  return (
    <div className="bg-gray-200 h-screen">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5 h-[50%]'>
            <h1 className='text-red-500 text-9xl text-center font-extrabold'>404</h1>
            <h1 className='text-gray-500 text-center font-bold'>Page Not Found</h1>
            <div className='mt-2 border-b-2 mx-5'/>
            <h3 className='text-gray-500 text-center font-semibold mt-5'>Please check the link you are providing</h3>
        </main>
        <Footer />
    </div>
  )
}

export default not_found