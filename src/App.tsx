import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import Footer from './components/Footer'
import Explore from './pages/Explore'
import MyFiles from './pages/MyFiles'
import Drive from './pages/Drive'
import Earnings from './pages/Earnings'

function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
    </>
  )
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: '1 1 0%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/my-files" element={<MyFiles />} />
          <Route path="/drive" element={<Drive />} />
          <Route path="/earnings" element={<Earnings />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}