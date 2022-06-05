import React from 'react';
import { useRouter } from 'next/router';


function ItemMiniCart({id, name, images, price, schedule, property}) {
  const router = useRouter();

  function redirectToItemView() {
    if(!id || !schedule){
      return;
    }
    router.push({
      pathname: "/property/item",
      query: {
        id: id,
        schedule: schedule,
        property: property
      }
    });
  }

  return (
    <div className='mx-2 lg:mx-4 flex flex-col my-2'>
      {/* Image */}
      <div className='rounded-full bg-white'>
        <img src={images[0]} alt="Image of property"
          layout="fill" objectfit='cover' className='ml-auto mr-auto rounded-lg'/> 
      </div>
      {/* Item info */}
      <div className='flex flex-1 flex-col justify-between'>
        <h1 className='text-xs lg:text-sm font-semibold'>{name}</h1>
        <div className=''>
          <p className='font-bold text-xs lg:text-sm'>${price}</p>
          <button className='rounded-lg px-5 sm:px-10 py-2 text-primary bg-white transition ease-out duration-150 bg-opacity-90 block
            mt-1 hover:bg-opacity-100 hover:-translate-y-0.5 mx-auto border-[1px] border-primary hover:text-white hover:bg-primary'
            onClick={redirectToItemView}>View
          </button>
        </div>
      </div>
      
    </div>
  )
}

export default ItemMiniCart