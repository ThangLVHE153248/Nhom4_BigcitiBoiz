import React, { useState } from 'react'
import './homeSidebar.css'
import { useNavigate, useParams } from 'react-router-dom'
import ModalForm from '../components/ModalForm'
import PopupForm from '../components/PopupForm'
import { AppContext } from '../Context/AppProvider'
import useFirestore from '../hooks/useFirestore'
import { addDocument } from '../firebase/services'
import { AuthContext } from '../Context/AuthProvider'
import { db } from '../firebase/config'
import MapboxLocationVote from './mapboxLocationVote'
import { query, orderBy, where, limit } from 'firebase/firestore'
import useGetDataFirebase from '../hooks/useGetDataFirebase'
import { FaShareAlt, FaCalendarCheck } from 'react-icons/fa'
import { BsArrowReturnLeft } from 'react-icons/bs'
import { SiGooglemaps } from 'react-icons/si'

const HomeSidebar = ({ setCurrRoom, setFocusLocation }) => {
  const navigate = useNavigate()
  const { locationVote, setLocationVote, selectedRoomId, setList, setMember } = React.useContext(AppContext)
  // console.log(selectedRoomHost)
  const params = useParams()
  const {
    user: { uid }
  } = React.useContext(AuthContext)
  // console.log(uid)

  const [show, setShow] = useState(false)

  const [show2, setShow2] = useState(false)

  const [listAdd, setListAdd] = useState([])

  const [valueRoom, setValueRoom] = useState({})

  const [voteWin, setVoteWin] = useState('')

  const [isActive, setActive] = useState(false)

  const [voteStatus, setvoteStatus] = useState(true)

  const [value, SetValue] = useState('')
  const [index, SetIndex] = useState('')

  const room = db.collection('rooms')
  const [hung, setHung] = useState()
  const onClose = () => {
    setShow2(false)
  }

  /// Lấy ra danh sách địa điểm vote
  const conditionVote = React.useMemo(() => {
    return {
      fieldName: 'room_id',
      operator: '==',
      compareValue: params.id
    }
  }, [params.id])
  //// Kiểm tra host để end Vote
  const conditionEndVote = React.useMemo(() => {
    return {
      fieldName: 'user_id',
      operator: '==',
      compareValue: uid
    }
  }, [uid])
  /// Kiểm tra người dùng đã là thành viên hay chưa
  const conditionCheckUser = React.useMemo(() => {
    return {
      fieldName: 'member',
      operator: 'array-contains',
      compareValue: uid
    }
  }, [uid])

  React.useEffect(() => {
    const { id } = params
    db.collection('rooms')
      .doc(id)
      .get()
      .then(doc => {
        if (doc.exists) {
          setValueRoom(doc.data())
        } else {
          // doc.data() will be undefined in this case
          alert('Phòng này không tồn tại')
        }
      })
  }, [params])

  React.useEffect(() => {
    locationVote.map(value => {
      addDocument('locations', {
        location: value,
        num_vote: 0,
        vote_users: [],
        room_id: params.id,
        createBy: uid
      })
      setLocationVote([])
    })
  }, [locationVote, params.id, uid, setLocationVote])

  const listRoomHost = useGetDataFirebase('rooms', conditionEndVote)
  const memberInRoom = useGetDataFirebase('rooms', conditionCheckUser)
  const isHost = listRoomHost.find(value => value.id === params.id)

  React.useEffect(() => {
    room
      .doc(params.id)
      .get()
      .then(doc => {
        console.log(doc.data().vote_status)
        setActive(!doc.data().vote_status)
      })
    getDataVote()
  }, [setActive])

  const arrLocationVoteHost = useFirestore('locations', conditionVote)

  React.useMemo(() => {
    let listLocationVote = [...arrLocationVoteHost]
    setList(listLocationVote)
    setListAdd(listLocationVote)
  }, [arrLocationVoteHost, setList])

  const handleGoBack = () => {
    setHung()

    navigate('/')
    //delete all data room_id, user_room...
  }

  const dataVoteWin = db.collection('locations')
  const getDataVote = () => {
    dataVoteWin
      .where('room_id', '==', params.id)
      .orderBy('num_vote', 'desc')
      .limit(1)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          // console.log(doc.data())
          setVoteWin(doc.data())
        })
      })
  }

  /// Lấy ra danh sách người dùng có trong phòng
  // console.log(valueRoom)
  const usersCondition = React.useMemo(() => {
    return {
      fieldName: 'room_id',
      operator: '==',
      compareValue: params.id
    }
  }, [params.id])

  const listMember = useFirestore('user_room', usersCondition)
  //// Đây là user chứa địa chỉ lúc đầu người dùng nhập
  const userLogin = listMember.find(member => member.user_id === uid)

  React.useEffect(() => {
    console.log(listMember)
    console.log(userLogin)
    console.log(memberInRoom)
    setMember(listMember)
  }, [listMember, userLogin, memberInRoom])

  setCurrRoom(valueRoom)

  //Kết thúc vote
  const handleEndVote = e => {
    e.preventDefault()
    getDataVote()

    setActive(true)

    db.collection('rooms')
      .doc(params.id)
      .update({
        vote_status: false
      })
      .then(() => {
        console.log('Document successfully updated!')
      })
  }

  const handleConfim = e => {
    if (window.confirm('Bạn có muốn kết thúc bình chọn')) {
      handleEndVote(e)
    }
  }

  const handleCheckBox = e => {
    const locationId = e.target.value
    // Create a reference to the locationId doc.
    const locationItem = db.collection('locations').doc(locationId)
    return db
      .runTransaction(transaction => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(locationItem).then(sfDoc => {
          if (!sfDoc.exists) {
            // eslint-disable-next-line no-throw-literal
            throw 'Document does not exist!'
          }
          let numVote = sfDoc.data().vote_users.length
          let voteUsers = sfDoc.data().vote_users
          if (e.target.checked) {
            transaction.update(locationItem, { num_vote: numVote + 1 })
            voteUsers.push(uid)
            transaction.update(locationItem, { vote_users: voteUsers })
          } else {
            transaction.update(locationItem, { num_vote: numVote - 1 })
            voteUsers.splice(voteUsers.indexOf(uid), 1)
            transaction.update(locationItem, { vote_users: voteUsers })
          }
        })
      })
      .then(() => {})
      .catch(error => {
        console.log('Transaction failed: ', error)
      })
  }
  // console.log(isActive)

  // Display route from user to entertainment venues
  const handleFocusLocation = location => {
    setFocusLocation(location)
  }

  return (
    <>
      <div className="home">
        <div className="home-sidebar">
          <div className="home-sidebar-title">
            {/* <h2>{selectedRoomHost.title ? selectedRoomHost.title : selectedRoomClient.title}</h2> */}
            <h2>{valueRoom.title}</h2>
          </div>
          <div className="home-sidebar-content">
            {/* <h2>{selectedRoomHost.description ? selectedRoomHost.description : selectedRoomClient.description}</h2> */}
            <h2>{valueRoom.description}</h2>
          </div>

          <div className={isActive ? 'home-sidebar-location' : 'contendisable'}>
            <h3 className="titel_banner">Địa điểm được chọn nhiều nhất</h3>
            <h5 className="addressVote">{voteWin.location}</h5>
          </div>

          <h3 className="titel_banner">Danh Sách Địa Chỉ Bình Chọn</h3>
          <div className="home-sidebar-location">
            {listAdd.map(location => (
              <div className="vote_room" key={location.id}>
                <input
                  className={isActive ? 'login_btn_none' : 'custom'}
                  type="checkbox"
                  value={location.id}
                  onClick={e => handleCheckBox(e)}
                  defaultChecked={location.vote_users.includes(uid)}
                  key={location.id}
                  id={location.id}
                  disabled={isActive}
                />

                <label onClick={() => handleFocusLocation(location.location)} htmlFor={location.id}>
                  {location.location}
                  <h5 className="quantilyVote_room">{location.vote_users.length}</h5>
                </label>
              </div>
            ))}
          </div>

          <h3 className="titel_banner">Danh Sách Người Tham Gia</h3>
          <div className="home-sidebar-location">
            {listMember?.map(member => (
              <div className="vote_people" key={member.uid}>
                <img className="img_people" src={member.avatar}></img>
                <span className="nameVote">{member.nickname}</span>
              </div>
            ))}
          </div>

          <div className="btnShareLink">
            <button
              type="submit"
              class="btn login_btn"
              style={{ width: '95%' }}
              disabled={isActive}
              onClick={() => setShow2(true)}
            >
              <SiGooglemaps />
              {''}
              Thêm địa Chỉ
            </button>
            <ModalForm
              show={show2}
              onHide={() => setShow2(false)}
              ModalTile={''}
              ModalChildren={<MapboxLocationVote onClose={onClose} value={value} index={index} />}
              size="xl"
            />
          </div>

          <div className="btnShareLink">
            <button type="submit" class="btn login_btn" style={{ width: '95%' }} onClick={() => setShow(true)}>
              <FaShareAlt /> {''}
              Chia Sẻ Link
            </button>
            <ModalForm
              show={show}
              onHide={() => setShow(false)}
              ModalTile={''}
              // ModalChildren={<PopupForm value={`http://localhost:3000/${selectedRoomId}`} />}
              ModalChildren={<PopupForm value={window.Headers} />}
              size="md"
            />
          </div>

          <div className={isActive ? 'btnEndVote_none' : 'btnEndVote'}>
            {isHost?.title ? (
              <button class="btn login_btn" type="submit" disabled={isActive} onClick={handleConfim}>
                <FaCalendarCheck /> {''}
                Kết thúc
              </button>
            ) : (
              ''
            )}
            <button type="submit" class="btn login_btn" onClick={handleGoBack}>
              <span>
                <BsArrowReturnLeft /> {''} Quay lại
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeSidebar
