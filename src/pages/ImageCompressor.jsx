import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Sliders, 
  FileImage,
  Trash2,
  Eye,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageCompressor() {
  const [images, setImages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          name: file.name,
          originalSize: file.size,
          originalUrl: e.target.result,
          compressedUrl: null,
          compressedSize: null,
          quality: 80,
          format: 'jpeg'
        }
        
        setImages(prev => [...prev, newImage])
        compressImage(newImage)
      }
      reader.readAsDataURL(file)
    })
  }

  const compressImage = async (imageData) => {
    setIsProcessing(true)
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080 for web optimization)
        let { width, height } = img
        const maxWidth = 1920
        const maxHeight = 1080
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        const quality = imageData.quality / 100
        const compressedDataUrl = canvas.toDataURL(`image/${imageData.format}`, quality)
        
        // Calculate compressed size (approximate)
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4)
        
        setImages(prev => prev.map(img => 
          img.id === imageData.id 
            ? { ...img, compressedUrl: compressedDataUrl, compressedSize }
            : img
        ))
        
        setIsProcessing(false)
        toast.success(`${imageData.name} compressed successfully!`)
      }
      
      img.src = imageData.originalUrl
    } catch (error) {
      setIsProcessing(false)
      toast.error('Error compressing image')
    }
  }

  const updateImageSettings = (id, settings) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...settings } : img
    ))
    
    const image = images.find(img => img.id === id)
    if (image) {
      compressImage({ ...image, ...settings })
    }
  }

  const downloadImage = (image) => {
    if (!image.compressedUrl) {
      toast.error('Image not ready for download')
      return
    }
    
    const link = document.createElement('a')
    link.download = `compressed_${image.name.replace(/\.[^/.]+$/, '')}.${image.format}`
    link.href = image.compressedUrl
    link.click()
    
    toast.success('Image downloaded!')
  }

  const downloadAll = () => {
    const readyImages = images.filter(img => img.compressedUrl)
    
    if (readyImages.length === 0) {
      toast.error('No images ready for download')
      return
    }
    
    readyImages.forEach(image => {
      setTimeout(() => downloadImage(image), 100)
    })
    
    toast.success(`Downloading ${readyImages.length} images!`)
  }

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
    toast.success('Image removed')
  }

  const clearAll = () => {
    setImages([])
    toast.success('All images cleared')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCompressionRatio = (original, compressed) => {
    if (!compressed) return 0
    return Math.round(((original - compressed) / original) * 100)
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Image Compressor</h1>
          <p className="text-slate-600">
            Compress and optimize your images while maintaining quality. Supports JPEG, PNG, and WebP formats.
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
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="btn-primary"
              >
                <Upload className="h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Upload Images'}
              </button>
              <div className="text-sm text-slate-500">
                Supports JPEG, PNG, WebP • Multiple files allowed
              </div>
            </div>
            
            {images.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadAll}
                  className="btn-primary text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download All
                </button>
                <button
                  onClick={clearAll}
                  className="btn-secondary text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="space-y-6">
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-slate-200 p-6"
              >
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Original Image */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      Original
                    </h4>
                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3">
                      <img
                        src={image.originalUrl}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-sm text-slate-600">
                      <div className="flex justify-between mb-1">
                        <span>Size:</span>
                        <span className="font-mono">{formatFileSize(image.originalSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-mono text-xs truncate ml-2">{image.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Sliders className="h-4 w-4" />
                      Settings
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Quality: {image.quality}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={image.quality}
                          onChange={(e) => updateImageSettings(image.id, { quality: parseInt(e.target.value) })}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Format
                        </label>
                        <select
                          value={image.format}
                          onChange={(e) => updateImageSettings(image.id, { format: e.target.value })}
                          className="input-field"
                        >
                          <option value="jpeg">JPEG</option>
                          <option value="png">PNG</option>
                          <option value="webp">WebP</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={() => removeImage(image.id)}
                        className="w-full btn-secondary text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Compressed Image */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Compressed
                    </h4>
                    
                    {image.compressedUrl ? (
                      <>
                        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3">
                          <img
                            src={image.compressedUrl}
                            alt="Compressed"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="text-sm text-slate-600 mb-4">
                          <div className="flex justify-between mb-1">
                            <span>Size:</span>
                            <span className="font-mono">{formatFileSize(image.compressedSize)}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Saved:</span>
                            <span className="font-mono text-green-600">
                              {getCompressionRatio(image.originalSize, image.compressedSize)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Format:</span>
                            <span className="font-mono uppercase">{image.format}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => downloadImage(image)}
                          className="w-full btn-primary"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </>
                    ) : (
                      <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <div className="text-sm text-slate-500">Compressing...</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Images Uploaded</h3>
            <p className="text-slate-600 mb-6">
              Upload your images to compress and optimize them for web use.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              <Upload className="h-4 w-4" />
              Upload Images
            </button>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sliders className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Quality Control</h3>
            </div>
            <p className="text-sm text-slate-600">
              Adjust compression quality to balance file size and image quality
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileImage className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Multiple Formats</h3>
            </div>
            <p className="text-sm text-slate-600">
              Convert between JPEG, PNG, and WebP formats
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Info className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Privacy First</h3>
            </div>
            <p className="text-sm text-slate-600">
              All processing happens in your browser - no uploads to servers
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}