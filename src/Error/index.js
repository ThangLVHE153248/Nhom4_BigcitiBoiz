import 'bootstrap/dist/css/bootstrap.min.css'
import { useNavigate } from 'react-router-dom'

function Error() {
  const navigate = useNavigate()
  var handleGoLogin = () => {
    // e.preventDefault()
    navigate('/')
  }
  return (
    <div className="container">
      <div>Trang này không hiển thị</div>
      <div>Có thể liên kết đã hỏng hoặc trang đã bị gỡ</div>
      <div>Hãy kiểm tra xem liên kết mà bạn đang cố mở có chính xác không.</div>
      <button onClick={e => handleGoLogin(e)} className="btn login_btn">Trở về Trang đăng nhập</button>
    </div>
  )
}

export default Error
