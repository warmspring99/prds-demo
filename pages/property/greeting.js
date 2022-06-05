import React, { useState } from 'react';
import { useRouter } from 'next/router';

import BannerMap from '../../components/BannerMap';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

//Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

//Libs
import {DateRange} from 'react-date-range';
import { addDays, isWeekend, format, subDays, addBusinessDays } from 'date-fns';

function greeting() {
    const router = useRouter();
    const { id } = router.query;

    //Map points
    const [mapPointers, setMapPointers] = useState([]);
    const [center, setCenter] = useState({
            lat: 10.574511,
            lng: -85.676053
    })

    //Schedule information state
    const [startDate, setStartDate] = useState('');
    const [priceTotal, setPriceTotal] = useState(0);
    const [daysLeft, setDaysLeft] = useState(0);
    const [startHours, setStartHours] = useState('');
    //First schedule and property info load logic
    const [loaded, setLoaded] = useState(false);

    const loadInfo = async () => {
        if(id && !loaded){
             setLoaded(true);
             
             const unsub = await getDoc(doc(db, 'schedule', id)).then(async (schedule) => {
                
                let tempStartDate = schedule.data().startDate.toDate();
                let tempEndDate = schedule.data().endDate.toDate();
                let today = new Date();
                setStartDate(tempStartDate.toDateString());
                setPriceTotal(schedule.data().PriceTotal);

                setStartHours(`${format(tempStartDate, 'H')} : ${format(tempStartDate, 'mm')}`);

                let daysLft = tempEndDate.getTime() - today.getTime();
                if (daysLft == 0) {
                    setDaysLeft('Love to have you here today');
                } else {
                    if (daysLft > 0) {
                        setDaysLeft('You are almost here: ' + Math.trunc(daysLft / 86400000) + ' days to go');
                    } else {
                        setDaysLeft('Thank you for staying with us!!');
                    }
                }

                let tempLocations = [];
                let avgLat = 0;
                let avgLng = 0;
                let counter = 0;
                const mapData = await getDoc(doc(db,'propertyDisplayMap','xxZTwkekUDI8w4ncIw2e')).then((map) => {
                    tempLocations = map.data().properties;
                    let tempMapPointers = [];
                    tempLocations.map((loc) => {
                        counter = counter + 1;
                        avgLat = avgLat + loc.lat;
                        avgLng = avgLng + loc.lon;
                        if(loc.property.id == schedule.data().propertyId.id){
                            console.log('reached here')
                        }
                        tempMapPointers.push({
                            name: loc.name,
                            lat: loc.lat,
                            lng: loc.lon,
                            price: loc.price
                        })
                    })

                    setCenter({
                        lat: avgLat/counter,
                        lng: avgLng/counter
                    });

                    setMapPointers(tempMapPointers);
                });


             });
        }
    }

    loadInfo();

    const goToInfo = () => {
        router.push({
            pathname: "/property/info",
            query: {
              id: id,
            }
          });
    }


    return (
    <div className="bg-gray-200">
        <Header></Header>
        <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
            <>
                <div className='mb-10 pb-10'>
                    <div>
                        <BannerMap locations={mapPointers} center={center} zoomLevel = {8}/>
                    </div>
                    <div className='my-5'>
                        <h2 className='text-2xl text-center text-gray-600 font-semibold'>My Reservation</h2>
                        <div className='mt-2 border-b-2 mx-5'/>
                    </div>
                    <div className='flex justify-between'>
                        <p>{startDate} {startHours}</p>
                        <p>{daysLeft}</p>
                        <p>$ {priceTotal}</p>
                        <button className='bg-primary bg-opacity-90 text-white font-semibold 
                        hover:bg-opactiy-100 px-2 py-1 rounded-full' onClick={() => goToInfo()}>
                            View
                        </button>
                    </div>
                </div>
            </>
        </main>
        <Footer />
    </div>
    )
}

export default greeting