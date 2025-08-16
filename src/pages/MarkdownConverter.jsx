import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import mermaid from 'mermaid'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'
import {
  Download,
  Copy,
  Eye,
  Code,
  FileText,
  Maximize2,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import 'katex/dist/katex.min.css'

// Initialize mermaid
mermaid.initialize({ startOnLoad: true, theme: 'default' })

const sampleMarkdown = `# Welcome to Markdown Converter

This is a **powerful** markdown converter with live preview and export capabilities.

## Features

- ✅ Live preview
- ✅ HTML export
- ✅ PDF generation
- ✅ Syntax highlighting
- ✅ GitHub Flavored Markdown (tables, task lists, strikethrough)
- ✅ Math ($$E = mc^2$$)
- ✅ Mermaid diagrams

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('Developer'));
\`\`\`

### Math Example

Inline: $E = mc^2$

Block:
$$
a^2 + b^2 = c^2
$$

### Mermaid Diagram

\`\`\`mermaid
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Result 1]
  B -->|No| D[Result 2]
\`\`\`

### Lists, Links, Tables

- [x] Completed task
- [ ] Incomplete task

| Feature     | Status |
|-------------|--------|
| Preview     | ✅     |
| Export      | ✅     |
| PDF         | ✅     |

> This is a blockquote with **bold** text and *italic* text.
`

function MermaidRenderer({ code }) {
  const ref = useRef()
  
  useEffect(() => {
    if (ref.current) {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        mermaid.render(id, code).then((result) => {
          ref.current.innerHTML = result.svg
        }).catch((error) => {
          console.error('Mermaid rendering error:', error)
          ref.current.textContent = 'Mermaid diagram error'
        })
      } catch (error) {
        console.error('Mermaid error:', error)
        ref.current.textContent = 'Mermaid diagram error'
      }
    }
  }, [code])
  
  return <div ref={ref} />
}

export default function MarkdownConverter() {
  const [markdown, setMarkdown] = useState(sampleMarkdown)
  const [activeTab, setActiveTab] = useState('preview')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [html, setHtml] = useState('')
  const markdownRef = useRef()

  // Convert markdown to HTML string for export
  useEffect(() => {
    // For HTML export, we'll use a simple conversion
    setHtml(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Document</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  ${markdownRef.current?.innerHTML || ''}
</body>
</html>
    `)
  }, [markdown])

  const copyToClipboard = async (content, type) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success(`${type} copied to clipboard!`)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadHTML = () => {
    const blob = new Blob([html], { type: 'text/html' })
    saveAs(blob, 'converted-document.html')
    toast.success('HTML file downloaded!')
  }

  const downloadPDF = () => {
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
      if (markdownRef.current) {
        pdf.html(markdownRef.current, {
          callback: function (doc) {
            doc.save('converted-document.pdf')
            toast.success('PDF downloaded!')
          },
          margin: [20, 20, 20, 20],
          html2canvas: { scale: 0.5 }
        })
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Error generating PDF')
    }
  }

  const clearContent = () => {
    setMarkdown('')
    toast.success('Content cleared!')
  }

  const loadSample = () => {
    setMarkdown(sampleMarkdown)
    toast.success('Sample content loaded!')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Markdown Converter</h1>
          <p className="text-slate-600">
            Convert Markdown to HTML, PDF, diagrams, and math with live preview. Full GFM + extended features.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button onClick={loadSample} className="btn-secondary text-sm">
                <FileText className="h-4 w-4" />
                Load Sample
              </button>
              <button onClick={clearContent} className="btn-secondary text-sm">
                <RefreshCw className="h-4 w-4" />
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(html, 'HTML')}
                className="btn-secondary text-sm"
              >
                <Copy className="h-4 w-4" />
                Copy HTML
              </button>
              <button onClick={downloadHTML} className="btn-secondary text-sm">
                <Download className="h-4 w-4" />
                HTML
              </button>
              <button onClick={downloadPDF} className="btn-primary text-sm">
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className={`grid gap-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6' : 'lg:grid-cols-2'}`}>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Markdown Input
                </h3>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Enter your markdown here..."
              className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Output
                  </h3>
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activeTab === 'preview'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setActiveTab('html')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activeTab === 'html'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      HTML
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-96 overflow-auto" ref={markdownRef}>
              {activeTab === 'preview' ? (
                <div className="p-4 prose prose-slate max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isMermaid = match && match[1] === 'mermaid'
                        
                        if (isMermaid) {
                          return <MermaidRenderer code={String(children).replace(/\n$/, '')} />
                        }
                        
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={dracula}
                            language={match[1]}
                            PreTag="div"
                            showLineNumbers
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              ) : (
                <pre className="p-4 text-sm font-mono text-slate-700 whitespace-pre-wrap">
                  {html}
                </pre>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Live Preview</h3>
            </div>
            <p className="text-sm text-slate-600">
              See your markdown rendered in real-time as you type
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Multiple Formats</h3>
            </div>
            <p className="text-sm text-slate-600">
              Export to HTML and PDF with proper formatting
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Full Feature Support</h3>
            </div>
            <p className="text-sm text-slate-600">
              All GFM, math, code, diagrams, tables, emoji, images, footnotes, and more supported
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
