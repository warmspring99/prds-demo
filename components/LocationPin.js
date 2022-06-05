import React, {Fragment} from 'react';
import {LocationMarkerIcon, StarIcon} from '@heroicons/react/solid';
import { Transition } from '@headlessui/react'

function LocationPin({name, price}) {
  return (
    <div className="group">
        <LocationMarkerIcon className="flex align-center text-sm navBtn text-red-500 shadow-sm" />
        <div className='bg-black px-5 py-1 rounded-md invisible w-52 transition ease-in-out duration-300
        group-hover:visible group-hover:scale-100 scale-75 pr-8 translate-x-8 -translate-y-6 bg-opacity-75'>
          <h1 className='text-white text-base'>{name}</h1>
          <div className='flex justify-between my-2'>
            <div className='flex justify-start'>
              <StarIcon className='text-sm text-yellow-400 w-5 flex' />
              <StarIcon className='text-sm text-yellow-400 w-5 flex' />
              <StarIcon className='text-sm text-yellow-400 w-5 flex' />
              <StarIcon className='text-sm text-yellow-400 w-5 flex' />
              <StarIcon className='text-sm text-black w-5 flex' />
            </div>
            <p className='text-xs text-white text-right'>${price}</p>
          </div>
          

        </div>
    </div>
  )
}

export default LocationPin