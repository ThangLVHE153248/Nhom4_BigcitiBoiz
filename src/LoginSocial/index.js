import React, { useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Container, Row, Col } from 'reactstrap'
import { AppContext } from '../Context/AppProvider'
import firebase, { auth } from '../firebase/config'
import { addDocument } from '../firebase/services'
import './styles.css'

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
              <img src={'https://preview.hqtemplate.com/preview16/images/pic-login-2.svg'} className="img_banner" />
            </Col>
            <Col md={6} lg={6} className="height_content">
              <div className="login_item">
                <h1>Chào Mừng Bạn Đến Với App Cùng Đi Chơi!</h1>
                <button onClick={() => handleLogin(fbProvider)} className="facebook">
                  <img
                    src={'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png'}
                    className="icon_social"
                  />
                  <span>Đăng Nhập Facebook</span>
                </button>

                <button onClick={() => handleLogin(googleProvider)} className="google">
                  <img
                    src={
                      'https://www.socialflow.com/wp-content/uploads/2019/01/8ca486faebd822ddf4baf00321b16df1-google-icon-logo-by-vexels.png'
                    }
                    className="icon_social"
                  />
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
