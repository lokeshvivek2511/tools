import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Download, Copy, Eye, Code, RefreshCw, BookOpen, Zap, AlertCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import mermaid from 'mermaid'
import { saveAs } from 'file-saver'
import ReactMarkdown from 'react-markdown'

// Array of API keys for failover
const GEMINI_API_KEYS = [
  'AIzaSyBOEdCyM5xpwjtqxamo6U6PuNcn2jlHa5M',
  'AIzaSyAGse_1T_xmql9EkxtrG10DzMZbOXJ0oZs',
  'AIzaSyBgJNi9SXoEbV-pQnWYpm47VfoEhLXIjAA',
  'AIzaSyCJZD4Wyxsq_KY_90faiteBGnm_cHtWNUY'
]

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  },
  sequence: {
    useMaxWidth: true,
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50
  },
  gantt: {
    titleTopMargin: 25,
    barHeight: 20,
    barGap: 4,
    topPadding: 50,
    leftPadding: 75,
    gridLineStartPadding: 35,
    fontSize: 11,
    numberSectionStyles: 4,
    axisFormat: '%Y-%m-%d'
  }
})

const DIAGRAM_TYPES = [
  { value: 'flowchart', label: 'Flowchart' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'class', label: 'Class Diagram' },
  { value: 'state', label: 'State Diagram' },
  { value: 'gantt', label: 'Gantt Chart' },
  { value: 'er', label: 'Entity Relationship' }
]

const DIAGRAM_TEMPLATES = [
  {
    name: 'Simple Flowchart',
    description: 'Basic process flow diagram',
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[Alternative]
    C --> E[End]
    D --> E`
  },
  {
    name: 'Sequence Diagram',
    description: 'Communication between entities',
    code: `sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Request Data
    System->>Database: Query
    Database->>System: Result
    System->>User: Response`
  },
  {
    name: 'Class Diagram',
    description: 'Object-oriented class structure',
    code: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    class Admin {
        +deleteUser()
        +manageSystem()
    }
    User <|-- Admin`
  },
  {
    name: 'State Diagram',
    description: 'State transitions and workflow',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Loading
    Loading --> Success
    Loading --> Error
    Success --> [*]
    Error --> Retry
    Retry --> Loading`
  },
  {
    name: 'Gantt Chart',
    description: 'Project timeline and scheduling',
    code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
        Planning     :done, des1, 2024-01-01, 2024-01-15
        Development  :active, des2, 2024-01-16, 2024-02-15
    section Phase 2
        Testing      :des3, 2024-02-16, 2024-03-01
        Deployment   :des4, 2024-03-02, 2024-03-15`
  },
  {
    name: 'Entity Relationship',
    description: 'Database relationships',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
        string phone
    }
    ORDER {
        int orderID
        string orderDate
        float total
    }`
  }
]

export default function DiagramGenerator() {
  const [inputText, setInputText] = useState('')
  const [mermaidCode, setMermaidCode] = useState('')
  const [renderedSvg, setRenderedSvg] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('preview')
  const [diagramType, setDiagramType] = useState('flowchart')
  const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState(0)
  const diagramRef = useRef(null)

  const generateWithAI = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter a description')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const prompt = `Generate a Mermaid ${diagramType} diagram code based on this description. 
      Only respond with the valid Mermaid code wrapped in \`\`\`mermaid code blocks, nothing else.
      Description: ${inputText}`

      let generatedCode = ''
      let attempts = 0
      const maxAttempts = GEMINI_API_KEYS.length

      while (attempts < maxAttempts && !generatedCode) {
        try {
          const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEYS[currentApiKeyIndex]}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1024,
              }
            })
          })

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
          }

          const data = await response.json()
          const responseText = data.candidates[0]?.content?.parts[0]?.text

          if (!responseText) {
            throw new Error('No code generated')
          }

          // Extract mermaid code from markdown code block
          const codeBlockRegex = /```mermaid([\s\S]*?)```/
          const match = responseText.match(codeBlockRegex)
          generatedCode = match ? match[1].trim() : responseText.trim()

          setMermaidCode(generatedCode)
          renderDiagram(generatedCode)
          toast.success('Diagram generated with AI!')
        } catch (error) {
          console.error(`Attempt ${attempts + 1} failed:`, error)
          if (attempts < maxAttempts - 1) {
            const nextIndex = (currentApiKeyIndex + 1) % GEMINI_API_KEYS.length
            setCurrentApiKeyIndex(nextIndex)
            toast(`Trying next API key (${nextIndex + 1}/${GEMINI_API_KEYS.length})`, { icon: '🔄' })
          } else {
            throw error
          }
        }
        attempts++
      }
    } catch (error) {
      console.error('All API attempts failed:', error)
      toast.error('Failed to generate diagram')
      setError('AI generation failed. Please try manual code or another description.')
    } finally {
      setIsGenerating(false)
    }
  }

  const loadTemplate = (template) => {
    setMermaidCode(template.code)
    setInputText('')
    renderDiagram(template.code)
    toast.success(`Loaded: ${template.name}`)
  }

  const renderDiagram = useCallback(async (code) => {
    if (!code.trim()) {
      setRenderedSvg('');
      setError('');
      return;
    }

    setIsRendering(true);
    setError('');

    try {
      const { svg } = await mermaid.render('mermaid-container', code);
      setRenderedSvg(svg);
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError('Invalid diagram syntax. Please check your Mermaid code.');
    } finally {
      setIsRendering(false);
    }
  }, [])

  useEffect(() => {
    if (mermaidCode) {
      const timeoutId = setTimeout(() => {
        renderDiagram(mermaidCode)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [mermaidCode, renderDiagram])

  const downloadSvg = () => {
    if (!renderedSvg) {
      toast.error('No diagram to download')
      return
    }

    const blob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' })
    saveAs(blob, 'diagram.svg')
    toast.success('SVG downloaded!')
  }

  const downloadPng = async () => {
    if (!renderedSvg) {
      toast.error('No diagram to download')
      return
    }

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width * 2
        canvas.height = img.height * 2
        ctx.scale(2, 2)
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          saveAs(blob, 'diagram.png')
          toast.success('PNG downloaded!')
        })
      }

      const svgBlob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      img.src = url
    } catch (error) {
      toast.error('Failed to download PNG')
    }
  }

  const copyCode = async () => {
    if (!mermaidCode) return
    
    try {
      await navigator.clipboard.writeText(mermaidCode)
      toast.success('Mermaid code copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy code')
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
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
              <GitBranch className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Diagram Generator</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Create beautiful diagrams from text using Mermaid syntax or AI generation.
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
         

          {/* Text to Diagram */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                AI Diagram Generation
              </h3>
              {currentApiKeyIndex > 0 && (
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                  Using backup key {currentApiKeyIndex + 1}/{GEMINI_API_KEYS.length}
                </span>
              )}
            </div>
            
            <select
              value={diagramType}
              onChange={(e) => setDiagramType(e.target.value)}
              className="w-full p-2 mb-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {DIAGRAM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your diagram (e.g., 'A user logs in, then sees a dashboard')"
              className="w-full h-32 p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 mb-4"
            />
            <button
              onClick={generateWithAI}
              disabled={isGenerating || !inputText.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </>
              )}
            </button>
          </div>

          {/* Mermaid Code Editor */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Code className="h-5 w-5 mr-2 text-pink-600" />
                Mermaid Code
              </h3>
              <button
                onClick={copyCode}
                disabled={!mermaidCode}
                className="px-3 py-1 text-sm text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </button>
            </div>
            <textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              placeholder="Enter Mermaid diagram code here..."
              className="w-full h-64 p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-mono text-sm"
            />
          </div>

           {/* Templates */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-pink-600" />
              Diagram Templates
            </h3>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {DIAGRAM_TEMPLATES.map((template, index) => (
                <button
                  key={index}
                  onClick={() => loadTemplate(template)}
                  className="text-left p-3 border border-slate-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all"
                >
                  <div className="font-medium text-slate-900">{template.name}</div>
                  <div className="text-sm text-slate-600">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Preview Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-pink-100 text-pink-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Preview
                </button>
              </div>
              
              {renderedSvg && (
                <div className="flex space-x-2">
                  <button
                    onClick={downloadSvg}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    SVG
                  </button>
                  <button
                    onClick={downloadPng}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PNG
                  </button>
                </div>
              )}
            </div>

            {/* Diagram Preview */}
            <div className="min-h-96 border border-slate-200 rounded-lg bg-slate-50 overflow-auto">
              {isRendering ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
                    <p className="text-slate-600">Rendering diagram...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-red-600">
                    <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                    <p className="font-medium mb-2">Rendering Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : renderedSvg ? (
                <div className="p-4 flex justify-center items-center min-h-96">
                  <div 
                    className="mermaid-container w-full"
                    dangerouslySetInnerHTML={{ __html: renderedSvg }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-slate-500">
                    <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your diagram will appear here</p>
                    <p className="text-sm mt-2">Choose a template, describe a diagram, or write Mermaid code</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Features</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">AI-powered diagram generation with automatic failover</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Multiple diagram types (flowchart, sequence, class, etc.)</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Built-in templates and real-time preview</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Export as SVG or high-resolution PNG</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}