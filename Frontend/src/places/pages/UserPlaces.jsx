import React, { useContext, useEffect, useState } from 'react'

import "./PlacePages.css"
import PlaceList from '../components/PlaceList';
import { useParams } from 'react-router-dom/cjs/react-router-dom';
import { useHttpClient } from '../../shared/hooks/useHttpClients';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';



export default function UserPlaces() {
  const [loadedPlaces,setLoadedPlaces] = useState([]) 
  const uid = useParams().uid
  const { isLoading, error, sendRequest, emptyError  } = useHttpClient()

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/places/user/${uid}`
        );
        setLoadedPlaces(responseData.places);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest, uid]);

  return(
    <>
      { loadedPlaces.length < 0 && <ErrorModal error={error} onClear={emptyError} />}
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} />}
  </>
)
}
