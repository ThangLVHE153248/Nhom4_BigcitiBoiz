import React, { useContext, useEffect, useRef } from 'react'
import ReactMapGL, { Marker } from 'react-map-gl'
import { useState } from 'react'
import { AppContext } from '../Context/AppProvider'
import axios from 'axios'
import useFirestore from '../hooks/useFirestore'

function Mapbox({ currRoom, params }) {
  const [viewport, setViewport] = useState({
    width: '75vw',
    height: '100vh',
    latitude: 21.0164909,
    longitude: 105.7772149,
    zoom: 16
  })

  const token = 'pk.eyJ1IjoidHJhbm5oYW4xMiIsImEiOiJja3k5cnd6M2QwOWN4MnZxbWJianJvNTgxIn0.ubgU2PdV-ahm1liOZLyjMw'
  const [newAddress, setNewAddress] = useState([])
  const { list } = useContext(AppContext)
  // console.log(list)

  useEffect(() => {
    let newS = []
    list.map(address => {
      axios
        .get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address.location}.json?access_token=${token}`)
        .then(function (response) {
          newS.push({
            ...address,
            longitude: response.data.features[0].center[0],
            latitude: response.data.features[0].center[1]
          })
        })
        .catch(function (error) {
          console.log(error)
        })
    })
    setNewAddress(newS)
  }, [list])

  const mapRef = useRef()

  // const MemberCondition = React.useMemo(() => {
  //   return {
  //     fieldName: 'room_id',
  //     operator: '==',
  //     compareValue: params
  //   }
  // }, [params])

  // const valueRoom = useFirestore('user_room', MemberCondition)
  // console.log(valueRoom)

  // const handleViewportChange = useCallback(newViewport => setViewport(newViewport), [])

  // const handleGeocoderViewportChange = useCallback(
  //   newViewport => {
  //     const geocoderDefaultOverrides = { transitionDuration: 1000 };

  //     return handleViewportChange({
  //       ...newViewport,
  //       ...geocoderDefaultOverrides
  //     });
  //   },
  //   [handleViewportChange]
  // )

  return (
    <div className="">
      <ReactMapGL
        ref={mapRef}
        {...viewport}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxApiAccessToken="pk.eyJ1IjoidHJhbm5oYW4xMiIsImEiOiJja3k5cnd6M2QwOWN4MnZxbWJianJvNTgxIn0.ubgU2PdV-ahm1liOZLyjMw"
        onViewportChange={viewport => setViewport(viewport)}
      >
        {newAddress.map(val => {
          return (
            <Marker latitude={val.latitude} longitude={val.longitude} offsetLeft={0} offsetRight={0}>
              <div>
                <img
                  style={{ height: 40, width: 40 }}
                  src="https://i0.wp.com/www.carewellurgentcare.com/wp-content/uploads/2016/09/blue-location-icon-Location_marker_pin_map_gps.png?ssl=1"
                />
              </div>
            </Marker>
          )
        })}
      </ReactMapGL>
      {/* <div className="listPeople" onClick={showClient}></div> */}
    </div>
  )
}
export default Mapbox
