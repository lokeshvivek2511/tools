import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Copy, Download, Loader, Brain, BookOpen, List, Zap, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

// Array of API keys for failover
const GEMINI_API_KEYS = [
  'AIzaSyBOEdCyM5xpwjtqxamo6U6PuNcn2jlHa5M',
  'AIzaSyAGse_1T_xmql9EkxtrG10DzMZbOXJ0oZs',
  'AIzaSyBgJNi9SXoEbV-pQnWYpm47VfoEhLXIjAA',
  'AIzaSyCJZD4Wyxsq_KY_90faiteBGnm_cHtWNUY'
]

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SUMMARY_TYPES = [
  { value: 'brief', label: 'Brief Summary', description: 'Quick overview in 2-3 sentences' },
  { value: 'detailed', label: 'Detailed Summary', description: 'Comprehensive summary with key points' },
  { value: 'bullet', label: 'Bullet Points', description: 'Key points in bullet format' },
  { value: 'key_insights', label: 'Key Insights', description: 'Main takeaways and insights' }
]

const SAMPLE_TEXTS = [
  {
    title: 'Technology Article',
    text: `Artificial Intelligence (AI) has revolutionized numerous industries...`
  },
  {
    title: 'Research Paper Abstract',
    text: `Climate change poses significant challenges to global food security...`
  }
]

export default function TextSummarizer() {
  const [inputText, setInputText] = useState('')
  const [summaryType, setSummaryType] = useState('brief')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState(0)

  const handleTextChange = (text) => {
    setInputText(text)
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
  }

  const generateSummary = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to summarize')
      return
    }

    setIsLoading(true)
    setSummary('')

    try {
      const prompt = getSummaryPrompt(summaryType, inputText)
      let generatedSummary = ''
      let attempts = 0
      const maxAttempts = GEMINI_API_KEYS.length

      while (attempts < maxAttempts && !generatedSummary) {
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
                temperature: 0.7,
                maxOutputTokens: 1024,
              }
            })
          })

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
          }

          const data = await response.json()
          generatedSummary = data.candidates[0]?.content?.parts[0]?.text

          if (!generatedSummary) {
            throw new Error('No summary generated')
          }

          setSummary(generatedSummary)
          toast.success('Summary generated successfully!')
        } catch (error) {
          console.error(`Attempt ${attempts + 1} failed:`, error)
          if (attempts < maxAttempts - 1) {
            // Switch to next API key
            const nextIndex = (currentApiKeyIndex + 1) % GEMINI_API_KEYS.length
            setCurrentApiKeyIndex(nextIndex)
            toast(`Trying next API key (${nextIndex + 1}/${GEMINI_API_KEYS.length})`, { icon: '🔄' })
          } else {
            throw error // Re-throw if all attempts failed
          }
        }
        attempts++
      }

    } catch (error) {
      console.error('All API attempts failed:', error)
      toast.error('Failed to generate summary. Please try again later.')
      setSummary('## Error\n\nFailed to generate summary. Please check your internet connection and try again.\n\n```\n' + error.message + '\n```')
    } finally {
      setIsLoading(false)
    }
  }

  const getSummaryPrompt = (type, text) => {
    const prompts = {
      brief: `Please provide a concise 2-3 sentence summary of this text in markdown format:\n\n${text}`,
      detailed: `Provide a detailed summary in markdown format with paragraphs covering all key points:\n\n${text}`,
      bullet: `Summarize this text as a bulleted list in markdown format:\n\n${text}`,
      key_insights: `Extract the main insights and takeaways from this text in markdown format with headings:\n\n${text}`
    }
    return prompts[type] || prompts.brief
  }

  const loadSample = (sample) => {
    setInputText(sample.text)
    setWordCount(sample.text.trim().split(/\s+/).length)
    toast.success(`Loaded: ${sample.title}`)
  }

  const copyToClipboard = async () => {
    if (!summary) return

    try {
      await navigator.clipboard.writeText(summary)
      toast.success('Summary copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy summary')
    }
  }

  const downloadSummary = () => {
    if (!summary) return

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'summary.md'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Summary downloaded as markdown!')
  }

  const clearText = () => {
    setInputText('')
    setSummary('')
    setWordCount(0)
    toast.success('Text cleared')
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
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Text Summarizer</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            AI-powered text summarization using Google Gemini. Get quick insights and key points from any text.
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
         

          {/* Text Input */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-teal-600" />
                Input Text
              </h3>
              <div className="text-sm text-slate-600">
                {wordCount} words
              </div>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste your text here to summarize..."
              className="w-full h-64 p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            
            {inputText && (
              <button
                onClick={clearText}
                className="mt-3 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear Text
              </button>
            )}
          </div>

            {/* Generate Button */}
          <button
            onClick={generateSummary}
            disabled={isLoading || !inputText.trim()}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Generate Summary
              </>
            )}
          </button>


          {/* Summary Type Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <List className="h-5 w-5 mr-2 text-teal-600" />
              Summary Type
            </h3>
            <div className="grid gap-3">
              {SUMMARY_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                    summaryType === type.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="summaryType"
                    value={type.value}
                    checked={summaryType === type.value}
                    onChange={(e) => setSummaryType(e.target.value)}
                    className="mt-1 text-teal-600"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-slate-900">{type.label}</div>
                    <div className="text-sm text-slate-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          


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
              <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
              {summary && (
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    onClick={downloadSummary}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Download summary"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-64 border border-slate-200 rounded-lg p-4 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-teal-500 mx-auto mb-4" />
                    <p className="text-slate-600">Generating your summary...</p>
                  </div>
                </div>
              ) : summary ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-slate-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your summary will appear here</p>
                    {currentApiKeyIndex > 0 && (
                      <p className="text-xs mt-2 text-amber-600">
                        Using backup API key {currentApiKeyIndex + 1}/{GEMINI_API_KEYS.length}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sample Texts */}
          {/* <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
              Sample Texts
            </h3>
            <div className="grid gap-3">
              {SAMPLE_TEXTS.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => loadSample(sample)}
                  className="text-left p-3 border border-slate-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all"
                >
                  <div className="font-medium text-slate-900">{sample.title}</div>
                  <div className="text-sm text-slate-600 truncate mt-1">
                    {sample.text.substring(0, 100)}...
                  </div>
                </button>
              ))}
            </div>
          </div> */}

          {/* Features */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Features</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">AI-powered summarization with automatic API failover</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Markdown formatted output with rich formatting</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Multiple summary formats and styles</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-slate-700">Built-in sample texts and word count</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}