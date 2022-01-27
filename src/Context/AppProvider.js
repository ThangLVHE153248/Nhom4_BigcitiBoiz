import React, { useState } from 'react'
import useGetDataFirebase from '../hooks/useGetDataFirebase'
import { AuthContext } from './AuthProvider'

export const AppContext = React.createContext()

export default function AppProvider({ children }) {
  const [curraddName, setCurrAddName] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [locationVote, setLocationVote] = useState([])
  const [list, setList] = useState([])
  const [currLocation, setCurrLocation] = useState('')
  const [nickname, setNickName] = useState('')
  const [Member, setMember] = useState([])

  const {
    user: { uid }
  } = React.useContext(AuthContext)

  //// Đây là lấy ra các danh sách phòng mà người dùng là khách(client)
  const roomsClientCondition = React.useMemo(() => {
    return {
      fieldName: 'client',
      operator: 'array-contains',
      compareValue: uid
    }
  }, [uid])
  const roomClient = useGetDataFirebase('rooms', roomsClientCondition)
  // console.log('client', roomClient)

  //// Đây là lấy ra các danh sách mà người dùng là chủ (host)
  const roomsHostCondition = React.useMemo(() => {
    return {
      fieldName: 'user_id',
      operator: '==',
      compareValue: uid
    }
  }, [uid])
  const roomHost = useGetDataFirebase('rooms', roomsHostCondition)
  // console.log('host', roomHost)

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
        setNickName,
        Member,
        setMember
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
