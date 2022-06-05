import React from 'react';

import logoText from '../assets/logoText.png';
import logoImg from '../assets/logoImg.png';
import ccAcceptance from '../assets/ccAcceptance.png';

function Footer() {
  return (
    <footer className="border-t md:max-w-7xl mx-auto bottom-0 w-full
        sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5">
      <div className='grid grid-cols-3'>
        {/* Logo */}
        <div className='items-center my-auto'>
          <div className='relative w-24 hidden lg:inline-grid cursor-pointer items-center' onClick={() => router.push('/')}>
            <img src={logoText.src} layout="fill"
            objectfit='contain'/>
          </div>
          <div className='relative w-10 lg:hidden flex-shrink-0 cursor-pointer items-center my-auto' onClick={() => router.push('/')}>
            <img src={logoImg.src} layout='fill'
            objectfit='contain'/>
          </div>
        </div>
        <div>

        </div>
        <div>
          <img src={ccAcceptance.src} className="text-right w-40 block ml-auto mt-auto"/>
        </div>
      </div>
    </footer>
  )
}

export default Footer