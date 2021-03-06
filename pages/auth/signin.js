import React from 'react'
import { getProviders, signIn } from "next-auth/react";
import Header from '../../components/Header';

function signin({providers}) {
  return (
    <>
    <Header/>
    <div className="flex flex-col items-center justify-center min-h-screen
    py-2 -mt-56 px-14 text-center">
        <img className='w-80' src='https://links.papareact.com/ocw'
        alt="" />
        <p className='font-xs italic'>
            This is a demo app not the real Instagram
        </p>
        <div className='mt-40'>
            {Object.values(providers).map((provider) => (
                <div key={provider.name}>
                    <button className='text-white bg-blue-500 p-3 rounded-lg'
                    onClick={() => signIn(providers.id, { callbackUrl: '/'})}>
                        Sign in with {provider.name}
                    </button>
                </div>
            ))}
        </div>  
    </div>
      
    </>
  )
}

export async function getServerSideProps(context){
    const providers = await getProviders();

    return {
        props: {
            providers
        }
    }
}

export default signin