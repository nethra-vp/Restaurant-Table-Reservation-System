import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const Orders = () => {
  // groupedOrders: array of { customerId, customerName, orders: [...] }
  const [groupedOrders, setGroupedOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ customerId: '', productId: '', quantity: 1 })

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/customer/list`)
      if (res.data && res.data.customers) setCustomers(res.data.customers)
    } catch (err) {
      console.error('fetchCustomers', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`)
      if (res.data && res.data.products) setProducts(res.data.products)
    } catch (err) {
      console.error('fetchProducts', err)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/orders/list`)
      if (res.data && res.data.customers) setGroupedOrders(res.data.customers)
      else if (res.data && res.data.orders) setGroupedOrders(res.data.orders) // fallback
    } catch (err) {
      console.error('fetchOrders', err)
    }
  }

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
    fetchOrders()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.customerId || !form.productId) return toast.error('Select customer and product')
    try {
      const res = await axios.post(`${backendUrl}/api/orders/create`, {
        customerId: Number(form.customerId),
        productId: Number(form.productId),
        quantity: Number(form.quantity || 1)
      })
      if (res.data && res.data.success) {
        toast.success('Order created')
        setForm({ customerId: '', productId: '', quantity: 1 })
        fetchOrders()
      }
    } catch (err) {
      console.error('create order', err)
      toast.error('Failed to create order')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return
    try {
      await axios.delete(`${backendUrl}/api/orders/delete/${id}`)
      toast.success('Order removed')
      fetchOrders()
    } catch (err) {
      console.error('delete order', err)
      toast.error('Failed to delete order')
    }
  }

  return (
    <div>
      <h2 className='text-3xl font-bold text-gray-700 text-center mb-6'>Orders</h2>

      <form onSubmit={handleCreate} className='flex gap-4 items-end mb-6'>
        <div>
          <label className='block mb-1 font-medium ml-5'>Customer</label>
          <select name='customerId' value={form.customerId} onChange={handleChange} className='border p-2 rounded ml-5'>
            <option value=''>Select customer</option>
            {customers.map(c => (
              <option key={c.id ?? c.customer_id} value={c.id ?? c.id}>{c.name ?? c.customer_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className='block mb-1 font-medium'>Product</label>
          <select name='productId' value={form.productId} onChange={handleChange} className='border p-2 rounded'>
            <option value=''>Select product</option>
            {products.map(p => (
              <option key={p.id ?? p.product_id} value={p.id ?? p.id}>{p.name ?? p.product_name} {p.price ? `- ${currency}${p.price}` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className='block mb-1 font-medium'>Quantity</label>
          <input type='number' min={1} name='quantity' value={form.quantity} onChange={handleChange} className='border p-2 rounded w-24' />
        </div>

        <div>
          <button className='bg-amber-500 text-white px-4 py-2 rounded' type='submit'>Create</button>
        </div>
      </form>

      <table className='w-full shadow-lg rounded-xl ml-10'>
        <thead>
          <tr className='bg-amber-500 text-left'>
            <th className='p-3'>Order ID</th>
            <th className='p-3'>Customer</th>
            <th className='p-3'>Product</th>
            <th className='p-3'>Quantity</th>
            <th className='p-3'>Unit Price</th>
            <th className='p-3'>Total</th>
            <th className='p-3'>Time</th>
            <th className='p-3'>Delete</th>
          </tr>
        </thead>
        <tbody>
              {groupedOrders.length === 0 ? (
                <tr><td colSpan={8} className='p-4 text-center'>No orders</td></tr>
              ) : (
                <td colSpan={8}>
                  {groupedOrders.map(customerGroup => (
                    <div key={customerGroup.customerId} className='mb-6'>
                      <h3 className='text-xl font-semibold mb-2'>{customerGroup.customerName || `Customer ${customerGroup.customerId}`}</h3>
                      <table className='w-full mb-2'>
                        <thead>
                          <tr className='bg-gray-100'>
                            <th className='p-2 text-left'>Order ID</th>
                            <th className='p-2 text-left'>Product</th>
                            <th className='p-2 text-left'>Quantity</th>
                            <th className='p-2 text-left'>Unit</th>
                            <th className='p-2 text-left'>Total</th>
                            <th className='p-2 text-left'>Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerGroup.orders.map(o => (
                            <tr key={o.orderId} className='border-b hover:bg-gray-50'>
                              <td className='p-2'>{o.orderId}</td>
                              <td className='p-2'>{o.productName ?? o.productId}</td>
                              <td className='p-2'>{o.quantity}</td>
                              <td className='p-2'>{currency}{o.unitPrice}</td>
                              <td className='p-2'>{currency}{o.totalPrice}</td>
                              <td className='p-2'><button onClick={() => handleDelete(o.orderId)} className='bg-red-500 text-white px-3 py-1 rounded'>Delete</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </td>
              )}
        </tbody>
      </table>
    </div>
  )
}

export default Orders
