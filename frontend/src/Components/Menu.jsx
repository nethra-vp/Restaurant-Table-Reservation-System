import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App' // make sure this is defined in your frontend App.jsx

const Menu = () => {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/product/list`)
        if (res.data.success) {
          setProducts(res.data.products)
        } else {
          console.error(res.data.message)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const categoryList = ['All', 'Beverage', 'Breakfast', 'Dosa', 'Momos', 'Rice']

  if (loading) return <p className="text-center p-4">Loading menu...</p>

  // Filter first
  const filteredProducts = products.filter(
    (product) => category === 'All' || product.category === category
  )

  // Determine what to display (slice if needed)
  const displayedProducts =
    category === 'All' && !showAll ? filteredProducts.slice(0, 6) : filteredProducts

  return (
    <div className="px-4 py-12 max-w-6xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Discover Our Menu</h1>
      </div>

      {/* Category selection */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-medium mb-4 text-gray-700">
          Explore Our Categories
        </h2>
        <ul className="flex flex-wrap justify-center gap-4">
          {categoryList.map((cat, index) => (
            <li
              key={index}
              onClick={() => {
                setCategory(cat)
                setShowAll(false) // reset collapse when switching categories
              }}
              className={`cursor-pointer px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                category === cat ? 'bg-amber-500 text-white' : 'bg-gray-200 hover:bg-amber-100'
              }`}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-6 p-4 border border-gray-100 rounded-xl shadow-sm transition hover:shadow-md"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-28 h-28 object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/assets/upload_img.png'
                }}
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <span className="text-lg font-semibold text-amber-600">₹{product.price}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {product.description || 'Tasty and fresh!'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm col-span-2 text-gray-500">No products available</p>
        )}
      </div>

      {/* Show More / Show Less Button */}
      {category === 'All' && filteredProducts.length > 6 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll((s) => !s)}
            className="bg-amber-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-amber-600 transition"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Menu
