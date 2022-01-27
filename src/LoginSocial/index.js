import React, { useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Container, Row, Col } from 'reactstrap'
import { AppContext } from '../Context/AppProvider'
import firebase, { auth } from '../firebase/config'
import { addDocument } from '../firebase/services'
import './styles.css'
import { BsFacebook, BsGoogle } from 'react-icons/bs'
import { AiFillGoogleCircle } from 'react-icons/ai'

const fbProvider = new firebase.auth.FacebookAuthProvider()
const googleProvider = new firebase.auth.GoogleAuthProvider()

function LoginSocial({ setIsAuth }) {
  const roomId = localStorage.getItem('roomId')
  console.log(roomId)
  const navigate = useNavigate()

  const handleLogin = async provider => {
    const { additionalUserInfo, user } = await auth.signInWithPopup(provider)
    roomId ? navigate(`/room-vote/${roomId}`) : navigate('/')
    // localStorage.removeItem('roomId')

    if (additionalUserInfo?.isNewUser && user) {
      addDocument('users', {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid,
        photoURL: user.photoURL,
        uid: user.uid,
        providerId: additionalUserInfo.providerId
      })
    }
  }
  return (
    <div className="login_social">
      <Container>
        <div className="login_content height_content">
          <Row>
            <Col md={6} lg={6} className="height_content">
              <img
                src={'https://image.freepik.com/free-vector/young-people-with-thumb-like-symbol_23-2148120730.jpg'}
                className="img_banner"
              />
            </Col>
            <Col md={6} lg={6} className="height_content">
              <div className="login_item">
                <h1>Chào Mừng Bạn Đến Với App Cùng Đi Chơi!</h1>
                <h5>Một ứng dụng tuyệt vời để chọn lựa địa điểm đi chơi cùng bạn bè</h5>
                <button onClick={() => handleLogin(fbProvider)} className="facebook">
                  <BsFacebook className="icon-login" />
                  <span>Đăng Nhập Facebook</span>
                </button>

                <button onClick={() => handleLogin(googleProvider)} className="google">
                  <BsGoogle className="icon-login" />
                  Đăng Nhập Google
                </button>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  )
}

export default LoginSocial
