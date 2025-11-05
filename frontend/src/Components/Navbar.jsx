import React from 'react'

const Navbar = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    if(section) {
      section.scrollIntoView({behavior : 'smooth'})
    }
  }

  return (
    <div>
      <nav className='flex justify-between p-[2rem] bg-black text-white'>
        <div>
          <h2 className='font-bold text-2xl cursor-pointer' onClick={() => scrollToSection('home')}>RESTO BISTRO</h2>
        </div>
        <div>
          <ul className='flex justify-between gap-8'>
            <li className='font-bold text-lg cursor-pointer hover:text-amber-400' onClick={() => scrollToSection('home')}>HOME</li>
            <li className='font-bold text-lg cursor-pointer hover:text-amber-400' onClick={() => scrollToSection('reservations')}>RESERVATIONS</li>
            <li className='font-bold text-lg cursor-pointer hover:text-amber-400' onClick={() => scrollToSection('menu')}>MENU</li>
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default Navbar