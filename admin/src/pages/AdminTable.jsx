import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'

const AdminTable = () => {
  const [reservations, setReservations] = useState([])

  // Fetch reservations function
  const fetchReservations = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/reservations/get')
      setReservations(response.data.reservations || [])
      console.log(response.data);
    } catch (error) {
      console.log("Error fetching reservations");
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this reservation?")
    if(!confirmDelete) return;

    try {
      const response = await axios.delete(`${backendUrl}/api/reservations/delete/${id}`)

      if(response.data.success) {
        toast.success(response.data.message || 'Reservation removed')
        // Always re-fetch reservations from backend for latest data
        await fetchReservations();
      }
      else {
        toast.error(response.data.message || "Failed to delete reservation")
      }
    } catch (error) {
      console.log("Error deleting reservation");
      toast.error("Failed to delete reservation")
    }
  }

  useEffect(() => {
    fetchReservations();
  }, [])
  return (
    <div>
      <h2 className='text-3xl font-bold text-gray-700 text-center mb-6'>Restaurant Reservations</h2>
      <div>
        <table className='ml-10 w-full shadow-lg rounded-xl'>
          <thead>
            <tr className='bg-amber-500 text-left'>
              <th className='p-3'>Name</th>
              <th className='p-3'>Email</th>
              <th className='p-3'>Phone</th>
              <th className='p-3'>Date</th>
              <th className='p-3'>Time</th>
              <th className='p-3'>Table</th>
              <th className='p-3'>Guests</th>
              <th className='p-3'>Delete</th>
            </tr>
          </thead>

          <tbody>
            {
              reservations.length === 0 ? (
                <tr>
                  <td colSpan="8" className='p-4 text-center'>No reservations found</td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id || res._id} className='border-b hover:bg-gray-50'>
                    <td className='p-3'>{res.name}</td>
                    <td className='p-3'>{res.email}</td>
                    <td className='p-3'>{res.phone}</td>
                    <td className='p-3'>{res.date}</td>
                    <td className='p-3'>{res.time}</td>
                    <td className='p-3'>
                      {res.table?.tableNumber ?? '-'}
                      {res.status === 'waiting' && (
                        <span className='ml-2 text-sm text-yellow-700 font-semibold'>(Waiting)</span>
                      )}
                    </td>
                    <td className='p-3'>{res.guests}</td>
                    <td className='p-3'>
                      <button onClick={() => handleDelete(res.id || res._id)} className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'>Delete</button>
                    </td>
                  </tr>
                ))
              )
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminTable