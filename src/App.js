import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AuthProvider from './Context/AuthProvider'
import GroupForm from './GroupForm'
import LoginForm from './LoginForm'
import LoginSocial from './LoginSocial'
import HomeSidebar from './HomeSidebar'
import AnnouncingVote from './AnnouncingVote/announcingVote'
import Home from './home'
import LoadingLink from './LoadingLink'
import AppProvider from './Context/AppProvider'
import ListRoom from './ListRoom/ListRoom'
import GuestPage from './pages/RulePage/GuestPage'
import PrivatePage from './pages/RulePage/PrivatePage'
import ErrorPage from './pages/Loading/ErrorPage'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route element={<GuestPage />}>
            <Route path="login" element={<LoginSocial />} />
          </Route>
          <Route element={<PrivatePage />}>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<LoginForm />} />
            <Route path="/create" element={<GroupForm />} />
            <Route path="/announcingVote" element={<AnnouncingVote />} />

            <Route path="/list-room" element={<ListRoom />} />
            <Route path="/:linkRoom" element={<LoadingLink />} />
            <Route path="/:error" element={<ErrorPage />} />
          </Route>
          <Route path="/room-vote/:id" element={<HomeSidebar />} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
