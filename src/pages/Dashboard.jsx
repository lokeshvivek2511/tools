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
  Shield,
  FileText,
  GitBranch,
  Layers
} from 'lucide-react'

const tools = [
  {
    name: 'Text Sharing',
    description: 'Share text snippets quickly with secure, temporary links',
    href: '/share',
    icon: Share2,
    color: 'from-indigo-500 to-purple-500',
    features: ['Secure Links', 'Expiration Control', 'Syntax Support']
  },
  {
    name: 'Text Summarizer',
    description: 'AI-powered text summarization using Google Gemini for quick insights',
    href: '/summarizer',
    icon: FileText,
    color: 'from-teal-500 to-blue-500',
    features: ['AI-Powered', 'Multiple Formats', 'Quick Analysis']
  },
  {
    name: 'Diagram Generator',
    description: 'Convert text descriptions to beautiful flowcharts and diagrams',
    href: '/diagram',
    icon: GitBranch,
    color: 'from-pink-500 to-rose-500',
    features: ['AI-Powered','Text to Diagram', 'Mermaid Support', 'Export Options']
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
    name: 'Icon & Favicon Generator',
    description: 'Generate icons and favicons in multiple sizes from images',
    href: '/icons',
    icon: Layers,
    color: 'from-amber-500 to-orange-500',
    features: ['Multi-Size Export', 'ICO Format', 'Batch Generation']
  }
]

const stats = [
  { name: 'Tools Available', value: '8', icon: Sparkles },
  { name: 'Active Users', value: '2.1K+', icon: Users },
  { name: 'Uptime', value: '99.9%', icon: Clock },
  { name: 'Privacy First', value: '100%', icon: Shield },
]

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Developer Tools
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Suite
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            A collection of essential tools for developers, designers, and tech enthusiasts. 
            Fast, secure, and completely free to use.
          </p>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-2">
              <stat.icon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-600">{stat.name}</div>
          </motion.div>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Link to={tool.href} className="block h-full">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {tool.name}
                </h3>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {tool.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">Try it now</span>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Built with modern web technologies
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Designed for developers who value privacy, speed, and simplicity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Privacy First
            </h3>
            <p className="text-slate-600">
              All processing happens in your browser. No data is sent to our servers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Lightning Fast
            </h3>
            <p className="text-slate-600">
              Optimized for performance with modern web technologies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Open Source
            </h3>
            <p className="text-slate-600">
              Transparent, community-driven, and always free to use.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}