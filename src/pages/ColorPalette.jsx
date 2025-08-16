import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Copy, 
  Download, 
  Palette, 
  RefreshCw, 
  Eye,
  Pipette,
  Shuffle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ColorPalette() {
  const [colors, setColors] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [harmonies, setHarmonies] = useState([])
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  const generateRandomPalette = () => {
    const randomColors = []
    for (let i = 0; i < 5; i++) {
      const hue = Math.floor(Math.random() * 360)
      const saturation = Math.floor(Math.random() * 50) + 50
      const lightness = Math.floor(Math.random() * 40) + 30
      const color = hslToHex(hue, saturation, lightness)
      randomColors.push(color)
    }
    setColors(randomColors)
    generateHarmonies(randomColors[0])
    toast.success('Random palette generated!')
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setIsLoading(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      setImageUrl(e.target.result)
      extractColorsFromImage(e.target.result)
    }
    
    reader.readAsDataURL(file)
  }

  const extractColorsFromImage = (imageSrc) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const extractedColors = extractDominantColors(imageData)
      
      setColors(extractedColors)
      if (extractedColors.length > 0) {
        generateHarmonies(extractedColors[0])
      }
      setIsLoading(false)
      toast.success('Colors extracted successfully!')
    }
    
    img.onerror = () => {
      setIsLoading(false)
      toast.error('Error loading image')
    }
    
    img.src = imageSrc
  }

  const extractDominantColors = (imageData) => {
    const data = imageData.data
    const colorMap = new Map()
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const alpha = data[i + 3]
      
      if (alpha < 128) continue // Skip transparent pixels
      
      const hex = rgbToHex(r, g, b)
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
    }
    
    // Sort by frequency and return top 8 colors
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([color]) => color)
  }

  const generateHarmonies = (baseColor) => {
    if (!baseColor) return
    
    const hsl = hexToHsl(baseColor)
    const harmonies = {
      complementary: [baseColor, hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)],
      triadic: [
        baseColor,
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
      ],
      analogous: [
        hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
        baseColor,
        hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
      ],
      monochromatic: [
        hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 10)),
        hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 10, 10)),
        baseColor,
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 10, 90)),
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 90))
      ]
    }
    
    setHarmonies(harmonies)
  }

  const copyColor = async (color) => {
    try {
      await navigator.clipboard.writeText(color)
      toast.success(`${color} copied to clipboard!`)
    } catch (error) {
      toast.error('Failed to copy color')
    }
  }

  const exportPalette = (format = 'css') => {
    if (colors.length === 0) {
      toast.error('No colors to export')
      return
    }

    let content = ''
    
    switch (format) {
      case 'css':
        content = ':root {\n' + colors.map((color, index) => 
          `  --color-${index + 1}: ${color};`
        ).join('\n') + '\n}'
        break
      case 'scss':
        content = colors.map((color, index) => 
          `$color-${index + 1}: ${color};`
        ).join('\n')
        break
      case 'json':
        content = JSON.stringify({ colors }, null, 2)
        break
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `palette.${format}`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success(`Palette exported as ${format.toUpperCase()}!`)
  }

  // Utility functions
  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  const hslToHex = (h, s, l) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = n => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Color Palette Generator</h1>
          <p className="text-slate-600">
            Extract colors from images or generate harmonious color palettes for your projects.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="btn-primary"
              >
                <Upload className="h-4 w-4" />
                {isLoading ? 'Processing...' : 'Upload Image'}
              </button>
              <button
                onClick={generateRandomPalette}
                className="btn-secondary"
              >
                <Shuffle className="h-4 w-4" />
                Random Palette
              </button>
            </div>
            
            {colors.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportPalette('css')}
                  className="btn-secondary text-sm"
                >
                  <Download className="h-4 w-4" />
                  CSS
                </button>
                <button
                  onClick={() => exportPalette('scss')}
                  className="btn-secondary text-sm"
                >
                  <Download className="h-4 w-4" />
                  SCSS
                </button>
                <button
                  onClick={() => exportPalette('json')}
                  className="btn-secondary text-sm"
                >
                  <Download className="h-4 w-4" />
                  JSON
                </button>
              </div>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Image Preview */}
        {imageUrl && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Source Image
            </h3>
            <div className="max-w-md mx-auto">
              <img
                src={imageUrl}
                alt="Source"
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Extracted Colors */}
        {colors.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Extracted Colors
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {colors.map((color, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    setSelectedColor(color)
                    generateHarmonies(color)
                  }}
                >
                  <div
                    className="w-full h-20 rounded-lg shadow-sm group-hover:shadow-md transition-shadow border border-slate-200"
                    style={{ backgroundColor: color }}
                  />
                  <div className="mt-2 text-center">
                    <div className="text-xs font-mono text-slate-600 mb-1">{color}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyColor(color)
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 mx-auto"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Color Harmonies */}
        {Object.keys(harmonies).length > 0 && (
          <div className="space-y-6">
            {Object.entries(harmonies).map(([harmonyType, harmonyColors]) => (
              <div key={harmonyType} className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 capitalize flex items-center gap-2">
                  <Pipette className="h-5 w-5" />
                  {harmonyType} Harmony
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {harmonyColors.map((color, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div
                        className="w-full h-16 rounded-lg shadow-sm group-hover:shadow-md transition-shadow border border-slate-200"
                        style={{ backgroundColor: color }}
                      />
                      <div className="mt-2 text-center">
                        <div className="text-xs font-mono text-slate-600 mb-1">{color}</div>
                        <button
                          onClick={() => copyColor(color)}
                          className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 mx-auto"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {colors.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Colors Yet</h3>
            <p className="text-slate-600 mb-6">
              Upload an image to extract colors or generate a random palette to get started.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </button>
              <button
                onClick={generateRandomPalette}
                className="btn-secondary"
              >
                <Shuffle className="h-4 w-4" />
                Random Palette
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}