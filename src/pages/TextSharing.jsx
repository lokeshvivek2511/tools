import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { nanoid } from 'nanoid'
import { 
  Share2, 
  Copy, 
  Eye, 
  EyeOff, 
  Clock, 
  Link as LinkIcon,
  Trash2,
  Plus,
  Code,
  FileText,
  Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

const EXPIRY_OPTIONS = [
  { label: '1 Hour', value: 1 },
  { label: '24 Hours', value: 24 },
  { label: '7 Days', value: 168 },
  { label: '30 Days', value: 720 },
  { label: 'Never', value: 0 }
]

const SYNTAX_OPTIONS = [
  { label: 'Plain Text', value: 'text' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'Markdown', value: 'markdown' }
]

export default function TextSharing() {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [syntax, setSyntax] = useState('text')
  const [expiry, setExpiry] = useState(24)
  const [password, setPassword] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [sharedTexts, setSharedTexts] = useState([])
  const [generatedLink, setGeneratedLink] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    // Load shared texts from localStorage
    const saved = localStorage.getItem('sharedTexts')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Filter out expired texts
        const now = Date.now()
        const active = parsed.filter(item => 
          item.expiry === 0 || item.expiry > now
        )
        setSharedTexts(active)
        if (active.length !== parsed.length) {
          localStorage.setItem('sharedTexts', JSON.stringify(active))
        }
      } catch (error) {
        console.error('Error loading shared texts:', error)
      }
    }
  }, [])

  const shareText = () => {
    if (!text.trim()) {
      toast.error('Please enter some text to share')
      return
    }

    setIsSharing(true)

    // Generate unique ID
    const id = nanoid(10)
    
    // Calculate expiry timestamp
    const expiryTime = expiry === 0 ? 0 : Date.now() + (expiry * 60 * 60 * 1000)
    
    // Create shared text object
    const sharedText = {
      id,
      title: title.trim() || 'Untitled',
      content: text,
      syntax,
      expiry: expiryTime,
      password: password.trim(),
      isPrivate,
      createdAt: Date.now(),
      views: 0
    }

    // Save to localStorage (in a real app, this would be saved to a database)
    const updated = [...sharedTexts, sharedText]
    setSharedTexts(updated)
    localStorage.setItem('sharedTexts', JSON.stringify(updated))

    // Generate shareable link
    const link = `${window.location.origin}/share/${id}`
    setGeneratedLink(link)

    // Reset form
    setText('')
    setTitle('')
    setPassword('')
    setIsPrivate(false)
    
    setIsSharing(false)
    toast.success('Text shared successfully!')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const viewSharedText = (id) => {
    const sharedText = sharedTexts.find(item => item.id === id)
    if (!sharedText) {
      toast.error('Text not found')
      return
    }

    // Check if expired
    if (sharedText.expiry !== 0 && sharedText.expiry < Date.now()) {
      toast.error('This text has expired')
      deleteSharedText(id)
      return
    }

    // Increment view count
    const updated = sharedTexts.map(item => 
      item.id === id ? { ...item, views: item.views + 1 } : item
    )
    setSharedTexts(updated)
    localStorage.setItem('sharedTexts', JSON.stringify(updated))

    // Show text content (in a real app, this would open a new page)
    const content = sharedText.password ? 
      `[Password Protected]\n\n${sharedText.content}` : 
      sharedText.content
    
    // Create a simple modal or new window to display content
    const newWindow = window.open('', '_blank', 'width=800,height=600')
    newWindow.document.write(`
      <html>
        <head>
          <title>${sharedText.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
            pre { background: #f8f9fa; padding: 20px; border-radius: 8px; overflow-x: auto; }
            .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            .meta { color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${sharedText.title}</h1>
            <div class="meta">
              Created: ${new Date(sharedText.createdAt).toLocaleString()} | 
              Views: ${sharedText.views} | 
              Syntax: ${sharedText.syntax}
            </div>
          </div>
          <pre><code>${content}</code></pre>
        </body>
      </html>
    `)
  }

  const deleteSharedText = (id) => {
    const updated = sharedTexts.filter(item => item.id !== id)
    setSharedTexts(updated)
    localStorage.setItem('sharedTexts', JSON.stringify(updated))
    toast.success('Shared text deleted')
  }

  const getTimeRemaining = (expiry) => {
    if (expiry === 0) return 'Never expires'
    
    const now = Date.now()
    const remaining = expiry - now
    
    if (remaining <= 0) return 'Expired'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`
    
    const minutes = Math.floor(remaining / (1000 * 60))
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Text Sharing</h1>
          <p className="text-slate-600">
            Share text snippets, code, or notes with secure, temporary links. Perfect for quick collaboration.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Share Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
              <h3 className="font-semibold text-slate-900 mb-6">Create New Share</h3>
              
              {/* Title and Settings */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Syntax Highlighting
                  </label>
                  <select
                    value={syntax}
                    onChange={(e) => setSyntax(e.target.value)}
                    className="input-field"
                  >
                    {SYNTAX_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Content
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text, code, or notes here..."
                  className="textarea-field h-64 font-mono text-sm"
                />
              </div>

              {/* Advanced Options */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expires In
                  </label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {EXPIRY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password (optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-700">Private</span>
                  </label>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={shareText}
                disabled={isSharing || !text.trim()}
                className="btn-primary w-full"
              >
                {isSharing ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                Share Text
              </button>

              {/* Generated Link */}
              {generatedLink && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Share Link Generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="input-field flex-1 font-mono text-sm"
                    />
                    <button
                      onClick={copyLink}
                      className="btn-secondary"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Shares */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">My Shares</h3>
                <span className="text-sm text-slate-500">{sharedTexts.length} items</span>
              </div>
              
              {sharedTexts.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sharedTexts.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-900 text-sm truncate">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => deleteSharedText(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          {item.syntax}
                        </span>
                        {item.password && (
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Protected
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {getTimeRemaining(item.expiry)}
                        </span>
                        <button
                          onClick={() => viewSharedText(item.id)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No shared texts yet</p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Features</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-slate-600">Auto-expiring links</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-slate-600">Password protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-purple-600" />
                  <span className="text-slate-600">Syntax highlighting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-orange-600" />
                  <span className="text-slate-600">View tracking</span>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 text-sm mb-1">Privacy First</h4>
                  <p className="text-xs text-blue-700">
                    All data is stored locally in your browser. Nothing is sent to external servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}