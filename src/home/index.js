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

function Home() {
  const {
    user: { uid, displayName }
  } = useContext(AuthContext)
  const { roomClient, roomHost, setSelectedRoomId, selectedRoomHost, selectedRoomClient } = useContext(AppContext)
  const [hasFocus, setFocus] = useState(false)

  const navigate = useNavigate()
  const handleCLick = e => {
    e.preventDefault()
    navigate('/contact')
  }
 
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

  React.useEffect(() => {
    // console.log(currAddHost)
  }, [currAddHost])
  React.useEffect(() => {
    console.log(currAddClient)
  }, [currAddClient])

  const handleJoinRoom = value => {
    console.log(value)
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
          console.log('Document data:', doc.data())
          const { member } = doc.data()
          if (!member.includes(uid)) {
            clickRoom.update({
              member: [...member, uid]
            })
          }

          setSelectedRoomId(values.content)

          navigate(`/room-vote/${values.content}`)
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
          <h1 className="home_title">Cuộc bình chọn đi chơi chất lượng. Giờ đây miễn phí cho tất cả mọi người.</h1>
          <div className="span_title">
            Chúng tôi đã thiết kế lại App Cùng Đi Chơi — dịch vụ tổ chức cuộc bình chọn với độ bảo mật cao — để cung cấp
            miễn phí cho mọi người.
          </div>
          <div className="home_left">
            <div className="home_item">
              <button onClick={e => handleCLick(e)} className="btn_add">
                <span>Cuộc Bình Chọn Mới</span>
              </button>
              <form onSubmit={formik.handleSubmit}>
                <InputForm
                  type="text"
                  id="Text1"
                  placeholder="Nhập mã phòng tại đây"
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
            <div className="list_room">
              <button key={room.id} className="btn_address" onClick={() => handleJoinRoom(room.id)}>
                {room.title}
              </button>
              <button className="login_btn" onClick={handleDelete} style={{ marginTop: '20px', marginLeft: '20px' }}>
                Xóa
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
            <div className="list_room">
              <button key={room.id} className="btn_address" onClick={() => handleJoinRoom(room.id)}>
                {room.title}
              </button>
              <button className="login_btn" onClick={handleDelete} style={{ marginTop: '20px', marginLeft: '20px' }}>
                Xóa
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
