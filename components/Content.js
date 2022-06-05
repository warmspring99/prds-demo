import React, { useState } from 'react';
import BannerMap from '../components/BannerMap';

//Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Content() {

  const [loaded, setLoaded] = useState(false);
  //Map points
  const [mapPointers, setMapPointers] = useState([]);
  const [center, setCenter] = useState({
          lat: 10.574511,
          lng: -85.676053
  })

  const loadInfo = async () => {
      if(!loaded){
          setLoaded(true);

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
      }
  }

  loadInfo();
  return (
    <main className='md:max-w-7xl mx-auto sm:px-16 align-middle mt-5 bg-white rounded-sm shadow-sm p-5'>
      <section className='pt-6'>
        <h2 className='text-3xl font-semibold pb-3 text-center border-b-2 mb-3'>Explore Our Properties</h2>
        <div className='relative'>
          <BannerMap locations={mapPointers} zoomLevel={8} center={center}/>
        </div>
      </section>
    </main>
  )
}

export default Content