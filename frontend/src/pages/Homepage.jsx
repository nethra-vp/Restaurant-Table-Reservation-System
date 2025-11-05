import React from 'react'
import Hero from '../Components/Hero'
import Menu from '../Components/Menu'
import ReservationForm from '../Components/ReservationForm'

const Homepage = () => {
  return (
    <div>
      <div id = 'home'>
        <Hero/>
      </div>
      <div id = 'menu'>
        <Menu/>
      </div>
      <div id = 'reservations'>
        <ReservationForm/>
      </div>
    </div>
  )
}

export default Homepage