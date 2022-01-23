import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import './homeSidebar.css'
import { useNavigate, useParams } from 'react-router-dom'
import ModalForm from '../components/ModalForm'
import PopupForm from '../components/PopupForm'
import { AppContext } from '../Context/AppProvider'
import useFirestore from '../hooks/useFirestore'
import { addDocument } from '../firebase/services'
import { AuthContext } from '../Context/AuthProvider'
import { db } from '../firebase/config'
import MapboxLocationVote from '../MapAddAddress/mapboxLocationVote'
import { query, orderBy, where, limit } from 'firebase/firestore'

const HomeSidebar = ({ setCurrRoom }) => {
  const navigate = useNavigate()
  const {
    selectedRoomHost,
    locationVote,
    setLocationVote,
    selectedRoomId,
    setSelectedRoomId,
    setList,
    setCurrLocation,
    setNickname
  } = React.useContext(AppContext)
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
  // const conditionHostVote = React.useMemo(() => {
  //   return {
  //     fieldName: 'room_id',
  //     operator: '==',
  //     compareValue: selectedRoomHost.id
  //   }
  // }, [selectedRoomHost.id])
  // const conditionClientVote = React.useMemo(() => {
  //   return {
  //     fieldName: 'room_id',
  //     operator: '==',
  //     compareValue: selectedRoomClient.id
  //   }
  // }, [selectedRoomClient.id])
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

  const listRoomHost = useFirestore('rooms', conditionEndVote)
  const isHost = listRoomHost.find(value => value.id === params.id)

  const arrLocationVoteHost = useFirestore('locations', conditionVote)
  // console.log(arrLocationVoteHost)

  React.useMemo(() => {
    let listLocationVote = [...arrLocationVoteHost]
    setList(listLocationVote)
    setListAdd(listLocationVote)
  }, [arrLocationVoteHost, setList])

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

  const dulieu = db.collection('locations')
  const Abc = () => {
    dulieu
      .where('room_id', '==', params.id)
      .orderBy('num_vote', 'desc')
      .limit(1)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log(doc.data())
        })
      })
    // console.log(listAdd.orderBy("num_vote","decs"))

    // console.log(laydulieu)

    console.log(selectedRoomId)
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

  React.useEffect(() => {
    console.log(listMember)
    // const memberList = listMember.slice(1)
    // setHung(memberList)
  }, [listMember])
  // console.log(memberList)
  // const memberCurrent =
  // console.log(memberList.filter((v, i) => memberList.indexOf(v.avatar) === i))
  // console.log(memberList.filter((v, i) => memberList.indexOf(v.avatar) === i))

  setCurrRoom(valueRoom)
  // const handleEndVote = e => {
  //   e.preventDefault()
  //   if (!selectedRoomHost.title) {
  //     Abc()
  //   } else {

  //     Abc()
  //     // navigate('/announcingVote')

  //   }
  // }

  const handleEndVote = e => {
    e.preventDefault()
    Abc()
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

          <h3 className="titel_banner">Danh Sách Địa Chỉ Bình Chọn</h3>
          <div className="home-sidebar-location">
            {listAdd.map(location => (
              <div className="vote_room" key={location.id}>
                <input class="custom" type="checkbox" key={location.id} id={location.id} />
                <label className="label_vote" for={location.id}>
                  {location.location}
                </label>
                <h5 className="quantilyVote_room">{location.vote_users.length}</h5>
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
            <button type="submit" class="btn login_btn" style={{ width: '95%' }} onClick={() => setShow2(true)}>
              Thêm địa Chỉ
            </button>
            <ModalForm
              show={show2}
              onHide={() => setShow2(false)}
              ModalTile={''}
              ModalChildren={<MapboxLocationVote onClose={onClose} />}
              size="xl"
            />
          </div>

          <div className="btnShareLink">
            <button type="submit" class="btn login_btn" style={{ width: '95%' }} onClick={() => setShow(true)}>
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

          <div className="btnEndVote">
            {isHost?.title ? (
              <button type="submit" onClick={e => handleEndVote(e)}>
                Kết thúc
              </button>
            ) : (
              ''
            )}
          </div>

          <div className="btnEndVote">
            <button type="submit" class="btn login_btn" onClick={handleGoBack}>
              <span>Quay lại</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeSidebar
