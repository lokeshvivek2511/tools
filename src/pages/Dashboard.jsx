import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Code2, 
  Palette, 
  Image, 
  Zap, 
  Share2,
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  Shield
} from 'lucide-react'

const tools = [
  {
    name: 'Markdown Converter',
    description: 'Convert Markdown to HTML/PDF with live preview and syntax highlighting',
    href: '/markdown',
    icon: Code2,
    color: 'from-blue-500 to-cyan-500',
    features: ['Live Preview', 'PDF Export', 'Syntax Highlighting']
  },
  {
    name: 'Color Palette Generator',
    description: 'Extract color palettes from images and generate harmonious color schemes',
    href: '/colors',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    features: ['Image Analysis', 'Color Harmony', 'Export Formats']
  },
  {
    name: 'Image Compressor',
    description: 'Compress and convert images while maintaining quality',
    href: '/images',
    icon: Image,
    color: 'from-green-500 to-emerald-500',
    features: ['Lossless Compression', 'Format Conversion', 'Batch Processing']
  },
  {
    name: 'API Tester',
    description: 'Test REST APIs with a clean interface similar to Postman',
    href: '/api',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    features: ['HTTP Methods', 'Headers & Auth', 'Response Analysis']
  },
  {
    name: 'Text Sharing',
    description: 'Share text snippets quickly with secure, temporary links',
    href: '/share',
    icon: Share2,
    color: 'from-indigo-500 to-purple-500',
    features: ['Secure Links', 'Expiration Control', 'Syntax Support']
  }
]

const stats = [
  { name: 'Tools Available', value: '5', icon: Sparkles },
  { name: 'Active Users', value: '1.2K+', icon: Users },
  { name: 'Uptime', value: '99.9%', icon: Clock },
  { name: 'Privacy First', value: '100%', icon: Shield },
]

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          All tools run locally in your browser
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
          Developer Utility
          <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"> Toolbox</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          A collection of essential tools for developers, designers, and tech enthusiasts. 
          Fast, secure, and completely free to use.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-xl p-6 border border-slate-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.name}</div>
            </div>
          )
        })}
      </motion.div>

      {/* Tools Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12"
      >
        {tools.map((tool, index) => {
          const Icon = tool.icon
          return (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link to={tool.href} className="block">
                <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 h-full">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${tool.color} mb-6`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {tool.name}
                  </h3>
                  
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {tool.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {tool.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all">
                    Try it now
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-8 lg:p-12 border border-primary-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose DevTools Hub?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Built with modern web technologies and designed for developers who value privacy, speed, and simplicity.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Privacy First</h3>
            <p className="text-sm text-slate-600">All processing happens in your browser. No data is sent to our servers.</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Lightning Fast</h3>
            <p className="text-sm text-slate-600">Optimized for performance with modern web technologies.</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Code2 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Open Source</h3>
            <p className="text-sm text-slate-600">Transparent, community-driven, and always free to use.</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}