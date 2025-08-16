import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MarkdownConverter from './pages/MarkdownConverter'
import ColorPalette from './pages/ColorPalette'
import ImageCompressor from './pages/ImageCompressor'
import ApiTester from './pages/ApiTester'
import TextSharing from './pages/TextSharing'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/markdown" element={<MarkdownConverter />} />
        <Route path="/colors" element={<ColorPalette />} />
        <Route path="/images" element={<ImageCompressor />} />
        <Route path="/api" element={<ApiTester />} />
        <Route path="/share" element={<TextSharing />} />
      </Routes>
    </Layout>
  )
}

export default App