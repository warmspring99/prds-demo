import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import Content from '../components/Content';
import Footer from '../components/Footer';

import PromoBanner from '../assets/promoBanner.jpg';

const Home: NextPage = () => {    
  return (
    <div className="bg-gray-200">
      <Head>
        <title>Macaw Tech</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header></Header>
      <div className='h-fit mb-5'>
        <Content />
      </div>

      <div className='border-t md:max-w-7xl mx-auto mb-5
      sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5 text-center'>
        <section className='pt-6'>
          <h2 className='text-3xl font-semibold pb-3 text-center border-b-2 mb-3'>Make this vacations legendary</h2>
          <button className='rounded-lg px-5 py-2 text-white bg-primary transition ease-out duration-150 bg-opacity-90
          mt-5 hover:bg-opacity-100 hover:-translate-y-0.5 mx-auto' title='Discover featured properties button'>Discover our Featured Rentals</button>
        </section>
      </div>

      <div className='border-t md:max-w-7xl mx-auto my-5 grid grid-cols-3 sm:grid-cols-2 grid-rows-1
      align-middle mt-5 bg-white rounded-sm shadow-sm'>
        <img src={PromoBanner.src} className="rounded-sm w-full object-cover relative col-span-3 
        sm:col-span-2 h-96 row-start-1 col-start-1" 
        alt='Promotion Banner image' title='Promotion Banner Image' />
        <div className='rounded-sm bg-white m-5 sm:m-10 col-start-2 col-span-2 sm:col-span-1
        row-start-1 z-50 text-center p-5 align-middle flex flex-col justify-around my-10'>
          <h2 className='text-2xl sm:text-3xl font-semibold pb-3 text-center mb-3'>A breath of Adventure Pack</h2>
          <p className='text-lg'>Spend a week living the life you meant to have!</p>
          <button className='rounded-lg px-5 sm:px-10 py-2 text-white bg-primary transition ease-out duration-150 bg-opacity-90
          mt-5 hover:bg-opacity-100 hover:-translate-y-0.5 mx-auto' title='Go to Promo Button'>Plan your Trip</button>
        </div>
      </div>

      <footer className="border-t md:max-w-7xl mx-auto 
      sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5">
        <Footer />
      </footer>
    </div>
  )
}

export default Home
