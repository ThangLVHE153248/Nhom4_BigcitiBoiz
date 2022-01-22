import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Redirect } from 'react-router-dom'
import { Container, Row, Col, Button } from 'reactstrap'
import InputForm from '../components/InputForm'
import { AuthContext } from '../Context/AuthProvider'
import { auth, db } from '../firebase/config'
import { addDocument } from '../firebase/services'
import Mapbox from './mapbox'
import ModalForm from '../components/ModalForm'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { AppContext } from '../Context/AppProvider'
import LogOut from '../components/LogOut'

export default function LoginForm() {
  let navigate = useNavigate()
  const { curraddName, selectedRoomId, setCurrLocation, nickname, setNickName } = useContext(AppContext)
  const { roomClient } = useContext(AppContext)

  const [show, setShow] = useState(false)

  const handleGoBack = () => {
    navigate(-1)
  }
  const {
    user: { displayName, uid, photoURL }
  } = useContext(AuthContext)

  const onClose = () => {
    setShow(false)
  }
  const formik = useFormik({
    initialValues: {
      full_name: nickname
    },
    validationSchema: Yup.object({
      full_name: Yup.string()
        .min(2, 'Tên Phải Chứa Ít Nhất 2 Ký Tự')
        .max(30, 'Tên Chứa Tối Đa 30 Ký Tự')
        .required('Tên Không Được Để Trống!')
    }),
    onSubmit: values => {
      const { full_name } = values
      setCurrLocation(curraddName)
      console.log(curraddName)
      setNickName(full_name)

      // addDocument('user_room', {
      //   currentLocation: curraddName,
      //   nickname: values.full_name,
      //   user_id: uid
      // })
      // console.log(selectedRoomId)
      selectedRoomId ? navigate(`/room-vote/${selectedRoomId}`) : navigate('/create')
      if (selectedRoomId) {
        addDocument('user_room', {
          currentLocation: curraddName,
          nickname: values.full_name,
          user_id: uid,
          avatar: photoURL,
          room_id: selectedRoomId
        })
      }
    }
  })

  return (
    <div className="add_form">
      <div className="krqetT"></div>
      <div className="ifKAln"></div>
      <LogOut />
      <Container>
        <div className="form_bg">
          <Row>
            <Col lg={5} className="form_left">
              <h1
                style={{
                  color: '#000',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  padding: '10px',
                  fontSize: '28px'
                }}
              >
                Chào mừng {displayName} đến với App Cùng Đi Chơi
              </h1>
              <form onSubmit={formik.handleSubmit}>
                <div className="login_wrapper">
                  <div className="formsix-pos">
                    <div className="form-group">
                      <InputForm
                        type="text"
                        id="Text1"
                        placeholder={formik.values.full_name ? formik.values.full_name : 'Tên Người Dùng *'}
                        name="full_name"
                        defaultValue={formik.values.full_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.errors.full_name && formik.touched.full_name && (
                        <p className="msg_err">{formik.errors.full_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="formsix-e">
                    <div className="form-group">
                      <div className="address_vote">
                        <div className="">{curraddName}</div>
                        <div
                          className="btn_address"
                          onClick={e => {
                            e.preventDefault()
                            setShow(true)
                          }}
                        >
                          {curraddName ? 'Sửa địa chỉ' : 'Nhập địa chỉ của bạn'}
                        </div>
                        <ModalForm
                          show={show}
                          onHide={() => setShow(false)}
                          ModalTile={''}
                          ModalChildren={<Mapbox onClose={onClose} />}
                          size="xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="login_btn_wrapper">
                    <button type="submit" onClick={e => handleGoBack(e)} className="btn login_btn">
                      Trở Về
                    </button>
                    <button
                      type="submit"
                      className="btn login_btn"
                      disabled={!(formik.isValid && formik.dirty && curraddName.length != 0)}
                    >
                      Tiếp Theo
                    </button>
                  </div>
                </div>
              </form>
            </Col>
            <Col lg={7} className="div_bg">
              <img
                src={'http://moitruongdulich.vn/mypicture/images/2020/CNMN42020/185ISO-21401.jpg'}
                className="img_bg"
              />
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  )
}
