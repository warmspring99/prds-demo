import React, { useRef, useEffect } from 'react';

import logoImg from '../assets/logoImg.png';

function Modal({renderBody, close}) {

    function closeModal(e){
        close(false);
    }
    
  return (
    <div className='bg-black bg-opacity-30 w-screen h-full fixed top-0 z-10 flex justify-center align-middle cursor-pointer'>
        <div className='h-fit bg-white p-10 m-auto rounded-xl shadow-xl'>
            <img src={logoImg.src} layout='fill'
            objectfit='contain' className='mx-auto w-20 mb-5'/>
            {renderBody()}
        </div>
    </div>
    
  )
}

export default Modal