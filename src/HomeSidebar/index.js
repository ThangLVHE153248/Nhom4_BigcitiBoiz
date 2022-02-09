import React, { useState } from 'react'
import Mapbox from './mapbox'
import HomeSidebar from './homeSidebar'
import './homeSidebar.css'
import LogOut from '../components/LogOut'
import { useParams } from 'react-router-dom'
import useFirestore from '../hooks/useFirestore'
function Home() {
  const [currRoom, setCurrRoom] = useState({})
  const [focusLocation, setFocusLocation] = useState()
  const params = useParams()
  const usersCondition = React.useMemo(() => {
    return {
      fieldName: 'room_id',
      operator: '==',
      compareValue: params.id
    }
  }, [params.id])

  const listMember = useFirestore('user_room', usersCondition)

  // React.useMemo(() => {
  //   console.log(listMember)
  //   console.log('ok')
  // }, [listMember])
  // const userLogin = listMember?.find(member => member?.user_id === uid)

  return (
    <div className="homeView">
      <LogOut />
      <div className="sidebar">
        <HomeSidebar
          setCurrRoom={setCurrRoom}
          focusLocation={focusLocation}
          setFocusLocation={setFocusLocation}
          listMember={listMember}
        />
      </div>
      <div className="maps">
        <Mapbox currRoom={currRoom} params={params.id} focusLocation={focusLocation} />
      </div>
    </div>
  )
}

export default React.memo(Home)
