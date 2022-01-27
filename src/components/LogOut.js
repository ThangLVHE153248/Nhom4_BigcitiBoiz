import React, { useRef, useContext } from 'react'
import './styles.css'
import { useOutsideClick } from './useOutsideClick'
import { AuthContext } from '../Context/AuthProvider'
import firebase, { auth } from '../firebase/config'
import { useNavigate } from 'react-router-dom'
import { IoIosLogOut } from 'react-icons/io'

function LogOut() {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const [isActive, setIsActive] = useOutsideClick(dropdownRef, false)
  const onClick = () => setIsActive(!isActive)

  const {
    user: { displayName, uid, photoURL }
  } = useContext(AuthContext)

  const signOutUser = () => {
    auth.signOut()
    localStorage.removeItem('uid')
    localStorage.removeItem('roomId')
    navigate('/login')
  }

  return (
    <div className="menu-container">
      <button onClick={onClick} className="menu-trigger">
        <span>{displayName}</span>
        <img src={photoURL} alt="User avatar" />
      </button>
      <nav ref={dropdownRef} className={`menu ${isActive ? 'active' : 'inactive'}`}>
        <ul>
          <li>
            <button onClick={signOutUser}>
              <IoIosLogOut /> Đăng Xuất
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default LogOut
