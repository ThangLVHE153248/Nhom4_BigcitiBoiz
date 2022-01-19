import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthProvider from './Context/AuthProvider'
import GroupForm from './GroupForm'
import LoginForm from './LoginForm'
import LoginSocial from './LoginSocial'
import HomeSidebar from './HomeSidebar'
import AnnouncingVote from './AnnouncingVote/announcingVote'
import Home from './home'
import AppProvider from './Context/AppProvider'
import ListRoom from './ListRoom/ListRoom'
import { useNavigate } from 'react-router-dom'

function App() {
  // const navigate = useNavigate()
  const [isAuth, setIsAuth] = React.useState(localStorage.getItem('isAuth'))

  // if (isAuth) {
  //   navigate('/home')
  // }
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route element={<LoginSocial setIsAuth={setIsAuth} />} path="login" />
            <Route element={<LoginForm />} path="/contact" />
            <Route element={<GroupForm />} path="/create" />
            <Route element={<HomeSidebar />} path={'/room-vote/:id'} />
            <Route element={<AnnouncingVote />} path={'/announcingVote'} />
            <Route element={<Home />} path={'/home'} />
            <Route element={<ListRoom />} path={'/list-room'} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
