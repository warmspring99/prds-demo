import React from 'react'
import { compareAsc, format, toDate } from 'date-fns';

function ProviderOrder({name, quantity, property, created, deliveryTime, complete, index}) {
  console.log(compareAsc(toDate(deliveryTime),toDate(Date.now())));
  console.log(toDate(deliveryTime))
  console.log(toDate(Date.now()))
  return (
    <div className='w-full py-5 my-2 rounded-lg shadow-md flex px-5 justify-between'>
        <h1 className='text-lg font-semibold'>{name}</h1>
        <p>{quantity} units</p>
        <p>{property}</p>
        { compareAsc(toDate(deliveryTime),toDate(Date.now())) == 1 ? 
            <div className='bg-green-400 rounded-lg px-5 py-1'>
                <p>{format(deliveryTime, "MMMM do, H:mma")}</p>
            </div>
            : 
            <div className='bg-red-400 rounded-lg p-5'>
                <p>{format(deliveryTime, "MMMM do, H:mma")}</p>
            </div>
        }
        <button className='text-primary border-primary border-2 cursor-pointer hover:bg-primary hover:text-white px-2 rounded-lg'
        onClick={() => complete(index)}>
            Complete
        </button>
    </div>
  )
}

export default ProviderOrder