import React from 'react'

const Navbar = () => {
  return (
    <div>
      <nav className='flex justify-between p-[2rem] bg-black text-white'>
        <div>
          <h2 className='font-bold text-2xl'>RESTO BISTRO</h2>
        </div>
        <div>
          <ul className='flex justify-between gap-8'>
            <li className='font-bold text-lg cursor-pointer hover:text-amber-400'>HOME</li>
            <li className='font-bold text-lg cursor-pointer hover:text-amber-400'>RESERVATIONS</li>
            <li className='font-bold text-lg cursor-pointer hover:text-amber-400'>MENU</li>
            <li className='font-bold text-lg cursor-pointer hover:text-amber-400'>CONTACT</li>
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default Navbar