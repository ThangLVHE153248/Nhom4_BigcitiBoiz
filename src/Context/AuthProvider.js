import React from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase/config'

export const AuthContext = React.createContext()

export default function AuthProvider({ children }) {
  const [user, setUser] = React.useState({})
  const navigate = useNavigate()
  // const [loading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const unsubscibed = auth.onAuthStateChanged(user => {
      localStorage.setItem('uid', user.uid)
      if (user) {
        const { displayName, email, uid, photoURL } = user
        setUser({
          displayName,
          email,
          uid,
          photoURL
        })
        return
      }

      // reset user info
      setUser({})
      navigate('/login')
    })

    // clean function
    return () => {
      unsubscibed()
    }
  }, [navigate])
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}
