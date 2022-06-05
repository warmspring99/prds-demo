//Next.js and React imports
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';

//Firebase imports
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

//Iconography imports
import { BanIcon, ChevronLeftIcon, ChevronRightIcon, ShoppingCartIcon } from '@heroicons/react/solid';

//Assets 
import noImage from '../../assets/noImage.png';

//Custom Components
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';

function item() {
  // Navigation and session information
  const router = useRouter();
  const {data: session} = useSession();
  const { id, schedule, property } = router.query;

  // Item Information states
  const [name, setName] = useState('Default name');
  const [status, setStatus] = useState('1');
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('default description');
  const [msrp, setMSRP] = useState(1);
  const [created, setCreated] = useState('jan');
  const [ordered, setOrdered] = useState(0);
  const [review_avg, setReview_avg] = useState(0);
  const [provider, setProvider] = useState("");
  const [providerId, setProviderId] = useState("");
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState(60);

  const [currentImage, setCurrentImage] = useState(0);

  const [inCart, setInCart] = useState(false);
  const [itemAvailStatus, setItemAvailStatus] = useState(false);

  //Modal signin
  const [signInModal, setSignInModal] = useState(false);

  useEffect(async () => {
    if(id && property){
        const itemRef = doc(db, 'items', id);
        const scheduleRef = doc(db,'schedule',schedule);
        const unsub = await getDoc(itemRef).then(async (res) => {
            if (!res.exists()) {
                router.push({
                    pathname: "/generics/not_found",
                });

                return;
            }
            setName(res.data().name);
            setStatus(res.data().status);
            setCategories(res.data().categories); 
            setImages(res.data().images);
            setDescription(res.data().description);
            setCreated(res.data().created.toDate().toDateString());
            setOrdered(res.data().ordered);
            setReview_avg(res.data().review_avg);
            setProvider(res.data().provider_name);
            setMSRP(res.data().price);
            setProviderId(res.data().provider);
            setExpectedDeliveryTime(res.data().expectedDeliveryTime ? res.data().expectedDeliveryTime : 60)

            const propRef = doc(db,'properties', property);

            const itemAvailCollectionRef = collection(db, "itemAvail");
            
            const qry = query(itemAvailCollectionRef, where("property","==",propRef),
                where("item", "==", itemRef), limit(1));
                
            const snap = await getDocs(qry);
                
            snap.forEach(async (doc) => {
                setItemAvailStatus(doc.data().status);
            });
        });
        if(session){
            const collectionRef = collection(db,"cart");
            
            const q = query(collectionRef, where("item","==",itemRef),
                where("scheduleId", "==", scheduleRef), where("userId", "==", session.user.email), limit(1));
                
            const querySnapshot = await getDocs(q);
                
            querySnapshot.forEach(async (doc) => {
                setInCart(true);
            });
        }
    }
  }, [id, session])

  // Image Carousel behaviour logic
  const nextImage = () => {
      if(currentImage < images.length - 1 && images.length != 0) {
          setCurrentImage(currentImage + 1);
      } else {
          console.log('cant go to next');
      }
  }

  const prevImage = () => {
      if(currentImage > 0 && images.length != 0) {
          setCurrentImage(currentImage - 1);
      } else {
          console.log('cant go to prev');
      }
  }

//   Add to cart function TODO: add to cart function adding property to params
  async function addToCart() {

      if(!session) {
        //Show no user modal
        setSignInModal(true);
        return;
      }
      //Get the property from the schedule
      const scheduleRef = doc(db,'schedule', schedule);
      
      const unsub = await getDoc(scheduleRef).then(async (data) => {
          let propRef = data.data().propertyId
          if(propRef){
              await getDoc(propRef).then(async (property) => {
                const docRef = await addDoc(collection(db, 'cart'), {
                    PriceTotal: msrp,
                    createdDate: serverTimestamp(),
                    scheduleId: doc(db, 'schedule',schedule),
                    userId: session.user.email,
                    item: doc(db,'items',id),
                    itemName: name,
                    itemImage: images[0],
                    itemQty: 1,
                    status: '1',
                    property: property.data().name,
                    provider: providerId,
                    deliveryTime: expectedDeliveryTime
                }).then((snapshot) => {
                    // Create a sub function to add the items to the disabled list and reset the selection
                    setInCart(true);
                    //Show modal
                });
              })
          }
      });
  }
  
return (
  <div className="bg-gray-200">
      <Header></Header>
      
      <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
          <>
              <div className='mb-10 pb-10'>
                  <section className='flex'>
                  { currentImage >= 0 ? 
                      // Fix why image isn't cycling
                      <div className='flex relative justify-center w-full bg-gray-200'> 
                          <div className='bg-black bg-opacity-30 absolute w-12 hover:bg-opacity-75 left-0 top-[50%]'>
                              <ChevronLeftIcon onClick={prevImage} className='w-10 text-white 
                              cursor-pointer my-3'/>
                          </div>
                          <img src={images[currentImage]} alt="Image of item"
                          layout="fill" objectfit='cover' className='lg:mx-2 ml-auto mr-auto'/> 

                          <div className='bg-black bg-opacity-30 absolute right-0 w-12  hover:bg-opacity-75 top-[50%]'> 
                              <ChevronRightIcon onClick={nextImage} className='text-white 
                              w-10 cursor-pointer my-3'/>
                          </div>
                      </div>
                  : 
                      <img src={noImage.src} layout="fill" objectfit='cover' className='max-h-64 ml-auto mr-auto'/>
                  }

                  </section>
                  {/* Main Item Info */}
                  <div className='px-2 justify-center'>
                      <h2 className='text-2xl font-semibold pt-2 flex'>
                          <p className='mr-2 flex-1'>{name}</p>
                          { status == 1 ? (
                              <div className='w-4 h-4 rounded-full bg-green-500 flex m-2'></div>
                          ) : (
                              <div className='w-4 h-4 rounded-full bg-red-500 flex m-2'></div>
                          )}
                          <p className='font-semibold text-lg text-center'>${msrp}</p>
                      </h2>
                      <div className='mt-1 mb-2 te xt-sm text-gray-40'>
                          <p>{created}</p>
                      </div>
                      <div className='flex'><p className='font-semibold mr-2'>Provider: </p>{provider}</div>
                      <div className='flex'><p className='font-semibold mr-2'>Stars: </p>{review_avg}</div>
                      <div className='flex'><p className='font-semibold mr-2'>Times Ordered: </p>{ordered}</div>
                      <p className='text-gray-600 text-sm mt-1'>{description}</p>
                      {/* Categories */}
                      <div className='flex mt-2'>
                          {categories.map(function(category, i){
                              return <p className='bg-primary text-white text-sm px-2 
                              py-1 mr-1 rounded-lg cursor-pointer' key={i}>{category}</p>
                          })}
                      </div>
                      {/* TODO: Also validate when item avail is unavailable */}
                      <div className='mt-5'>
                        { inCart ? (
                            <button className='rounded-lg px-5 sm:px-10 py-2 text-white bg-gray-400 
                            transition ease-out duration-150 bg-opacity-90
                            mt-1 mx-auto border-[1px] flex'
                            onClick={addToCart} disabled={true}>In Cart</button>
                        ) : (
                            <div>
                            { status == 1 && itemAvailStatus == 1 ? (
                                <button className='rounded-lg px-5 sm:px-10 py-2 text-primary bg-white 
                                transition ease-out duration-150 bg-opacity-90 cursor-pointer
                                mt-1 hover:bg-opacity-100 hover:-translate-y-0.5 mx-auto border-[1px] 
                                border-primary hover:text-white hover:bg-primary flex'
                                onClick={addToCart}><ShoppingCartIcon className='w-5 mr-5 self-center'/>Add to Cart</button>
                            ) : (
                                <button className='rounded-lg px-5 sm:px-10 py-2 text-gray-400 bg-white 
                                flex mt-1 mx-auto border-[1px] cursor-default
                                border-gray-400'>Unavailable</button>
                            )}
                            </div>
                        )}

                      </div>
                      
                      <div className='mt-2 border-b-2 mx-5'/>
                  </div>
              </div>
          </>
        </main>
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

export default item