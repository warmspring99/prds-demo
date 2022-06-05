import React, {useEffect, useState} from 'react';
import GoogleMapReact from 'google-map-react';
import LocationPin from './LocationPin';

function BannerMap({locations = [], zoomLevel = 10, center = {lat: 10.159549,lng: -84.152433}}) {
    const [markers, setMarkers] = useState([])

    useEffect(() => {
        if (locations.length > 0){
            setMarkers(locations.map(location => {
                return <LocationPin className="absolute w-5 h-5 -top-2.5 -left-2.5"
                key={location.name}
                lat={location.lat}
                lng={location.lng}
                name={location.name}
                price={location.price}
                />
            }));
        }
    }, [locations])
    

    
  return (
    <div className="">
        <div className="h-[60vh]">
        <GoogleMapReact
            bootstrapURLKeys={{ key: process.env.GOOGLE_MAP_API_KEY }}
            center={center}
            defaultZoom={zoomLevel}
        >
            {/* <LocationPin className="absolute w-5 h-5 -top-2.5 -left-2.5"
                lat={locations[0].lat}
                lng={locations[0].lng}
                /> */}
            {markers}
            
        </GoogleMapReact>
        </div>
    </div>
  )
}

BannerMap.defaultCenter = {
    lat: 10.159549,
    lng: -84.152433
}

BannerMap.defaultZoom = 12

export default BannerMap