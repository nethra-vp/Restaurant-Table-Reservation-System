import React from 'react'
import Navbar from './Components/Navbar'
import {Routes, Route} from 'react-router-dom'
import Homepage from './pages/Homepage'
import Footer from './Components/Footer'
import { ToastContainer } from 'react-toastify'

export const backendUrl = 'http://localhost:4000'

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Navbar/>
      <Routes>
        <Route path = '/' element = {<Homepage/>} />
      </Routes>
      {/* <Footer/> */}
    </div>
  )
}

export default App