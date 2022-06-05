import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer
} from "@paypal/react-paypal-js";

function OrderSummary({subtotal, goBackToCart, makeOrder}) {
  const {data: session} = useSession();
  const router = useRouter();

  //Paypal constants
  const currency = "USD";
  const style = {"layout":"vertical"};

  const tax = Math.round(((subtotal * 0.13) + Number.EPSILON) * 100 / 100); //TODO: Make a configuration or database constant
  const total = (subtotal + tax).toFixed(2);

  const ButtonWrapper = ({ currency, showSpinner }) => {
    // usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
    // This is the main reason to wrap the PayPalButtons in a new component
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

    useEffect(() => {
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                currency: currency,
            },
        });
    }, [currency, showSpinner]);


    return (<>
            { (showSpinner && isPending) && <div className="spinner" /> }
            <PayPalButtons
                style={style}
                disabled={false}
                forceReRender={[total, currency, style]}
                fundingSource={undefined}
                createOrder={(data, actions) => {
                    return actions.order
                        .create({
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: currency,
                                        value: total,
                                    },
                                },
                            ],
                        })
                        .then((orderId) => {
                            // Your code here after create the order
                            return orderId;
                        });
                }}
                onApprove={function (data, actions) {
                    return actions.order.capture().then(function () {
                        // Your code here after capture the order
                        console.log('creating order');
                        makeOrder(data.orderID, data.payerID, data.paymentSource, total, tax);
                        
                    });
                }}
                onCancel={function (data, actions) {
                  console.log('oops you canceled the order ')
                }}
                onError={function(data, actions){
                  console.log('oops an unexpected error happened');
                  console.log(data);
                }}
            />
        </>
    );
  }

  //Checkout state
  const [checkingOut, setCheckingOut] = useState(false);

  function checkout() {
    setCheckingOut(true);
  }

  return (
    <div>
      <div className={!checkingOut && 'hidden'}>
          <h1 className='text-gray-500 text-2xl font-semibold text-center mb-2'>Checkout</h1>
          <div className='border-b-2 mb-5 mt-3 mx-5'/>
          <div className='md:flex justify-center mx-5 md:mx-10'>
            <PayPalScriptProvider
                  options={{
                      "client-id": 'AbCkno1aafdPFM5UrOJz5K2XhyGTZTkOwOJfTw27r4pOn47X9Z3bzu7bx5kap9rq7-9eZVUOi2fkt3Bt',
                      components: "buttons",
                      currency: "USD"
                  }}
              >
              <ButtonWrapper
                          currency={currency}
                          showSpinner={false}
                      />
            </PayPalScriptProvider>
          </div>
          <div className='flex justify-center'>
            <button className='bg-white rounded-lg px-24 py-2 text-primary self-center mt-5
            border-primary border-2 hover:bg-primary hover:text-white' onClick={goBackToCart}>
              Cancel
            </button>
          </div>
        </div>
        <div className={checkingOut && 'hidden'}>
          <div className='flex justify-between mx-5'>
            <h1 className='text-gray-500 text-2xl font-semibold text-center'>Order Summary</h1>
          </div>
          <div className='border-b-2 mb-5 mt-2 mx-5'/>
          <div className='mx-10 text-gray-600 text-lg sm:text-xl my-5 font-semibold'>
              <div className='flex justify-between my-1'><p className='font-normal'>Subtotal</p>${subtotal}</div>
              <div className='flex justify-between my-1'><p className='font-normal'>Savings Applied</p>$0</div>
              <div className='flex justify-between my-1'><p className='font-normal'>Product Tax</p>${tax}</div>
          </div>
          <div className='border-b-2 mb-5 mt-2 mx-5'/>
          <div className='flex justify-between text-2xl text-gray-600 mx-5'>
              <h2>Total:</h2>
              <h2>${total}</h2>
          </div>
          <div className='border-b-2 mb-5 mt-2 mx-5'/>
          <div className='text-lg flex mx-5'>
              <div className='flex-1'/>
              <button className='rounded-lg px-8 sm:px-14 py-2 text-gray-400 bg-white transition ease-out duration-150 bg-opacity-90 mx-2
              mt-1 hover:bg-opacity-100 hover:-translate-y-0.5 border-[1px] border-gray-400 hover:text-white hover:bg-gray-400'
              onClick={goBackToCart}>Cancel</button>
              <button className='rounded-lg px-8 sm:px-14 py-2 text-primary bg-white transition ease-out duration-150 bg-opacity-90 mx-2
              mt-1 hover:bg-opacity-100 hover:-translate-y-0.5 border-[1px] border-primary hover:text-white hover:bg-primary'
              onClick={checkout}>Checkout</button>
          </div>
        </div>
      {/* {checkingOut ? (
        <div className=''>
          <h1 className='text-gray-500 text-2xl font-semibold text-center mb-2'>Checkout</h1>
          <div className='border-b-2 mb-5 mt-3 mx-5'/>
          <div className='md:flex justify-center mx-5 md:mx-10'>
            <PayPalScriptProvider
                  options={{
                      "client-id": 'AbCkno1aafdPFM5UrOJz5K2XhyGTZTkOwOJfTw27r4pOn47X9Z3bzu7bx5kap9rq7-9eZVUOi2fkt3Bt',
                      components: "buttons",
                      currency: "USD"
                  }}
              >
              <ButtonWrapper
                          currency={currency}
                          showSpinner={false}
                      />
            </PayPalScriptProvider>
          </div>
          <div className='flex justify-center'>
            <button className='bg-white rounded-lg px-24 py-2 text-primary self-center mt-5
            border-primary border-2 hover:bg-primary hover:text-white' onClick={goBackToCart}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className='flex justify-between mx-5'>
            <h1 className='text-gray-500 text-2xl font-semibold text-center'>Order Summary</h1>
          </div>
          <div className='border-b-2 mb-5 mt-2 mx-5'/>
          <div className='mx-10 text-gray-600 text-lg sm:text-xl my-5 font-semibold'>
              <div className='flex justify-between my-1'><p className='font-normal'>Subtotal</p>${subtotal}</div>
              <div className='flex justify-between my-1'><p className='font-normal'>Savings Applied</p>$0</div>
              <div className='flex justify-between my-1'><p className='font-normal'>Product Tax</p>${tax}</div>
          </div>
          <div className='border-b-2 mb-5 mt-2 mx-5'/>
          <div className='flex justify-between text-2xl text-gray-600 mx-5'>
              <h2>Total:</h2>
              <h2>${total}</h2>
          </div>
          <div className='border-b-2 mb-5 mt-2 mx-5'/>
          <div className='text-lg flex mx-5'>
              <div className='flex-1'/>
              <button className='rounded-lg px-8 sm:px-14 py-2 text-gray-400 bg-white transition ease-out duration-150 bg-opacity-90 mx-2
              mt-1 hover:bg-opacity-100 hover:-translate-y-0.5 border-[1px] border-gray-400 hover:text-white hover:bg-gray-400'
              onClick={goBackToCart}>Cancel</button>
              <button className='rounded-lg px-8 sm:px-14 py-2 text-primary bg-white transition ease-out duration-150 bg-opacity-90 mx-2
              mt-1 hover:bg-opacity-100 hover:-translate-y-0.5 border-[1px] border-primary hover:text-white hover:bg-primary'
              onClick={checkout}>Checkout</button>
          </div>
        </div>
      )} */}
        
    </div>
  )
}

export default OrderSummary