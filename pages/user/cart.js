import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartComponent from '../../components/CartComponent';


//Firebase imports
import { doc, collection, query, where, updateDoc, getDocs, orderBy, deleteDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import OrderSummary from '../../components/OrderSummary';

function cart() {
    const router = useRouter();
    const {data: session} = useSession();

    const [cartItem, setCartItem] = useState([]);
    const [quantityModified, setQuantityModified] = useState(false);

    const [changedIndex, setChangedIndex] = useState([]);

    //State windows
    const [checkingOut, setCheckingOut] = useState(false);

    //Modal signin
    const [signInModal, setSignInModal] = useState(false);

    useEffect(async () => {
        if(session){
            const collectionRef = collection(db,"cart");
            
            const q = query(collectionRef, where("userId","==",session.user.email),
            orderBy('createdDate', 'desc'));
                
            const querySnapshot = await getDocs(q);

            let information = [];
            querySnapshot.forEach(async (doc) => {
                let tempItem = doc.data();
                tempItem.id = doc.id;
                information.push(tempItem);
            });
            setCartItem(information);
        }
    }, [session]);

    function changeQuantity(index, amount){
        let temp = [...cartItem];
        
        temp[index].itemQty = amount;
        setQuantityModified(true);
        setCartItem(temp);
        if(changedIndex.indexOf(index) == -1){
            let tempChanges = [...changedIndex];
            tempChanges.push(index);
            setChangedIndex(tempChanges);
        }
    }
    
    async function saveChanges(){
        if(changedIndex.length != 0){
            changedIndex.map(async (index)=>{
                //Make update func
                let item = cartItem[index];
                if(item.itemQty == 0) {
                    await deleteDoc(doc(db, 'cart', item.id)).then(function(){
                        console.log('item removed from cart');
                        let temp = [...changedIndex];
                        temp.splice(index, 1);
                        setChangedIndex(temp);

                        let items = [...cartItem];
                        items.splice(index,1);
                        setCartItem(items);
                    })
                } else {
                    await updateDoc(doc(db, 'cart', item.id), {
                        itemQty: item.itemQty,
                    }).then(function() {
                        console.log('cart item updated succesfully');
                        console.log(changedIndex)
                    }).catch(function() {
                        console.log('error updating')
                    });
                }
            });
            setChangedIndex([]);
            setQuantityModified(false);
        }
    }

    function goToCheckout(){
        setCheckingOut(true);
    }

    function goBackToCart(){
        setCheckingOut(false);
    }

    function getTotal(){
        let total = 0
        cartItem.map((item) => {
            total = total + (item.PriceTotal * item.itemQty)
        })
        return total;
    }

    async function makeOrder(orderID, payerID, paymentSource, total, tax){
        let tempItems = [];
        cartItem.map(async (item)=>{
            tempItems.push({
                itemId: item.item,
                name: item.itemName,
                scheduleId: item.scheduleId,
                price: item.PriceTotal,
                itemQty: item.itemQty,
                provider: item.provider
            });
            const unsub = await getDoc(doc(db,'schedule',item.scheduleId.id)).then(async (schedule) => {
                const docRef = await addDoc(collection(db, 'providerOrders'), {
                    created: serverTimestamp(),
                    requester: session.user.email,
                    item: item.item,
                    itemName: item.itemName,
                    quantity: item.itemQty,
                    provider: item.provider,
                    scheduledStartDate: schedule.data().startDate,
                    scheduledEndDate: schedule.data().endDate,
                    property: item.property,
                    status: '1',
                    deliveryTime: item.deliveryTime
                });
            })

            await deleteDoc(doc(db, 'cart', item.id)).then(function(){
                console.log('item removed from cart');
            })
        })

        console.log('finishing up');
        const docRef = await addDoc(collection(db, 'orders'), {
            Total: total,
            created: serverTimestamp(),
            Tax: tax,
            userId: session.user.email,
            items: tempItems,
            status: '1',
            paymentSource: paymentSource,
            providerOrderId: orderID,
            providerPayerId: payerID,
        }).then((snapshot) => {
            
            console.log('redirect to order history')
            //Show modal
        });
        setCartItem([]);
        setChangedIndex([]);
        setQuantityModified(false);
        setCheckingOut(false);
    }

    return (
    <div className="bg-gray-200 min-h-screen">
        <Header></Header>
        <div className='h-fit my-10 py-4 bg-white md:max-w-7xl mx-auto'>
            { checkingOut ? (
                <OrderSummary subtotal={getTotal()} goBackToCart={goBackToCart} makeOrder={makeOrder}/>
            ) : (
                <CartComponent saveChanges={saveChanges} quantityModified={quantityModified} 
                cartItem={cartItem} checkout={goToCheckout} changeQuantity={changeQuantity} total={getTotal()} />
            )}            

        </div>
        
        
        <Footer />
        { signInModal && 
            <Modal
            close={setSignInModal} renderBody={()=>
                <div className='text-center'>
                    <h1 className='text-xl font-semibold my-2 mx-auto'>You are not signed in</h1>
                    <p className='text-lg mx-auto'>Please sign in to continue.</p>
                    <button className='text-primary font-semibold hover:bg-primary hover:text-white
                    text-lg bg-white border-primary border-2 px-2 py-1 rounded-lg mt-5 cursor-pointer' 
                    onClick={()=>{signIn(); setSignInModal(false)}}>
                        Sign In
                    </button>
                </div>
            }/>
        }
    </div>
    )
}

export default cart