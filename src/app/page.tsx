import React from 'react'
import { Navbar } from '../components/landing/Navbar'
import { Hero } from '../components/landing/Hero'
import { Features } from '../components/landing/Features'
import { Philosophy } from '../components/landing/Philosophy'
import { Protocol } from '../components/landing/Protocol'
import { Pricing } from '../components/landing/Pricing'
import { Footer } from '../components/landing/Footer'

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
