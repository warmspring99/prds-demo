import React from 'react'
import { compareAsc, format, toDate } from 'date-fns';

function CompletedProviderOrder({name, quantity, property, created, completed, deliveryTime}) {

  return (
    <div className='w-full py-5 my-2 rounded-lg shadow-md flex px-5 justify-between'>
        <h1 className='text-lg font-semibold'>{name}</h1>
        <p>{quantity} units</p>
        <p>{property}</p>
        { compareAsc(toDate(deliveryTime),toDate(completed)) != 1 ? 
            <div className='bg-green-400 rounded-lg px-5 py-1'>
                <p>{format(deliveryTime, "MMMM do, H:mma")}</p>
            </div>
            : 
            <div className='bg-red-400 rounded-lg p-5'>
                <p>{format(deliveryTime, "MMMM do, H:mma")}</p>
            </div>
        }

    </div>
  )
}

export default CompletedProviderOrder