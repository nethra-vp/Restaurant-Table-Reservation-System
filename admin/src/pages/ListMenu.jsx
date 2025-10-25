import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import {toast} from 'react-toastify'
import { MdDeleteForever } from 'react-icons/md'

const ListMenu = ({token}) => {
  const [list, setList] = useState([])

  const handleDelete = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove', 
        { _id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setList(list.filter(item => item._id !== id));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }


  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list', {headers: { Authorization: `Bearer ${token}` }})
      if(response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList( )
  }, [])

  return (
    <div>
      <p className='ml-2 mb-2 font-bold text-2xl'>Menu List</p>
      <div className='flex flex-col gap-2'>
        <div className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center p-2 border-b-2 border-gray-300 text-lg font-semibold'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>

        {list.map((item, index) => 
        <div key={index} className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center p-2 border-b-2 border-gray-300 text-lg'>
          <img src={item.image} alt=""  className='w-[50px] h-auto'/>
          <p>{item.name}</p>
          <p>{item.category}</p>
          <p>{item.price}</p>
          <MdDeleteForever className='ml-10 text-[28px] cursor-pointer text-red-700' onClick={() => handleDelete(item._id)}/>
        </div>)}

      </div>
    </div>
  )
}

export default ListMenu