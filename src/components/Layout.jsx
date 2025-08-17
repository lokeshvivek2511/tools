import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Code2, 
  Palette, 
  Image, 
  Zap, 
  Share2, 
  Home, 
  Github, 
  Twitter, 
  Coffee,
  FileText,
  GitBranch,
  Layers
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Markdown Converter', href: '/markdown', icon: Code2 },
  { name: 'Color Palette', href: '/colors', icon: Palette },
  { name: 'Image Tools', href: '/images', icon: Image },
  { name: 'API Tester', href: '/api', icon: Zap },
  { name: 'Text Sharing', href: '/share', icon: Share2 },
  { name: 'Text Summarizer', href: '/summarizer', icon: FileText },
  { name: 'Diagram Generator', href: '/diagram', icon: GitBranch },
  { name: 'Icon Generator', href: '/icons', icon: Layers },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile menu */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Code2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-900">DevTools</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-6 w-6 text-slate-600" />
                </button>
              </div>
              
              <nav className="px-6 py-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-3">
                    Built with ❤️ for developers
                  </p>
                  <div className="flex space-x-3">
                    <a
                      href="https://github.com"
                      className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5 text-slate-600" />
                    </a>
                    <a
                      href="https://twitter.com"
                      className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-5 w-5 text-slate-600" />
                    </a>
                    <a
                      href="https://buymeacoffee.com"
                      className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Coffee className="h-5 w-5 text-slate-600" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-80 lg:flex lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r border-slate-200">
          <div className="flex items-center h-16 px-6 border-b border-slate-200">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">DevTools Suite</span>
            </Link>
          </div>
          
          <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-6 border-t border-slate-200">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-3">
                Built with ❤️ for developers
              </p>
              <div className="flex space-x-3">
                <a
                  href="https://github.com"
                  className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5 text-slate-600" />
                </a>
                <a
                  href="https://twitter.com"
                  className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5 text-slate-600" />
                </a>
                <a
                  href="https://buymeacoffee.com"
                  className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Coffee className="h-5 w-5 text-slate-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-80">
        {/* Mobile header */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">DevTools</span>
            </Link>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}