import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { MdDeleteForever } from 'react-icons/md'

const ListCustomer = () => {
  const [customers, setCustomers] = useState([])

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/customer/list`)
      if (res.data.success) {
        setCustomers(res.data.customers)
      } else {
        toast.error(res.data.message || "Failed to load customers")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch customers")
    }
  }

  // Delete a customer
  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return

    try {
      const res = await axios.delete(`${backendUrl}/api/customer/remove/${id}`)
      if (res.data.success) {
        toast.success("Customer removed successfully")
        setCustomers(customers.filter(c => (c.id || c._id) !== id))      
      } else {
        toast.error(res.data.message || "Failed to delete customer")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error deleting customer")
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Customer List</h2>

      {/* Table header */}
      <div className="grid grid-cols-[2fr_2fr_2fr_1fr] gap-4 font-semibold border-b pb-3 text-gray-700">
        <span>Name</span>
        <span>Email</span>
        <span>Phone</span>
        <span>Action</span>
      </div>

      {/* Customer rows or empty state */}
      {customers.length === 0 ? (
        <p className="mt-6 text-gray-500 text-sm">No customers found.</p>
      ) : (
        customers.map((customer) => (
          <div
            key={customer.id || customer._id}
            className="grid grid-cols-[2fr_2fr_2fr_1fr] items-center gap-4 py-3 border-b hover:bg-gray-50 transition"
          >
            <span>{customer.name}</span>
            <span>{customer.email}</span>
            <span>{customer.phone}</span>
            <MdDeleteForever
              className="text-red-600 text-2xl cursor-pointer hover:text-red-800 transition"
              onClick={() => deleteCustomer(customer.id || customer._id)}
            />
          </div>
        ))
      )}
    </div>
  )
}

export default ListCustomer
