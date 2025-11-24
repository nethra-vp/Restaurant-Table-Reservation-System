import React, { useState } from "react"
import axios from "axios"
import { backendUrl } from "../App"
import { toast } from "react-toastify"

const AddCustomer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "1",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // utility to generate reservation time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 11; hour < 21; hour++) {
      const startHour = hour % 12 === 0 ? 12 : hour % 12
      const startPeriod = hour < 12 ? "AM" : "PM"

      const value = `${String(hour).padStart(2,'0')}:00:00`
      const label = `${startHour}:00 ${startPeriod}`
      slots.push({ value, label })
    }
    return slots
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      toast.error("Please fill out all fields for reservation")
      return
    }

    try {
      // Call reservations endpoint which also creates/updates customer in backend
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        guests: Number(formData.guests),
      }

      const res = await axios.post(`${backendUrl}/api/reservations/create`, payload)
      const reservation = res.data?.reservation || res.data
      if (!reservation?.table) {
        toast.info('No table available for the selected slot — the reservation is on the waiting list')
      } else if (reservation.table.tableNumber) {
        toast.success(`Reservation confirmed — Table ${reservation.table.tableNumber}`)
      } else {
        toast.success('Reservation created successfully!')
      }
      // reset form
      setFormData({ name: "", email: "", phone: "", date: "", time: "", guests: "1" })
    } catch (error) {
      console.error(error)
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Error creating reservation")
      }
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Reservation</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white shadow-md rounded-xl p-6 border border-gray-200"
      >
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Customer Name
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
            Customer Email
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
            Customer Phone
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

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Reservation Date
          </label>
              <input type="date" name='date' value={formData.date} onChange={handleChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} min={new Date().toISOString().split("T")[0]} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-amber-400 focus:outline-none text-gray-500 font-normal"/>
        </div>

        <div className='block text-gray-700 font-medium mb-1'>
              <label htmlFor="">Time of Reservation </label>
              <select name='time' value={formData.time} onChange={handleChange} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-amber-400 focus:outline-none text-gray-500 font-normal">
                <option value="">Select Time</option>
                {generateTimeSlots().map((slot, index) => (
                  <option key={index} value={slot.value}>{slot.label}</option>
                ))}
              </select>
            </div>
            <div className='block text-gray-700 font-medium mb-1'>
              <label htmlFor="">Number of Guest: </label>
              <select name='guests' value={formData.guests} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-amber-400 focus:outline-none text-gray-500 font-normal">
                {[...Array(10).keys().map((i) => (
                  <option key={i + 1} value={i + 1} > {i + 1} Guest(s)</option>
                ))]}
              </select>
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
