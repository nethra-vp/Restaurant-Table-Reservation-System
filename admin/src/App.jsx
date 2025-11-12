import React, { useEffect, useState } from 'react'
import Login from './Components/Login'
import Sidebar from './Components/Sidebar'
import AddMenu from './pages/AddMenu'
import ListMenu from './pages/ListMenu'
import AdminTable from './pages/AdminTable'
import ListCustomer from './pages/ListCustomer'
import AddCustomer from './pages/AddCustomer'
import ListTable from './pages/ListTable'
import {Routes, Route, Navigate} from 'react-router-dom'
import {ToastContainer} from 'react-toastify'

export const backendUrl = 'http://localhost:4000'
export const currency = "$"

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || "")

  useEffect(() => {
    if (token) {
       localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  return (
    <div className='bg-white min-h-screen'>
      <ToastContainer/>
      {
        !token ? (<Login setToken = {setToken}/>) : (
          <>
            <div className='flex w-full'>
              <Sidebar setToken = {setToken}/>
              <div className='w-[70%] ml-[max(5vw, 25px)] my-8 text-black text-base'>
                <Routes>
                  <Route path='/' element={<Navigate to='/add' replace />} />
                  <Route path = '/add' element = {<AddMenu token = {token}/>} />
                  <Route path = '/list' element = {<ListMenu token = {token}/>} />
                  <Route path = '/table' element = {<AdminTable token = {token} />} />
                  <Route path = '/customers' element = {<ListCustomer token = {token} />} />
                  <Route path = '/add-customer' element = {<AddCustomer token = {token} />} />
                  <Route path = '/tables' element = {<ListTable token = {token} />} />
                </Routes>
              </div>
            </div>
          </>
        )
      }
    </div>
  )
}

export default App