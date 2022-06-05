import React, { useRef } from 'react'
import { useRouter } from 'next/router';

function CartItem({id, name, image, price, index, schedule,
    quantity, created, status, property, handleQtyChange}) {
      const router = useRouter();

      const qtyRef = useRef(null);

      function changedQty(){
        if(qtyRef.current.value){
          handleQtyChange(index, qtyRef.current.value)
        }
      }

      function goToProp(){
        router.push({
            pathname: "/property/info",
            query: {
              id: schedule,
            }
        });
    }
  return (
    <div className='mx-4 lg:mx-4 my-2 border-b-[1px] pb-2'>
      <div>
        <p className='font-semibold text-primary hover:underline cursor-pointer pl-1 pb-1' 
        onClick={goToProp}>{property}</p>
      </div>
      <div className='flex'>
        {/* Image */}
        <div className='rounded-full bg-white w-28'>
          <img src={image} alt="Image of cart item"
            layout="fill" objectfit='cover' className='ml-auto mr-auto rounded-lg'/> 
        </div>
        {/* Item info */}
        <div className='grid grid-rows-3 w-full'>
          <div className='flex flex-1 mx-2 justify-between'>
              <h1 className='pl-1 text-md lg:text-lg font-semibold truncate w-56 md:w-fit'>{name}</h1>
              <div className=''>
                  <p className='font-bold text-md w-16 text-right'>${price*quantity}</p>
              </div>
          </div>
          <div className='flex flex-1 mx-2 justify-between'>
              <div className='flex pl-1'><p className='md:inline-block hidden mr-1'>Unit price: </p><p>${price}</p></div>
              <div className='w-fit justify-end'>
                  <input
                  className='text-gray-600 bg-gray-100 py-1 w-16 text-right'
                  type="number"
                  min={0}
                  ref={qtyRef}
                  placeholder={quantity} onChange={changedQty}/>
              </div>
          </div>
          <div className='flex flex-1 mx-2 justify-between'>
            <p className='pl-1 text-gray-400 text-xs -mt-1'>{created.toDate().toDateString()}</p>
          </div>
        </div>
        
        
      </div>
    </div>
    
  )
}

export default CartItem