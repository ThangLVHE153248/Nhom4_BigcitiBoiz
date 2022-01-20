import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import './homeSidebar.css'
import { useNavigate } from 'react-router-dom'
import ModalForm from '../components/ModalForm'
import PopupForm from '../components/PopupForm'
import { AppContext } from '../Context/AppProvider'
import useFirestore from '../hooks/useFirestore'
import { addDocument } from '../firebase/services'
import { AuthContext } from '../Context/AuthProvider'
import Mapbox from '../MapAddAddress/mapbox'
import MapboxLocationVote from '../MapAddAddress/mapboxLocationVote'

const HomeSidebar = () => {
  const navigate = useNavigate()
  const { selectedRoomHost, selectedRoomClient, locationVote, setLocationVote } = React.useContext(AppContext)
  const {
    user: { uid }
  } = React.useContext(AuthContext)
  // console.log(!selectedRoomClient)
  // console.log(!!selectedRoomHost)
  // console.log(locationVote)
  const [show, setShow] = useState(false)

  const [show2, setShow2] = useState(false)
  const onClose =() => { 
    setShow2(false)
  
}
  const conditionHostVote = React.useMemo(() => {
    return {
      fieldName: 'room_id',
      operator: '==',
      compareValue: selectedRoomHost.id
    }
  }, [selectedRoomHost.id])
  const conditionClientVote = React.useMemo(() => {
    return {
      fieldName: 'room_id',
      operator: '==',
      compareValue: selectedRoomClient.id
    }
  }, [selectedRoomClient.id])

  React.useEffect(() => {
    locationVote.map(value => {
      addDocument('locations', {
        location: value,
        num_vote: 0,
        room_id: selectedRoomHost.id ? selectedRoomHost.id : selectedRoomClient.id,
        createBy: uid
      })
      setLocationVote([])
    })
  }, [locationVote, selectedRoomClient.id, uid, selectedRoomHost, setLocationVote])

  const arrLocationVoteHost = useFirestore('locations', conditionHostVote)
  const arrLocationVoteClient = useFirestore('locations', conditionClientVote)
  

  let listLocationVote = [...arrLocationVoteClient, ...arrLocationVoteHost]
  // console.log(listLocationVote)

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleEndVote = e => {
    e.preventDefault()
    if (!selectedRoomHost.title) {
      alert('Chỉ người tạo phòng mới đc end')
    } else {
      navigate('/announcingVote')
    }
  }

  return (
    <>
      <div className="home">
        <div className="home-sidebar">
          
          <div className="home-sidebar-title">
            <h2>{selectedRoomHost.title ? selectedRoomHost.title : selectedRoomClient.title}</h2>
          </div>
          <div className="home-sidebar-content">
            <h2>{selectedRoomHost.description ? selectedRoomHost.description : selectedRoomClient.description}</h2>
          </div>

          <div className="home-sidebar-members">
            {listLocationVote.map(location => (
              <div className="vote" key={location.id}>
                <h4 className="nameVote">
                  <input type="checkbox"></input>
                  {location.location}
                </h4>
                <h5 className="quantilyVote">{location.num_vote}</h5>
              </div>
            ))}
          </div>

          {/* <div className="home-sidebar-location">
                      
                  </div> */}

          <div className="btnLocation_share">
            <button style={{ width: '95%' }} onClick={() => setShow2(true)}>
              Thêm địa Chỉ
            </button>
            <ModalForm
              show={show2}
              onHide={() => setShow2(false)}
              ModalTile={''}
              ModalChildren={<MapboxLocationVote  onClose={onClose}/>}
              size="xl"
            />
          </div>

          <div className="btnLocation_share">
            <button style={{ width: '95%' }} onClick={() => setShow(true)}>
              Chia Sẻ Link
            </button>
            <ModalForm
              show={show}
              onHide={() => setShow(false)}
              ModalTile={''}
              ModalChildren={<PopupForm value={window.location.href} />}
              size="md"
            />
          </div>
          <div className="btnEndVote">
            <button type="submit" onClick={e => handleEndVote(e)}>
              Kết thúc
            </button>
          </div>
          <button class="go-back" onClick={handleGoBack}><span>Quay lại</span></button>
        </div>
      </div>
    </>
  )
}

export default HomeSidebar
