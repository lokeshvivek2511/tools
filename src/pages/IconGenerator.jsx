import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Layers, Upload, Download, Eye, Trash2, Image as ImageIcon, Square, Smartphone, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const ICON_SIZES = [
  { size: 16, name: '16×16', description: 'Browser favicon', category: 'web' },
  { size: 32, name: '32×32', description: 'Browser tab', category: 'web' },
  { size: 48, name: '48×48', description: 'Desktop icon', category: 'desktop' },
  { size: 64, name: '64×64', description: 'High DPI favicon', category: 'web' },
  { size: 72, name: '72×72', description: 'Android icon', category: 'mobile' },
  { size: 96, name: '96×96', description: 'Android icon', category: 'mobile' },
  { size: 128, name: '128×128', description: 'Chrome Web Store', category: 'web' },
  { size: 144, name: '144×144', description: 'Android icon', category: 'mobile' },
  { size: 152, name: '152×152', description: 'iOS icon', category: 'mobile' },
  { size: 167, name: '167×167', description: 'iOS icon', category: 'mobile' },
  { size: 180, name: '180×180', description: 'iOS icon', category: 'mobile' },
  { size: 192, name: '192×192', description: 'Android icon', category: 'mobile' },
  { size: 256, name: '256×256', description: 'Desktop icon', category: 'desktop' },
  { size: 512, name: '512×512', description: 'High resolution', category: 'desktop' }
]

const PRESETS = [
  {
    name: 'Web Favicon',
    description: 'Essential sizes for web browsers',
    sizes: [16, 32, 48, 64],
    icon: Monitor
  },
  {
    name: 'Mobile App',
    description: 'iOS and Android app icons',
    sizes: [72, 96, 144, 152, 167, 180, 192],
    icon: Smartphone
  },
  {
    name: 'Complete Set',
    description: 'All common icon sizes',
    sizes: [16, 32, 48, 64, 72, 96, 128, 144, 152, 167, 180, 192, 256, 512],
    icon: Square
  }
]

export default function IconGenerator() {
  const [sourceImage, setSourceImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [selectedSizes, setSelectedSizes] = useState([16, 32, 48, 64])
  const [generatedIcons, setGeneratedIcons] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activePreset, setActivePreset] = useState('Web Favicon')
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
      setSourceImage(e.target.result)
      toast.success('Image loaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  const selectPreset = (preset) => {
    setSelectedSizes(preset.sizes)
    setActivePreset(preset.name)
    toast.success(`Selected: ${preset.name}`)
  }

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size].sort((a, b) => a - b)
    )
  }

  const generateIcons = async () => {
    if (!sourceImage) {
      toast.error('Please upload an image first')
      return
    }

    if (selectedSizes.length === 0) {
      toast.error('Please select at least one icon size')
      return
    }

    setIsGenerating(true)
    setGeneratedIcons([])

    try {
      const img = new Image()
      img.onload = async () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const icons = []

        for (const size of selectedSizes) {
          // Set canvas size
          canvas.width = size
          canvas.height = size

          // Clear canvas with transparent background
          ctx.clearRect(0, 0, size, size)

          // Calculate dimensions to maintain aspect ratio
          const aspectRatio = img.width / img.height
          let drawWidth, drawHeight, drawX, drawY

          if (aspectRatio > 1) {
            // Wide image
            drawWidth = size
            drawHeight = size / aspectRatio
            drawX = 0
            drawY = (size - drawHeight) / 2
          } else {
            // Tall or square image
            drawHeight = size
            drawWidth = size * aspectRatio
            drawX = (size - drawWidth) / 2
            drawY = 0
          }

          // Enable smooth rendering
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Draw the image
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

          // Convert to blob
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
          const url = URL.createObjectURL(blob)

          icons.push({
            size,
            url,
            blob,
            name: `icon-${size}x${size}.png`
          })
        }

        setGeneratedIcons(icons)
        toast.success(`Generated ${icons.length} icons!`)
        setIsGenerating(false)
      }

      img.onerror = () => {
        toast.error('Error loading image')
        setIsGenerating(false)
      }

      img.src = sourceImage
    } catch (error) {
      console.error('Error generating icons:', error)
      toast.error('Failed to generate icons')
      setIsGenerating(false)
    }
  }

  const downloadSingleIcon = (icon) => {
    const link = document.createElement('a')
    link.href = icon.url
    link.download = icon.name
    link.click()
    toast.success(`Downloaded ${icon.name}`)
  }

  const downloadAllIcons = async () => {
    if (generatedIcons.length === 0) {
      toast.error('No icons to download')
      return
    }

    const zip = new JSZip()
    
    // Add PNG icons
    for (const icon of generatedIcons) {
      zip.file(icon.name, icon.blob)
    }

    // Generate ICO file for web favicons
    if (selectedSizes.includes(16) || selectedSizes.includes(32) || selectedSizes.includes(48)) {
      try {
        const icoSizes = selectedSizes.filter(size => [16, 32, 48].includes(size))
        if (icoSizes.length > 0) {
          // For simplicity, we'll just add the 32x32 version as favicon.ico
          const icon32 = generatedIcons.find(icon => icon.size === 32)
          if (icon32) {
            zip.file('favicon.ico', icon32.blob)
          }
        }
      } catch (error) {
        console.log('ICO generation not available, using PNG instead')
      }
    }

    // Generate manifest.json for web apps
    const webSizes = generatedIcons.filter(icon => 
      [72, 96, 144, 192, 512].includes(icon.size)
    )

    if (webSizes.length > 0) {
      const manifest = {
        name: "Your App Name",
        short_name: "App",
        icons: webSizes.map(icon => ({
          src: icon.name,
          sizes: `${icon.size}x${icon.size}`,
          type: "image/png"
        })),
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone"
      }
      
      zip.file('manifest.json', JSON.stringify(manifest, null, 2))
    }

    // Generate HTML snippet for favicons
    const htmlSnippet = `<!-- Favicon HTML -->
${generatedIcons.filter(icon => [16, 32, 48].includes(icon.size))
  .map(icon => `<link rel="icon" type="image/png" sizes="${icon.size}x${icon.size}" href="${icon.name}">`)
  .join('\n')}
${generatedIcons.find(icon => icon.size === 180) ? 
  `<link rel="apple-touch-icon" sizes="180x180" href="icon-180x180.png">` : ''}
${webSizes.length > 0 ? '<link rel="manifest" href="manifest.json">' : ''}`

    zip.file('favicon-html.txt', htmlSnippet)

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'icons.zip')
    toast.success('All icons downloaded!')
  }

  const clearAll = () => {
    setSourceImage(null)
    setImagePreview('')
    setGeneratedIcons([])
    toast.success('Cleared all icons')
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'web': return Monitor
      case 'mobile': return Smartphone
      case 'desktop': return Square
      default: return ImageIcon
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'web': return 'text-blue-600'
      case 'mobile': return 'text-green-600'
      case 'desktop': return 'text-purple-600'
      default: return 'text-slate-600'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Layers className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Icon & Favicon Generator</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Generate icons and favicons in multiple sizes from your images. Perfect for web apps, mobile apps, and desktop applications.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Image Upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-amber-600" />
              Upload Image
            </h3>
            
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-all"
              >
                <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">Click to upload an image</p>
                <p className="text-sm text-slate-500">PNG, JPG, SVG up to 10MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview"
                    className="w-full h-48 object-contain bg-slate-50 rounded-lg border"
                  />
                  <button
                    onClick={clearAll}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Change Image
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Presets */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Presets</h3>
            <div className="grid gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => selectPreset(preset)}
                  className={`flex items-center p-4 border rounded-lg transition-all text-left ${
                    activePreset === preset.name
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <preset.icon className="h-6 w-6 text-amber-600 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{preset.name}</div>
                    <div className="text-sm text-slate-600">{preset.description}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {preset.sizes.length} sizes: {preset.sizes.slice(0, 4).join('px, ')}px{preset.sizes.length > 4 ? '...' : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Custom Sizes</h3>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {ICON_SIZES.map((iconSize) => {
                const CategoryIcon = getCategoryIcon(iconSize.category)
                const isSelected = selectedSizes.includes(iconSize.size)
                
                return (
                  <label
                    key={iconSize.size}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSize(iconSize.size)}
                      className="sr-only"
                    />
                    <CategoryIcon className={`h-4 w-4 mr-2 ${getCategoryColor(iconSize.category)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900">{iconSize.name}</div>
                      <div className="text-xs text-slate-600 truncate">{iconSize.description}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateIcons}
            disabled={isGenerating || !sourceImage || selectedSizes.length === 0}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Icons...
              </>
            ) : (
              <>
                <Layers className="h-5 w-5 mr-2" />
                Generate {selectedSizes.length} Icon{selectedSizes.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </motion.div>

        {/* Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Generated Icons</h3>
              {generatedIcons.length > 0 && (
                <button
                  onClick={downloadAllIcons}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </button>
              )}
            </div>

            <div className="min-h-96 border border-slate-200 rounded-lg">
              {generatedIcons.length > 0 ? (
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {generatedIcons.map((icon) => (
                      <div key={icon.size} className="text-center">
                        <div className="bg-slate-50 p-4 rounded-lg mb-2 flex items-center justify-center min-h-20">
                          <img 
                            src={icon.url} 
                            alt={`${icon.size}x${icon.size}`}
                            className="max-w-full max-h-full"
                            style={{ 
                              width: Math.min(icon.size, 48), 
                              height: Math.min(icon.size, 48) 
                            }}
                          />
                        </div>
                        <div className="text-sm font-medium text-slate-900 mb-1">
                          {icon.size}×{icon.size}
                        </div>
                        <button
                          onClick={() => downloadSingleIcon(icon)}
                          className="text-xs text-amber-600 hover:text-amber-700 flex items-center justify-center mx-auto"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-slate-500">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Generated icons will appear here</p>
                    <p className="text-sm mt-2">Upload an image and select sizes to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Features</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Generate multiple icon sizes simultaneously</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Automatic aspect ratio preservation</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">High-quality image scaling with anti-aliasing</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Includes web manifest and HTML snippets</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Batch download as ZIP with organized files</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}