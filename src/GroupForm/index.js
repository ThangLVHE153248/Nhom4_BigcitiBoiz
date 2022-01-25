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
import { AiFillDelete } from 'react-icons/ai'
import { BsArrowReturnLeft, BsArrowReturnRight } from 'react-icons/bs'

function GroupForm() {
  const {
    user: { uid, photoURL }
  } = React.useContext(AuthContext)
  const { locationVote, currLocation, nickname, setCurrLocation, setNickName, setLocationVote, setSelectedRoomId } =
    React.useContext(AppContext)
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [shows, setShows] = useState(false)
  const [value, SetValue] = useState('')
  const [index, SetIndex] = useState('')

  const [nameAddress, SetnameAddress] = useState('')

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
        .max(512, 'Nội Dung Tối Đa 512 Ký Tự')
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
            member: [uid],
            client: [],
            user_id: uid
          })
          .then(docRef => {
            console.log('Document written with ID: ', docRef.id)
            addDocument('user_room', {
              currentLocation: currLocation,
              nickname: nickname,
              avatar: photoURL,
              user_id: uid,
              room_id: docRef.id
            })
            setNickName('')
            setCurrLocation('')
            setSelectedRoomId('')
            navigate(`/room-vote/${docRef.id}`)
          })
          .catch(error => {
            console.error('Error adding document: ', error)
          })
      } else {
        alert('bạn cần nhập địa chỉ')
      }
    }
  })
  //Xoá địa chỉ
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
  }
  const handleEdit = (value, index) => {
    console.log(value, index)
    // const updateLocation = [...locationVote]
    // updateLocation[index] = value
    // setLocationVote(updateLocation)
    SetValue(value)
    SetIndex(index)
    setShow(true)
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
                        placeholder="Tiêu Đề *"
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
                        placeholder="Nội Dung *"
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
                      ModalChildren={<MapboxLocationVote onClose={onClose} value={value} index={index} />}
                      size="xl"
                    />
                  </div>

                  <div className="address_vote">
                    {locationVote.map((value, index) => (
                      <div className="list_room" key={index}>
                        <button type="button" className="btn_address" onClick={() => handleEdit(value, index)}>
                          {value}
                        </button>
                        <button className="login_btn btn_delete" type="button" onClick={() => onDelete(`${value}`)}>
                          <AiFillDelete />
                        </button>
                      </div>
                    ))}

                    <ModalForm
                      show={show}
                      onHide={() => setShow(false)}
                      ModalTile={''}
                      ModalChildren={<Mapbox onClose={onClose} value={value} index={index} />}
                      size="xl"
                    />
                  </div>

                  <div className="login_btn_wrapper" style={{ marginTop: '50px' }}>
                    <button type="submit" onClick={e => handleGoBack(e)} className="btn login_btn">
                      <BsArrowReturnLeft /> {''}
                      Trở Về
                    </button>
                    <button
                      type="submit"
                      className="btn login_btn"
                      disabled={!(formik.isValid && formik.dirty && locationVote.length != 0)}
                    >
                      <BsArrowReturnRight /> {''}
                      Tạo Phòng Bình Chọn
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
