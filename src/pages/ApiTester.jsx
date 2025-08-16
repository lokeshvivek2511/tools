import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { 
  Send, 
  Copy, 
  Save, 
  Trash2, 
  Plus, 
  Minus,
  Clock,
  CheckCircle,
  XCircle,
  Code,
  Eye,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

const SAMPLE_REQUESTS = [
  {
    name: 'JSONPlaceholder - Get Posts',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    body: ''
  },
  {
    name: 'JSONPlaceholder - Create Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    body: JSON.stringify({
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    }, null, 2)
  }
]

export default function ApiTester() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('response')
  const [savedRequests, setSavedRequests] = useState([])
  const [requestName, setRequestName] = useState('')
  const responseRef = useRef(null)

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const loadSampleRequest = (sample) => {
    setMethod(sample.method)
    setUrl(sample.url)
    setHeaders(sample.headers)
    setBody(sample.body)
    setRequestName(sample.name)
    toast.success(`Loaded: ${sample.name}`)
  }

  const saveRequest = () => {
    if (!requestName.trim()) {
      toast.error('Please enter a request name')
      return
    }

    const request = {
      id: Date.now(),
      name: requestName,
      method,
      url,
      headers: headers.filter(h => h.key && h.value),
      body
    }

    setSavedRequests([...savedRequests, request])
    toast.success('Request saved!')
  }

  const loadSavedRequest = (request) => {
    setMethod(request.method)
    setUrl(request.url)
    setHeaders([...request.headers, { key: '', value: '' }])
    setBody(request.body)
    setRequestName(request.name)
    toast.success(`Loaded: ${request.name}`)
  }

  const deleteSavedRequest = (id) => {
    setSavedRequests(savedRequests.filter(req => req.id !== id))
    toast.success('Request deleted')
  }

  const sendRequest = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setIsLoading(true)
    const startTime = Date.now()

    try {
      // Prepare headers
      const requestHeaders = {}
      headers.forEach(header => {
        if (header.key && header.value) {
          requestHeaders[header.key] = header.value
        }
      })

      // Prepare request config
      const config = {
        method: method.toLowerCase(),
        url,
        headers: requestHeaders,
        timeout: 30000
      }

      // Add body for methods that support it
      if (['post', 'put', 'patch'].includes(method.toLowerCase()) && body.trim()) {
        try {
          config.data = JSON.parse(body)
        } catch {
          config.data = body
        }
      }

      const response = await axios(config)
      const endTime = Date.now()

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        time: endTime - startTime,
        size: JSON.stringify(response.data).length
      })

      toast.success(`Request completed in ${endTime - startTime}ms`)
    } catch (error) {
      const endTime = Date.now()
      
      setResponse({
        status: error.response?.status || 0,
        statusText: error.response?.statusText || error.message,
        headers: error.response?.headers || {},
        data: error.response?.data || { error: error.message },
        time: endTime - startTime,
        size: 0,
        isError: true
      })

      toast.error('Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const copyResponse = async () => {
    if (!response) return
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
      toast.success('Response copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy response')
    }
  }

  const downloadResponse = () => {
    if (!response) return
    
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'api-response.json'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Response downloaded!')
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50'
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-50'
    if (status >= 400) return 'text-red-600 bg-red-50'
    return 'text-slate-600 bg-slate-50'
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">API Tester</h1>
          <p className="text-slate-600">
            Test REST APIs with a clean interface. Send requests, inspect responses, and save your favorite endpoints.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Request Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Builder */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">Request Builder</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Request name..."
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    className="input-field text-sm w-40"
                  />
                  <button
                    onClick={saveRequest}
                    className="btn-secondary text-sm"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>

              {/* Method and URL */}
              <div className="flex gap-3 mb-6">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="input-field w-32"
                >
                  {HTTP_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="https://api.example.com/endpoint"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  onClick={sendRequest}
                  disabled={isLoading || !url.trim()}
                  className="btn-primary px-6"
                >
                  {isLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send
                </button>
              </div>

              {/* Headers */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900">Headers</h4>
                  <button
                    onClick={addHeader}
                    className="btn-secondary text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Header
                  </button>
                </div>
                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Header name"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        className="input-field flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Header value"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        className="input-field flex-1"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              {['POST', 'PUT', 'PATCH'].includes(method) && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Request Body</h4>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter JSON or raw body content..."
                    className="textarea-field h-32 font-mono text-sm"
                  />
                </div>
              )}
            </div>

            {/* Response Panel */}
            {response && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold text-slate-900">Response</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(response.status)}`}>
                          {response.status} {response.statusText}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {response.time}ms
                        </span>
                        <span className="text-slate-500">
                          {formatBytes(response.size)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyResponse}
                        className="btn-secondary text-sm"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                      <button
                        onClick={downloadResponse}
                        className="btn-secondary text-sm"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex mt-4">
                    <button
                      onClick={() => setActiveTab('response')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activeTab === 'response'
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Response
                    </button>
                    <button
                      onClick={() => setActiveTab('headers')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activeTab === 'headers'
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Headers
                    </button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-auto">
                  {activeTab === 'response' ? (
                    <pre 
                      ref={responseRef}
                      className="p-4 text-sm font-mono text-slate-700 whitespace-pre-wrap"
                    >
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  ) : (
                    <div className="p-4">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="flex py-1 text-sm">
                          <span className="font-medium text-slate-900 w-1/3">{key}:</span>
                          <span className="text-slate-600 font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sample Requests */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Sample Requests</h3>
              <div className="space-y-2">
                {SAMPLE_REQUESTS.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => loadSampleRequest(sample)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-slate-900 text-sm">{sample.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      <span className="font-mono bg-slate-100 px-1 rounded">{sample.method}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Requests */}
            {savedRequests.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Saved Requests</h3>
                <div className="space-y-2">
                  {savedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                    >
                      <button
                        onClick={() => loadSavedRequest(request)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium text-slate-900 text-sm">{request.name}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          <span className="font-mono bg-slate-100 px-1 rounded">{request.method}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => deleteSavedRequest(request.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Guide */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">HTTP Status Codes</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-slate-600">2xx - Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-yellow-600" />
                  <span className="text-slate-600">3xx - Redirection</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-slate-600">4xx - Client Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-slate-600">5xx - Server Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}