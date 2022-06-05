import React from 'react';
import CartItem from './CartItem';

function CartComponent({saveChanges, quantityModified, cartItem, checkout, changeQuantity, total}) {
  return (
    <div>
        <div className='flex justify-between mx-5'>
            <h1 className='text-gray-500 text-2xl font-semibold text-center'>My Cart</h1>
            <button className='bg-white border-[1px] disabled:bg-gray-300 disabled:border-gray-300
            border-primary text-primary text-lg disabled:text-white cursor-pointer disabled:cursor-default
            rounded-lg hover:text-white hover:bg-primary px-2' disabled={!quantityModified}
            onClick={saveChanges}>
                Save
            </button>
        </div>
        
        <div className='border-b-2 mb-5 mt-2 mx-5'/>
        { cartItem.length == 0 ? (
            <div className='mx-auto'>
                <p className='font-semibold text-gray-500 text-center text-lg'>No items in cart</p>
            </div>
        ) : (
            <div>
                { cartItem.map(function(item, index){
                    return <div key={item.id}>
                        <CartItem id={item.id} name={item.itemName} index={index} 
                        image={item.itemImage} price={item.PriceTotal} quantity={item.itemQty} schedule={item.scheduleId.id}
                        created={item.createdDate} status={item.status} property={item.property} handleQtyChange={changeQuantity}/>
                    </div>
                })}
                <div className='flex justify-between text-2xl text-gray-600 mx-5'>
                    <h2>Total:</h2>
                    <h2>${total}</h2>
                </div>
                <div className='border-b-2 mb-5 mt-2 mx-5'/>
                <div className='text-lg flex justify-end'>
                    <button className='rounded-lg px-8 sm:px-14 py-2 text-primary bg-white transition ease-out duration-150 bg-opacity-90
                    mt-1 hover:bg-opacity-100 hover:-translate-y-0.5 mx-auto border-[1px] border-primary hover:text-white hover:bg-primary'
                    onClick={checkout}>Continue</button>
                </div>
            </div>
        )}
    </div>
  )
}

export default CartComponent