import React, { useState } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import InputForm from '../components/InputForm'
import ModalForm from '../components/ModalForm'
import './styles.css'
import { useNavigate } from 'react-router-dom'
import Mapbox from '../MapAddAddress/mapbox'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { db } from '../firebase/config'
import { AuthContext } from '../Context/AuthProvider'
import useFirestore from '../hooks/useFirestore'
import AppProvider, { AppContext } from '../Context/AppProvider'
import { addDocument } from '../firebase/services'
import MapboxLocationVote from '../MapAddAddress/mapboxLocationVote'
import LogOut from '../components/LogOut'

function GroupForm() {
  const {
    user: { uid, photoURL }
  } = React.useContext(AuthContext)
  const { locationVote, setLocationVote, curraddName, setCurrAddName, nickname, currLocation } =
    React.useContext(AppContext)
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [shows, setShows] = useState(false)

  const handleGoBack = () => {
    navigate('/contact')
  }
  const onClose = () => {
    setShow(false)
    setShows(false)
  }

  React.useEffect(() => {
    if (!currLocation || !nickname) {
      navigate('/contact')
    }
  })

  const formik = useFormik({
    initialValues: {
      label: '',
      content: ''
    },
    validationSchema: Yup.object({
      label: Yup.string()
        .min(2, 'Tiêu Đề Phải Chứa Ít Nhất 2 Ký Tự')
        .max(30, 'Tiêu Đề Chứa Tối Đa 30 Ký Tự')
        .required('Tiêu Đề Không Được Để Trống!'),
      content: Yup.string()
        .min(2, 'Nội Dung Phải Chứa Ít Nhất 2 Ký Tự')
        .max(30, 'Nội Dung Tối Đa 512 Ký Tự')
        .required('Nội Dung Không Được Để Trống!')
    }),
    onSubmit: values => {
      if (locationVote.length > 0) {
        db.collection('rooms')
          .add({
            title: values.label,
            description: values.content,
            max_location: 5,
            vote_status: true,
            member: [],
            user_id: uid
          })
          .then(docRef => {
            db.collection('rooms')
              .orderBy('createdAt')
              .where('user_id', '==', uid)
              .onSnapshot(snapshot => {
                const documents = snapshot.docs.map(doc => ({
                  ...doc.data(),
                  id: doc.id
                }))
                const newRoom = documents[documents.length - 1]
                console.log(newRoom)
                addDocument('user_room', {
                  currentLocation: currLocation,
                  nickname: nickname,
                  avatar: photoURL,
                  user_id: uid,
                  room_id: docRef.id
                })

                navigate(`/room-vote/${docRef.id}`)
              })
          })
      } else {
        alert('bạn cần nhập địa chỉ')
      }

      // alert(JSON.stringify(values, null, 2))
    }
  })

  const onDelete = value => {
    //  db.child(`location/${value}`).remove();
    console.log(locationVote)
    // const item = locationVot
    // const item =[];
    for (let i = 0; i < locationVote.length; i++) {
      if (locationVote[i] === value) {
        locationVote.splice(i, 1)
        break
      }
    }
    setLocationVote([...locationVote])

    // const deleteAddress = firebase.database().ref('user_room').child(locationVote.id)
    // const item = locationVote.pop();
    // console.log(locationVote)
    // setLocationVote(item =>[...item])

    // deleteAddress.remove()
    // locationVote.remove()
    // setLocationVote(locationVote)
    // setShow(false);
    // console.log(deleteAddress)
  }

  return (
    <div className="add_form">
      <div className="krqetT"></div>
      <div className="ifKAln"></div>
      <LogOut />
      <Container>
        <div className="form_bg">
          <Row>
            <Col lg={7} className="div_bg">
              <img
                src={'http://moitruongdulich.vn/mypicture/images/2020/CNMN42020/185ISO-21401.jpg'}
                className="img_bg"
              />
            </Col>
            <Col lg={5} className="form_left">
              <form onSubmit={formik.handleSubmit}>
                <div className="login_wrapper">
                  <div className="formsix-pos">
                    <div className="form-group">
                      <InputForm
                        type="text"
                        id="Text1"
                        placeholder="Tiêu đề *"
                        name="label"
                        defaultValue={formik.values.label}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.errors.label && formik.touched.label && <p className="msg_err">{formik.errors.label}</p>}
                    </div>
                  </div>
                  <div className="formsix-e">
                    <div className="form-group i-password">
                      <InputForm
                        type="text"
                        id="Text2"
                        placeholder="Nội dung *"
                        name="content"
                        defaultValue={formik.values.content}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.errors.content && formik.touched.content && (
                        <p className="msg_err">{formik.errors.content}</p>
                      )}
                    </div>
                  </div>

                  <div className="login_btn_wrapper" style={{ textAlign: 'left' }}>
                    <a href="#" className="btn btn-primary" onClick={() => setShows(true)}>
                      Thêm địa điểm
                    </a>
                    <ModalForm
                      show={shows}
                      onHide={() => setShows(false)}
                      ModalTile={''}
                      ModalChildren={<MapboxLocationVote onClose={onClose} />}
                      size="xl"
                    />
                  </div>

                  <div className="address_vote">
                    {locationVote.map((value, index) => (
                      <div className="location_adrress" key={index}>
                        <button type="button" className="btn_address" onClick={() => setShow(true)}>
                          {value}
                        </button>
                        <button type="button" onClick={() => onDelete(`${value}`)} className="btn_delete_address">
                          {' '}
                          <span className="icon_delete">X</span>{' '}
                        </button>
                      </div>
                    ))}

                    <ModalForm
                      show={show}
                      onHide={() => setShow(false)}
                      ModalTile={''}
                      ModalChildren={<Mapbox onClose={onClose} />}
                      size="xl"
                    />
                  </div>

                  <div className="login_btn_wrapper" style={{ marginTop: '50px' }}>
                    <button type="submit" onClick={e => handleGoBack(e)} className="btn login_btn">
                      Trở Về
                    </button>
                    <button
                      type="submit"
                      className="btn login_btn"
                      disabled={!(formik.isValid && formik.dirty && locationVote.length != 0)}
                    >
                      TẠO PHÒNG BÌNH CHỌN
                    </button>
                  </div>
                </div>
              </form>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  )
}

export default GroupForm
