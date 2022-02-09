import React, { useContext, useEffect, useCallback } from 'react'
import { StaticMap, Marker, Source, Layer } from 'react-map-gl'
import { useState } from 'react'
import { AppContext } from '../Context/AppProvider'
import { AuthContext } from '../Context/AuthProvider'
import axios from 'axios'
import DeckGL from '@deck.gl/react'
import * as turf from '@turf/turf'
import 'mapbox-gl/dist/mapbox-gl.css'
import { GeoJsonLayer } from '@deck.gl/layers'
import './homeSidebar.css'
import { FaMapMarkerAlt } from 'react-icons/fa'
import useFirestore from '../hooks/useFirestore'
import { useParams } from 'react-router-dom'

function Mapbox({ focusLocation }) {
  const params = useParams()
  /// Lấy ra danh sách địa điểm vote
  const conditionVote = React.useMemo(() => {
    return {
      fieldName: 'room_id',
      operator: '==',
      compareValue: params.id
    }
  }, [params.id])

  const token = 'pk.eyJ1IjoidHJhbm5oYW4xMiIsImEiOiJja3k5cnd6M2QwOWN4MnZxbWJianJvNTgxIn0.ubgU2PdV-ahm1liOZLyjMw'
  const [newAddress, setNewAddress] = useState([])
  const [newMember, setNewMember] = useState([])
  const [locationUser, setLocationUser] = useState()
  const [focusLocationCoord, setFocusLocationCoord] = useState('')
  const [distance, setDistance] = useState()
  const [sumLon, setSumLong] = useState(0)
  const [sumLat, setSumLat] = useState(0)

  const { list, Member, viewport, setViewport } = useContext(AppContext)

  const {
    user: { uid }
  } = React.useContext(AuthContext)

  useEffect(() => {
    let newS = []
    let sumX = 0
    let sumY = 0
    Member.forEach(address => {
      setTimeout(() => {
        axios
          .get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${address.currentLocation}.json?access_token=${token}`
          )
          .then(function (response) {
            newS.push({
              ...address,
              longitude: response.data.features[0].center[0],
              latitude: response.data.features[0].center[1]
            })
            if (Member.length < 2) {
              sumX = 0
              sumY = 0
            } else {
              sumX += response.data.features[0].center[0]
              sumY += response.data.features[0].center[1]
            }
            setNewMember([...newS])
            setSumLong(sumX / Member.length)
            setSumLat(sumY / Member.length)
          })
          .catch(function (error) {
            console.log(error)
          })
      })
    }, 500)
  }, [Member, list])

  useEffect(() => {
    let newSs = []

    list.forEach(address => {
      axios
        .get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address.location}.json?access_token=${token}`)
        .then(function (response) {
          newSs.push({
            ...address,
            longitude: response.data.features[0].center[0],
            latitude: response.data.features[0].center[1],
          })
          setNewAddress([...newSs])
        })
        .catch(function (error) {
          console.log(error)
        })
    })
  }, [list, setNewAddress])

  React.useEffect(() => {
    const findLocationUser = newMember.find(value => value.user_id === uid)
    setLocationUser(findLocationUser)
  }, [uid, newMember])

  // Convert location from name to coordinates
  const convertLocationName = useCallback(
    nameLocation => {
      axios
        .get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${nameLocation}.json?access_token=${token}`)
        .then(function (response) {
          const newCoordFocusLocation = `${locationUser?.longitude},${locationUser?.latitude};${response.data.features[0].center[0]},${response.data.features[0].center[1]}`
          setFocusLocationCoord(newCoordFocusLocation)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    [locationUser]
  )

  // Display route from user to entertainment venues
  useEffect(() => {
    if (!focusLocation) return
    setFocusLocationCoord('')
    convertLocationName(focusLocation)
  }, [convertLocationName, focusLocation])

  async function getMatchingGeometry() {
    if (!focusLocationCoord) return
    checkdistance()
    // Create the query
    const query = await fetch(
      `https://api.mapbox.com/matching/v5/mapbox/driving/${focusLocationCoord}?&radiuses=25;25&geometries=geojson&steps=true&access_token=${token}`,
      { method: 'GET' }
    )
    const response = await query.json()
    // Handle errors
    if (response.code !== 'Ok') {
      return
    }
    // Get the coordinates from the response
    const coords = response.matchings[0].geometry
    return coords
  }
  const checkdistance = () => {
    axios
      .get(`https://api.mapbox.com/directions/v5/mapbox/driving/${focusLocationCoord}.json?access_token=${token}`)
      .then(function (responseloca) {
        const distance = responseloca.data.routes[0].distance / 1000
        // alert('khoảng cách'+distance+ "km")
        setDistance(distance.toFixed(2))
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  const lon = sumLon
  const lat = sumLat
  const radius = 1
  const center = [lon, lat]
  const circle = turf.circle(center, radius)

  const layerRoute = new GeoJsonLayer({
    id: 'geojson-layer',
    data: getMatchingGeometry(),
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    pointType: 'circle',
    lineWidthMinPixels: 2,
    lineWidthMaxPixels: 20,
    getFillColor: [160, 160, 180, 200],
    getLineColor: [70, 23, 143, 255],
    getPointRadius: 100
  })

  return (
    <div className="vote_mapbox">
      <div
        className="cycling"
        style={{
          width: '22%',
          height: '50px',
          opacity: '0.7',
          position: 'absolute',
          backgroundColor: '#fff',
          left: '3%',
          top: '10px',
          zIndex: '20',
          borderRadius: '10px',
          textAlign: 'left',
          marginLeft: '10px',
          paddingLeft: '15px'
        }}
      >
        <h5 style={{ lineHeight: '50px', margin: '0' }}>Khoảng cách: {distance} km</h5>
      </div>
      <DeckGL
        initialViewState={{
          longitude: viewport.longitude,
          latitude: viewport.latitude,
          zoom: viewport.zoom
        }}
        height={viewport.height}
        width={viewport.width}
        controller={true}
        layers={layerRoute}
      >
        <StaticMap
          {...viewport}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxApiAccessToken={token}
          onViewportChange={setViewport}
        >
          <Source id="my-data" type="geojson" data={circle}>
            <Layer
              id="point-90-hi"
              type="fill"
              paint={{
                'fill-color': '#088',
                'fill-opacity': 0.4,
                'fill-outline-color': 'yellow'
              }}
            />
          </Source>
          {
            // setTimeout(() => {
            newAddress.map((val, index) => {
              return (
                <Marker
                  className="map_marker"
                  key={index}
                  latitude={val.latitude}
                  longitude={val.longitude}
                  offsetLeft={-10}
                  offsetTop={-28}
                >
                  <div className="map_word">{val.location.split(',')[0]}</div>
                  <div>
                    <FaMapMarkerAlt className="marker marker_location" />
                  </div>
                </Marker>
              )
            })
          }

          {/* Đây là địa chỉ hiện tại của ngườu dùng */}
          {newMember.map((val, index) => {
            return (
              <Marker key={index} latitude={val.latitude} longitude={val.longitude} offsetLeft={-10} offsetTop={-28}>
                <div>
                  <FaMapMarkerAlt className="marker marker_user" />
                </div>
              </Marker>
            )
          })}
        </StaticMap>
      </DeckGL>
    </div>
  )
}
export default React.memo(Mapbox)
