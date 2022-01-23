import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/config'
import useFirestore from '../hooks/useFirestore'
import { AuthContext } from './AuthProvider'

export const AppContext = React.createContext()

export default function AppProvider({ children }) {
  const [curraddName, setCurrAddName] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [locationVote, setLocationVote] = useState([])
  const [list, setList] = useState([])
  const [currLocation, setCurrLocation] = useState('')
  const [nickname, setNickName] = useState('')

  const { user } = React.useContext(AuthContext)

  //// Đây là lấy ra các danh sách phòng mà người dùng là khách(client)
  const roomsClientCondition = React.useMemo(() => {
    return {
      fieldName: 'member',
      operator: 'array-contains',
      compareValue: user.uid
    }
  }, [user.uid])
  const roomClient = useFirestore('rooms', roomsClientCondition)
  // console.log('client', roomClient)

  //// Đây là lấy ra các danh sách mà người dùng là chủ (host)
  const roomsHostCondition = React.useMemo(() => {
    return {
      fieldName: 'user_id',
      operator: '==',
      compareValue: user.uid
    }
  }, [user.uid])
  const roomHost = useFirestore('rooms', roomsHostCondition)
  console.log('host', roomHost)
  db.collection('rooms')
    .where('user_id', '==', '4qh5ZZkhSFVCJm2hInWNuKgNUcA3')
    .get()
    .then(querySnapshot => {
      console.log(
        querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }))
      )
      // querySnapshot.forEach(doc => {
      //   // doc.data() is never undefined for query doc snapshots
      //   console.log(doc.id, ' => ', doc.data())
      // })
    })
    .catch(error => {
      console.log('Error getting documents: ', error)
    })
  // console.log(hungak)

  /// Kiểm tra phòng host
  const selectedRoomHost = React.useMemo(
    () => roomHost.find(room => room.id === selectedRoomId) || {},
    [roomHost, selectedRoomId]
  )
  // console.log(selectedRoomHost)
  const selectedRoomClient = React.useMemo(
    () => roomClient.find(room => room.id === selectedRoomId) || {},
    [roomClient, selectedRoomId]
  )
  // console.log(selectedRoomClient)

  // / Đây là lấy ra địa chỉ hiện tại của người dùng lúc đã nhập khi vào 1 phòng nào đó

  // const curAddCondition = React.useMemo(() => {
  //   return {
  //     fieldName: 'user_id',
  //     operator: '==',
  //     compareValue: selectedRoomHost.user_id
  //   }
  // }, [selectedRoomHost])
  // const curAdd = useFirestore('user_room', curAddCondition)
  // console.log(curAdd)

  return (
    <AppContext.Provider
      value={{
        curraddName,
        setCurrAddName,
        selectedRoomId,
        setSelectedRoomId,
        roomClient,
        roomHost,
        selectedRoomHost,
        selectedRoomClient,
        locationVote,
        setLocationVote,
        list,
        setList,
        currLocation,
        setCurrLocation,
        nickname,
        setNickName
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
