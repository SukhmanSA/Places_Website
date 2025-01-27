import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const Map = ({ center, zoom, style }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD75CppTZF9tt-cKh9zhl-Ug1AcfWP6iZ8",
    libraries: ["places"],
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  const mapStyle = {
    width: "520px",
    height: "250px",
    marginLeft:"50px"
  };


  return (
      <GoogleMap
        center={center}
        zoom={zoom}
        mapContainerStyle={mapStyle}
      >
        <Marker position={center} />
      </GoogleMap>
  );
};

export default Map;
