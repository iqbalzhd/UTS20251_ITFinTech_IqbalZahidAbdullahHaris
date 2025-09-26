'use client'
import React, { useState } from 'react'
import Navbar from './components/navBar'
import ProductCard from './components/productCard'

const Home = () => {

  return (
    <div>
      {/* kirim jumlah cart ke Navbar */}
      <Navbar />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 mt-8 mx-auto">
        <ProductCard
          title="Sepatu Keren"
          price={200000}
          image="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          description="Sepatu nyaman dipakai untuk sehari-hari."
          onAdd={() => console.log('Item ditambah')}
          onRemove={() => console.log('Item dikurangi')}
        />

      </div>
    </div>
  )
}

export default Home
