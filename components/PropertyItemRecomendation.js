import React, {useEffect, useState} from 'react';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/router';

import ItemMiniCart from './ItemMiniCart';

function PropertyItemRecomendation({propertyId, scheduleId}) {
    const router = useRouter();

    const [recomendedItems, setRecomendedItems] = useState([]);
    const [stateUpdater, setStateUpdater] = useState('');

    const loadItemPreview = async () => {
        const collectionRef = collection(db, "itemAvail");

        const propRef = doc(db,'properties', propertyId);
        
        const q = query(collectionRef, where("property","==",propRef),
            where("status", "==", "1"), orderBy('ordered', 'desc'), limit(5));
            
        const querySnapshot = await getDocs(q);
            
        querySnapshot.forEach(async (doc) => {
            const unsub = await getDoc(doc.data().item).then((resp) => {
                let tempItem = {
                    name: resp.data().name,
                    images: resp.data().images,
                    price: resp.data().price,
                    id: resp.id,
                    property: propertyId
                }
                recomendedItems.push(tempItem);
                console.log(recomendedItems);
                setStateUpdater(tempItem.name);      
            });            
        });
    }
    useEffect(() => {
        if(propertyId){
            loadItemPreview();
        }       
    }, [propertyId])

    function seeMore(){
        router.push({
            pathname: "/property/items",
            query: {
              propid: propertyId,
              scheduleId: scheduleId
            }
          });
    }
    
  return (
    <div>
        <div className='flex justify-between mx-5 mt-5 mb-2'>
            <h1 className='text-xl font-semibold flex-1'>Additional Services</h1>
            <button className='rounded-lg px-5 sm:px-10 py-2 text-primary bg-white transition ease-out duration-150 bg-opacity-90
          mt-1 hover:bg-opacity-100 hover:-translate-y-0.5 mx-auto border-[1px] border-primary hover:text-white hover:bg-primary'
          onClick={seeMore}>See more</button>
        </div>
        <div className='my-3 px-5 grid lg:grid-cols-5 grid-cols-3' id={stateUpdater}>
            
            { recomendedItems.map((item) => {
                return <ItemMiniCart name={item.name} id={item.id} property={item.property}
                images={item.images} price={item.price} key={item.id} schedule={scheduleId}/>
            })                                    
            }
        </div>
    </div>
  )
}

export default PropertyItemRecomendation