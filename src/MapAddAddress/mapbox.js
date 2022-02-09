import React, { useRef, useState, useCallback, useEffect, useContext } from 'react'
import ReactMapGL, { Marker } from 'react-map-gl'
import axios from 'axios'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import Geocoder from 'react-map-gl-geocoder'
import { FaMapMarkerAlt } from 'react-icons/fa'
import './style.css'
import { AppContext } from '../Context/AppProvider'

function Mapbox({ onClose, value, index }) {
  const { curraddName, setCurrAddName, setLocationVote, locationVote } = useContext(AppContext)
  // Token
  var token = 'pk.eyJ1IjoiY29udG90IiwiYSI6ImNreWFvamp0dDAwbnIyb210OGdkbjUxc2oifQ.4h9mS6yDTwWeWFpHyJ_6EQ'
  // Marker
  var [marker, setMarker] = useState({ longitude: 105.83675721458776, latitude: 21.024682141244533 })
  // Name Addresss
  var [nameAddress, SetnameAddress] = useState('')
  // Viewport
  var [viewport, setViewport] = useState({
    width: '100%',
    height: '100%',
    latitude: 21.0164909,
    longitude: 105.7772149,
    zoom: 12,
    bearing: 0,
    pitch: 0
  })

  // Drag
  var [events, logEvents] = useState({})
  var onMarkerDragStart = useCallback(event => {
    logEvents(_events => ({ ..._events, onDragStart: event.lngLat }))
  }, [])

  var onMarkerDrag = useCallback(event => {
    logEvents(_events => ({ ..._events, onDrag: event.lngLat }))
  }, [])

  var onMarkerDragEnd = useCallback(event => {
    logEvents(_events => ({ ..._events, onDragEnd: event.lngLat }))
    setMarker({
      longitude: event.lngLat[0],
      latitude: event.lngLat[1]
    })
  }, [])
  useEffect(() => {
    axios
      .get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${marker.longitude},${marker.latitude}.json?access_token=${token}`
      )
      .then(function (response) {
        SetnameAddress(response.data.features[0].place_name)
      })
      .catch(function (error) {
        console.log(error)
      })
  }, [marker, token])

  // Zoom when search
  var geocoderContainerRef = useRef()
  var mapRef = useRef()

  var handleViewportChange = useCallback(newViewport => setViewport(newViewport), [])

  var handleGeocoderViewportChange = useCallback(
    newViewport => {
      var geocoderDefaultOverrides = { transitionDuration: 1500 }

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides
      })
    },
    [handleViewportChange]
  )

  var handleSearchMarker = location => {
    setMarker({
      longitude: location.result.center[0],
      latitude: location.result.center[1]
    })
    SetnameAddress(location.result.place_name)
  }

  // Submit location

  var handleSubmitLocation = e => {
    e.preventDefault()
    setCurrAddName(nameAddress)

    const updateLocationVote = [...locationVote]
    updateLocationVote[index] = nameAddress

    setLocationVote(updateLocationVote)
    onClose()
  }

  // Return
  return (
    <div>
      <div className="container_map">
        <div style={{ width: '100%', height: '90vh' }}>
          <div className="mapbox">
            <ReactMapGL
              ref={mapRef}
              {...viewport}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              onViewportChange={viewport => setViewport(viewport)}
              mapboxApiAccessToken={token}
            >
              <div style={{ height: '100vh' }}>
                <div ref={geocoderContainerRef} style={{ position: 'absolute', top: 7, left: 44, zIndex: 1 }} />
                <Geocoder
                  mapRef={mapRef}
                  containerRef={geocoderContainerRef}
                  onViewportChange={handleGeocoderViewportChange}
                  mapboxApiAccessToken={token}
                  position="top-left"
                  onResult={handleSearchMarker}
                  placeholder={nameAddress}
                />
              </div>
              {
                <Marker
                  latitude={marker.latitude}
                  longitude={marker.longitude}
                  offsetLeft={-20}
                  offsetTop={-30}
                  draggable
                  onDragStart={onMarkerDragStart}
                  onDrag={onMarkerDrag}
                  onDragEnd={onMarkerDragEnd}
                >
                  <FaMapMarkerAlt className="map__locationSelect" />
                </Marker>
              }
            </ReactMapGL>
          </div>
        </div>
      </div>
      <button type="submit" className="btnAdd" onClick={e => handleSubmitLocation(e)}>
        Sửa địa chỉ
      </button>
    </div>
  )
}
export default Mapbox
