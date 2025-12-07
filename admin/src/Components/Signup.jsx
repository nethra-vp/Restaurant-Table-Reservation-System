import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Signup = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [showLogin, setShowLogin] = useState(false)
  const navigate = useNavigate()

  const OnSubmitHandler = async (e) => {
    try {
      e.preventDefault()

      if (password !== confirmPassword) {
        return toast.error('Passwords do not match')
      }

      if (password.length < 6) {
        return toast.error('Password must be at least 6 characters')
      }

      const response = await axios.post(backendUrl + '/api/user/signup', {
        email,
        password,
        role
      })

      if (response.data.success) {
        setToken(response.data.token)
        toast.success('Account created successfully!')
        navigate('/add')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (showLogin) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-100'>
        <div className='bg-white shadow-md rounded-lg px-8 py-6 w-full max-w-md'>
          <h1 className='text-2xl font-bold text-center text-gray-800 mb-4'>Admin Login</h1>

          <form onSubmit={(e) => {
            e.preventDefault()
            // Navigate to login (reset state and show login form)
            window.location.href = '/'
          }}>
            <div className='mb-4'>
              <p className='text-sm font-semibold text-gray-600 mb-2'>Email Address</p>
              <input type="email" placeholder="Enter email address" required className='w-[95%] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-800' />
            </div>
            <div className='mb-4'>
              <p className='text-sm font-semibold text-gray-600 mb-2'>Password</p>
              <input type="password" placeholder="Enter password" required className='w-[95%] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-800' />
            </div>
            <button type='submit' className='w-full px-3 py-2 text-lg font-bold bg-amber-500 rounded-md'>Login</button>
          </form>

          <p className='text-center text-sm mt-4 text-gray-600'>
            Don't have an account?{' '}
            <button
              onClick={() => setShowLogin(false)}
              className='text-amber-500 font-semibold hover:underline'
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='flex justify-center items-center min-h-screen bg-gray-100'>
        <div className='bg-white shadow-md rounded-lg px-8 py-6 w-full max-w-md'>
          <h1 className='text-2xl font-bold text-center text-gray-800 mb-4'>Create Admin Account</h1>

          <form onSubmit={OnSubmitHandler}>
            <div className='mb-4'>
              <p className='text-sm font-semibold text-gray-600 mb-2'>Email Address</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                className='w-[95%] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-800'
              />
            </div>

            <div className='mb-4'>
              <p className='text-sm font-semibold text-gray-600 mb-2'>Password</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                required
                className='w-[95%] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-800'
              />
            </div>

            <div className='mb-4'>
              <p className='text-sm font-semibold text-gray-600 mb-2'>Confirm Password</p>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className='w-[95%] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-800'
              />
            </div>

            <button type='submit' className='w-full px-3 py-2 text-lg font-bold bg-amber-500 rounded-md text-white hover:bg-amber-600'>
              Create Account
            </button>
          </form>

          <p className='text-center text-sm mt-4 text-gray-600'>
            Already have an account?{' '}
            <button
              onClick={() => setShowLogin(true)}
              className='text-amber-500 font-semibold hover:underline'
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
