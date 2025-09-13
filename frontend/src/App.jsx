import React from 'react'
import Navbar from './Components/Navbar'
import {Routes, Route} from 'react-router-dom'
import Homepage from './pages/Homepage'
import Footer from './Components/Footer'

const App = () => {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path = '/' element = {<Homepage/>} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App