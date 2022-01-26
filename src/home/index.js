import React, { useContext, useState, useEffect } from 'react'
import { Container, Row, Col } from 'reactstrap'
import Carousel from 'react-bootstrap/Carousel'
import { useNavigate } from 'react-router-dom'
import InputForm from '../components/InputForm'
import './styles.css'
import { AppContext } from '../Context/AppProvider'
import { db } from '../firebase/config'
import { AuthContext } from '../Context/AuthProvider'
import useCurrAdd from '../hooks/useCurrAdd'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import LogOut from '../components/LogOut'
import { FaVoteYea } from 'react-icons/fa'
import { AiFillDelete } from 'react-icons/ai'

function Home() {
  const {
    user: { uid, displayName }
  } = useContext(AuthContext)
  const {
    roomClient,
    roomHost,
    setSelectedRoomId,
    selectedRoomHost,
    selectedRoomClient,
    setCurrLocation,
    setCurrAddName
  } = useContext(AppContext)
  const [hasFocus, setFocus] = useState(false)

  const navigate = useNavigate()
  const handleCLick = e => {
    e.preventDefault()
    setCurrLocation('')

    setCurrAddName('')
    navigate('/contact')
  }

  db.collection('rooms')
    .orderBy('createdAt')
    .where('user_id', '==', '4qh5ZZkhSFVCJm2hInWNuKgNUcA3')
    .onSnapshot(snapshot => {
      const documents = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }))
    })

  const conditionHost = React.useMemo(() => {
    return {
      fieldName: 'room_id',
      operator: '==',
      compareValue: selectedRoomHost.id
    }
  }, [selectedRoomHost.id])
  const conditonUser = React.useMemo(() => {
    return {
      fieldName: 'user_id',
      operator: '==',
      compareValue: uid
    }
  }, [uid])

  const conditionClient = React.useMemo(() => {
    return {
      fieldName: 'room_id',
      operator: '==',
      compareValue: selectedRoomClient.id
    }
  }, [selectedRoomClient.id])

  const currAddHost = useCurrAdd('user_room', conditionHost, conditonUser)
  const currAddClient = useCurrAdd('user_room', conditionClient, conditonUser)

  // React.useEffect(() => {
  //   // console.log(currAddHost)
  // }, [currAddHost])
  // React.useEffect(() => {
  //   console.log(currAddClient)
  // }, [currAddClient])

  const handleJoinRoom = value => {
    setSelectedRoomId(value)
    // localStorage.setItem('roomId', value)
    navigate(`/room-vote/${value}`)
  }
  const formik = useFormik({
    initialValues: {
      content: ''
    },
    validationSchema: Yup.object({
      content: Yup.string()
        .min(2, 'Nội Dung Phải Chứa Ít Nhất 2 Ký Tự')
        .max(30, 'Nội Dung Tối Đa 512 Ký Tự')
        .required('Nội Dung Không Được Để Trống!')
    }),
    onSubmit: values => {
      const clickRoom = db.collection('rooms').doc(values.content)
      // alert(JSON.stringify(values, null, 2))
      clickRoom.get().then(doc => {
        if (doc.exists) {
          const { member, client } = doc.data()
          if (!member.includes(uid)) {
            clickRoom.update({
              member: [...member, uid],
              client: [...client, uid]
            })
          } else {
            alert('Bạn đã vào phòng này rồi vui lòng kiểm tra trong mục phòng đã tham gia!')
            return
          }

          setSelectedRoomId(values.content)

          navigate(`/contact`)
        } else {
          // doc.data() will be undefined in this case
          alert('Phòng này không tồn tại')
        }
      })
    }
  })

  const handleFocus = () => {
    if (formik.values.content) {
      setFocus(true)
    } else {
      setFocus(false)
    }
  }

  const handleDelete = id => {
    console.log('Xoá btn')
  }

  // tabs
  const [currentTab, setCurrentTab] = useState('tab1')
  const tabList = [
    {
      name: 'tab1',
      label: 'Chung',
      content: (
        <div className="tab-content">
          <h1 className="home_title">Chọn lựa nơi đi chơi thật nhanh chóng và tiện lợi.</h1>
          <div className="span_title">
            <div>Có quá nhiều lựa chọn? Các bạn đang tranh cãi để tìm ra địa điểm vui chơi lý tưởng?</div>
            Việc thống nhất địa điểm cho những cuộc vui giờ đây không còn là vấn đề. Cungdichoi cung cấp nền tảng để tổ
            chức các cuộc bầu chọn thật dễ dàng.
          </div>
          <div className="home_left">
            <div className="home_item">
              <button onClick={e => handleCLick(e)} className="btn_add">
                <span>
                  <FaVoteYea /> Cuộc Bình Chọn Mới
                </span>
              </button>
              <form onSubmit={formik.handleSubmit}>
                <InputForm
                  type="text"
                  id="Text1"
                  placeholder=" Nhập mã phòng tại đây"
                  name="content"
                  defaultValue={formik.values.content}
                  onChange={formik.handleChange}
                  onFocus={() => setFocus(true)}
                  onBlur={handleFocus}
                />
                {hasFocus ? (
                  <button type="submit" className="btn_tg" disabled={!(formik.isValid && formik.dirty)}>
                    Tham Gia
                  </button>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'tab2',
      label: 'Bình Chọn Của Bạn',
      content: (
        <div className="tab-content">
          <h2>Các Phòng Bạn Đã Tạo Bình Chọn</h2>
          {roomHost.map(room => (
            <div className="list_room" key={room.id}>
              <button className="btn_address" onClick={() => handleJoinRoom(room.id)}>
                {room.title}
              </button>
              <button className="login_btn btn_delete" onClick={handleDelete}>
                <AiFillDelete />
              </button>
            </div>
          ))}
        </div>
      )
    },
    {
      name: 'tab3',
      label: 'Bình Chọn Tham Gia',
      content: (
        <div className="tab-content">
          <h2>Các Phòng Bạn Đã Tham Gia</h2>
          {roomClient.map(room => (
            <div className="list_room" key={room.id}>
              <button className="btn_address" onClick={() => handleJoinRoom(room.id)}>
                {room.title}
              </button>
              <button className="login_btn btn_delete" onClick={handleDelete}>
                <AiFillDelete />
              </button>
            </div>
          ))}
        </div>
      )
    }
  ]
  return (
    <div className="home_body">
      <LogOut />
      <Container>
        <Row>
          <Col lg={6}>
            <div className="tabs">
              {tabList.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTab(tab.name)}
                  className={tab.name === currentTab ? 'tabs_active' : 'btn_tabs'}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {tabList.map((tab, i) => {
              if (tab.name === currentTab) {
                return <div key={i}>{tab.content}</div>
              } else {
                return null
              }
            })}
          </Col>
          <Col lg={6}>
            <Carousel>
              <Carousel.Item>
                <img
                  className="d-block img_slide"
                  src="https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg"
                  alt="First slide"
                />
                <Carousel.Caption>
                  <h3>Nhận đường liên kết bạn có thể chia sẻ</h3>
                  <p>
                    Nhấp vào <strong>Cuộc bình chọn mới</strong> để nhận đường liên kết mà bạn có thể gửi cho những
                    người mình muốn họp cùng
                  </p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <img
                  className="d-block img_slide"
                  src="https://www.gstatic.com/meet/user_edu_brady_bunch_light_81fa864771e5c1dd6c75abe020c61345.svg"
                  alt="Second slide"
                />

                <Carousel.Caption>
                  <h3>Xem mọi người cùng lúc</h3>
                  <p>
                    Để thấy nhiều người hơn cùng một lúc, hãy chuyển tới phần Thay đổi bố cục trong trình đơn Tùy chọn
                    khác.
                  </p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <img
                  className="d-block img_slide"
                  src="https://www.gstatic.com/meet/user_edu_scheduling_light_b352efa017e4f8f1ffda43e847820322.svg"
                  alt="Third slide"
                />

                <Carousel.Caption>
                  <h3>Lên kế hoạch trước</h3>
                  <p>
                    Nhấp vào <strong>Cuộc bình chọn mới</strong> để lên lịch cuộc bình chọn trong Lịch Google và gửi lời
                    mời cho người tham gia
                  </p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <img
                  className="d-block img_slide"
                  src="https://www.gstatic.com/meet/user_edu_safety_light_e04a2bbb449524ef7e49ea36d5f25b65.svg"
                  alt="Four slide"
                />

                <Carousel.Caption>
                  <h3>Cuộc họp của bạn được bảo vệ an toàn</h3>
                  <p>Không ai có thể tham gia cuộc họp trừ khi người tổ chức mời hoặc cho phép</p>
                </Carousel.Caption>
              </Carousel.Item>
            </Carousel>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Home
