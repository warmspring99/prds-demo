import React, {useEffect, useState} from 'react';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useRouter } from 'next/router';

//Custom Components
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ItemMiniCart from '../../components/ItemMiniCart';

function items() {
    const router = useRouter();
    const { propid, scheduleId } = router.query;

    const [recomendedItems, setRecomendedItems] = useState([]);
    const [stateUpdater, setStateUpdater] = useState('');

    const loadItemPreview = async () => {
        const collectionRef = collection(db, "itemAvail");

        const propRef = doc(db,'properties', propid);
        
        const q = query(collectionRef, where("property","==",propRef),
            where("status", "==", "1"), orderBy('ordered', 'desc'));
            
        const querySnapshot = await getDocs(q);
            
        querySnapshot.forEach(async (doc) => {
            const unsub = await getDoc(doc.data().item).then((resp) => {
                let tempItem = {
                    name: resp.data().name,
                    images: resp.data().images,
                    price: resp.data().price,
                    id: resp.id,
                    property: propid
                }
                recomendedItems.push(tempItem);
                console.log(recomendedItems);
                setStateUpdater(tempItem.name);      
            });            
        });
    }
    useEffect(() => {
        if(propid){
            loadItemPreview();
        }       
    }, [propid])
  return (
    <div className="bg-gray-200">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
            <div className='flex justify-between mx-5'>
                <p className='text-semibold text-xl'>Shop Items</p>
                <p className='text-lg'>{recomendedItems.length} results</p>
            </div>
            <div className='my-3 px-5 grid lg:grid-cols-5 grid-cols-3' id={stateUpdater}>
                
                { recomendedItems.map((item) => {
                    return <ItemMiniCart name={item.name} id={item.id} property={item.property}
                    images={item.images} price={item.price} key={item.id} schedule={scheduleId}/>
                })                                    
                }
            </div>
        </main>
        <Footer />
    </div>
  )
}

export default items