import React from 'react'
import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { Features } from '../components/Features'
import { Philosophy } from '../components/Philosophy'
import { Protocol } from '../components/Protocol'
import { Pricing } from '../components/Pricing'
import { Footer } from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen font-sans selection:bg-ember selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Philosophy />
        <Protocol />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
