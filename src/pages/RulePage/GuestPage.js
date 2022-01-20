import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthProvider'

function GuestPage() {
  const user = localStorage.getItem('uid')
  console.log(user)
  const isMember = !!user
  console.log(isMember)
  return !isMember ? <Outlet /> : <Navigate to="/home" />
}
export default GuestPage
