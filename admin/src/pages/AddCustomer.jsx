import React, { useState } from "react"
import axios from "axios"
import { backendUrl } from "../App"
import { toast } from "react-toastify"

const AddCustomer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill out all fields")
      return
    }

    try {
      const res = await axios.post(`${backendUrl}/api/customer/add`, formData)
      if (res.data.success) {
        toast.success("Customer added successfully!")
        setFormData({ name: "", email: "", phone: "" })
      } else {
        toast.error(res.data.message || "Failed to add customer")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error adding customer")
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Add New Customer</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white shadow-md rounded-xl p-6 border border-gray-200"
      >
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-amber-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-amber-600 transition"
        >
          Add Customer
        </button>
      </form>
    </div>
  )
}

export default AddCustomer
