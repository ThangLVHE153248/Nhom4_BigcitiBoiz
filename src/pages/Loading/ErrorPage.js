import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useNavigate } from 'react-router-dom'

export default function ErrorPage() {
  const navigate = useNavigate()
  var handleGoLogin = () => {
    navigate('/login')
  }
  return (
    <div className="container">
      <div>Trang này không hiển thị</div>
      <div>Có thể liên kết đã hỏng hoặc trang đã bị gỡ</div>
      <div>Hãy kiểm tra xem liên kết mà bạn đang cố mở có chính xác không.</div>
      <button onClick={e => handleGoLogin(e)} className="btn login_btn">
        Trở về Trang đăng nhập
      </button>
    </div>
  )
}
