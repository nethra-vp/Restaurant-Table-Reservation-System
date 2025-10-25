import React, { useState } from 'react'
import upload_img from '../assets/upload_img.png'
import axios from 'axios'
import { backendUrl } from '../App'
import {toast} from 'react-toastify'

const AddMenu = ({token}) => {
  const [image, setImage] = useState(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [category, setCategory] = useState("All")

  const OnSubmitHandler = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", Number(price))
      formData.append("category", category)

      if(image) formData.append("image", image)

        const response = await axios.post(`${backendUrl}/api/product/add`, formData, {headers: {Authorization: `Bearer ${token}`}})
        if (response.data.success) {
          toast.success(response.data.message)
          setName("")
          setDescription("")
          setPrice(0)
          setImage(null)
          setCategory("All")
        } else {
          toast.error(response.data.message)
        }
    } catch (error) {
      console.log(error);
      toast.error(error.message)      
    }
  }

  return (
    <div className='flex justify-center items-start w-full min-h-screen py-10'>
      <form onSubmit={OnSubmitHandler} className='bg-white shadow-md rounded-lg p-8 flex flex-col items-start gap-6 w-full max-w-2xl'>
        <div>
          <p className='mb-2 text-lg font-medium text-gray-700'>Upload Image</p>
          <div>
            <label htmlFor="image" className='cursor-pointer'>
              <img src={!image ? upload_img : URL.createObjectURL(image)} alt="" className='w-22 h-22 object-cover rounded-md border-2 border-dashed border-black p-2 transition-all duration-200'/>
              <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden aria-label = "Upload product image" />
            </label>
          </div>
        </div>  

        <div className='w-full'>
          <p className='mb-2 text-lg font-medium text-gray-700'>Product Name</p>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder='Enter product name' className='w-full max-w-[500px] p-4 border border-gray-300 rounded' required/>
        </div>

        <div className='w-full'>
          <p className='mb-2 text-lg font-medium text-gray-700'>Product Description</p>
          <input value={description} onChange={(e) => setDescription(e.target.value)} type="text" placeholder='Enter product description' className='w-full max-w-[500px] p-4 border border-gray-300 rounded' required />
        </div>

        <div className='flex flex-wrap gap-4 w-full'>
          <div className='min-w-[200px]'>
            <p className='mb-2 text-lg font-medium text-gray-700'>Product Category</p>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className='w-full max-w-[500px] p-3 border border-gray-300 text-[16px] rounded'>
              <option value="All">All</option>
              <option value="Beverage">Beverage</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Dosa">Dosa</option>
              <option value="Momos">Momos</option>
              <option value="Rice">Rice</option>
            </select>
          </div>

          <div>
            <p className='mb-2 text-lg font-medium text-gray-700'>Product Price</p>
            <input value={price} min="1" onChange={(e) => setPrice(e.target.value)} type="number" placeholder='40' className='w-full max-w-[120px] p-4 border border-gray-300 rounded'/>
          </div>
        </div>

        <button type='submit' className='mt-6 w-full max-w-[500px] py-3 bg-amber-500 text-white font-semibold rounded-md hover:bg-amber-600 transition duration-200'>Add Menu</button>
      </form>
    </div>
  )
}

export default AddMenu