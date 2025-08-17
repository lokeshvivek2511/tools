import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { saveAs } from 'file-saver';
import {
  Download,
  Copy,
  Eye,
  Code,
  FileText,
  Maximize2,
  RefreshCw,
  Minimize2,
  Image as ImageIcon,
  GripVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import 'katex/dist/katex.min.css';

// Mermaid configuration
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
  },
  journey: {
    useMaxWidth: true,
    diagramMarginX: 15
  }
});

const sampleMarkdown = `# Comprehensive Markdown Converter

This converter supports all standard Markdown features plus advanced Mermaid diagrams.

## Supported Mermaid Diagram Types

### Flowchart
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob!
    Bob->>Alice: Hi Alice!
    Alice->>Bob: How are you?
    Bob->>Alice: I'm good!
\`\`\`

### Class Diagram
\`\`\`mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }
\`\`\`

### State Diagram
\`\`\`mermaid
stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
\`\`\`

### Gantt Chart
\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Research       :done,    des1, 2023-01-01, 2023-01-15
    Requirements   :active,  des2, 2023-01-16, 2023-01-30
    section Phase 2
    Development    :         des3, 2023-02-01, 2023-03-15
    Testing        :         des4, 2023-03-16, 2023-04-01
\`\`\`

### Pie Chart
\`\`\`mermaid
pie
    title Browser Usage
    "Chrome" : 45.6
    "Edge" : 32.4
    "Firefox" : 10.1
    "Other" : 11.9
\`\`\`

### Journey Diagram
\`\`\`mermaid
journey
    title My day
    section Go to work
      Make coffee: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit on sofa: 3: Me
\`\`\`

## Advanced Markdown Features

### Math Equations
Inline math: $E = mc^2$

Display math:
$$
\\int_0^\\infty x^2 dx
$$

### Tables
| Syntax      | Description | Test Text     |
| :---        |    :----:   |          ---: |
| Header      | Title       | Here's this   |
| Paragraph   | Text        | And more      |

### Task Lists
- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

### Code with Syntax Highlighting
\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))
\`\`\`
`;

function MermaidDiagram({ code, diagramId }) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const diagramRef = useRef(null);

  const renderDiagram = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const container = diagramRef.current;
      if (!container) return;
      
      // Clear previous content
      container.innerHTML = '';
      
      // Generate unique ID for this diagram
      const id = `mermaid-${diagramId}-${Date.now()}`;
      
      // Create container for Mermaid
      const mermaidContainer = document.createElement('div');
      mermaidContainer.id = id;
      mermaidContainer.className = 'mermaid';
      mermaidContainer.textContent = code;
      container.appendChild(mermaidContainer);
      
      // Wait for Mermaid to render
      await mermaid.run({
        nodes: [mermaidContainer],
        suppressErrors: true
      });
      
      // Get the rendered SVG
      const svgElement = mermaidContainer.querySelector('svg');
      if (svgElement) {
        setSvg(svgElement.outerHTML);
      } else {
        throw new Error('Diagram rendering failed');
      }
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError('Failed to render diagram. Check your syntax.');
    } finally {
      setIsLoading(false);
    }
  }, [code, diagramId]);

  const downloadDiagram = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, `diagram-${diagramId}.svg`);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => showToast('Code copied to clipboard'))
      .catch(() => showToast('Failed to copy code', 'error'));
  };

  // Auto-render when component mounts
  useEffect(() => {
    renderDiagram();
  }, []);

  return (
    <div className="my-4 border rounded-lg overflow-hidden bg-gray-50">
      <div className="flex items-center justify-between bg-gray-100 p-2 border-b">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Mermaid Diagram</span>
          {isLoading && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              Rendering...
            </span>
          )}
          {error && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Error
            </span>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={copyCode}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            title="Copy code"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={downloadDiagram}
            disabled={!svg}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            title="Download SVG"
          >
            <Download size={16} />
          </button>
          <button
            onClick={renderDiagram}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            title="Re-render"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-2 bg-white">
        {isExpanded && (
          <pre className="text-xs p-2 mb-2 bg-gray-100 rounded overflow-x-auto">
            {code}
          </pre>
        )}
        
        <div ref={diagramRef} className="flex justify-center items-center min-h-[200px]">
          {error ? (
            <div className="text-red-500 text-sm p-4">{error}</div>
          ) : svg ? (
            <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full" />
          ) : (
            <div className="text-gray-400 text-sm p-4">Rendering diagram...</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MarkdownConverter() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [activeTab, setActiveTab] = useState('preview');
  const [isInputFullscreen, setIsInputFullscreen] = useState(false);
  const [isOutputFullscreen, setIsOutputFullscreen] = useState(false);
  const [outputHeight, setOutputHeight] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(500);
  const markdownRef = useRef(null);
  const resizeRef = useRef(null);
  const toastRef = useRef(null);

  // Generate HTML for export
  const generateHtml = useCallback(() => {
    if (!markdownRef.current) return '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Markdown Export</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    pre {
      background: #f5f5f5;
      padding: 1em;
      border-radius: 3px;
      overflow-x: auto;
    }
    code {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
    }
    .mermaid {
      margin: 1em 0;
      text-align: center;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  ${markdownRef.current.innerHTML}
</body>
</html>`;
  }, []);

  // Toast notification
  const showToast = useCallback((message, type = 'success') => {
    // Clear existing toasts
    if (toastRef.current) {
      document.body.removeChild(toastRef.current);
    }
    
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-md text-white ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } animate-fadeIn`;
    toast.textContent = message;
    document.body.appendChild(toast);
    toastRef.current = toast;
    
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
        toastRef.current = null;
      }, 300);
    }, 2000);
  }, []);

  // Copy HTML to clipboard
  const copyHtml = useCallback(() => {
    const html = generateHtml();
    navigator.clipboard.writeText(html)
      .then(() => showToast('HTML copied to clipboard'))
      .catch(() => showToast('Failed to copy HTML', 'error'));
  }, [generateHtml, showToast]);

  // Download HTML file
  const downloadHtml = useCallback(() => {
    const html = generateHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    saveAs(blob, 'markdown-export.html');
    showToast('HTML file downloaded');
  }, [generateHtml, showToast]);

  // Clear editor content
  const clearContent = useCallback(() => {
    setMarkdown('');
    showToast('Editor cleared');
  }, [showToast]);

  // Load sample content
  const loadSample = useCallback(() => {
    setMarkdown(sampleMarkdown);
    showToast('Sample content loaded');
  }, [showToast]);

  // Resizable output panel
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(outputHeight);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [outputHeight]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newHeight = startHeight + (e.clientY - startY);
    setOutputHeight(Math.max(200, Math.min(window.innerHeight - 100, newHeight)));
  }, [isDragging, startHeight, startY]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Stats
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const lineCount = markdown.split('\n').length;
  const charCount = markdown.length;

  // Handle fullscreen toggles
  const toggleInputFullscreen = useCallback(() => {
    setIsInputFullscreen(prev => !prev);
    if (isOutputFullscreen) setIsOutputFullscreen(false);
  }, [isOutputFullscreen]);

  const toggleOutputFullscreen = useCallback(() => {
    setIsOutputFullscreen(prev => !prev);
    if (isInputFullscreen) setIsInputFullscreen(false);
  }, [isInputFullscreen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Markdown Converter</h1>
            <p className="text-gray-600">Supports all Markdown features including Mermaid diagrams and math equations</p>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadSample}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                >
                  <FileText size={16} />
                  <span>Load Sample</span>
                </button>
                <button
                  onClick={clearContent}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Clear</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyHtml}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-sm font-medium text-blue-700 transition-colors"
                >
                  <Copy size={16} />
                  <span>Copy HTML</span>
                </button>
                <button
                  onClick={downloadHtml}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-md text-sm font-medium text-green-700 transition-colors"
                >
                  <Download size={16} />
                  <span>Export HTML</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editor and Preview */}
          <div className={`grid gap-6 ${isInputFullscreen || isOutputFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : 'lg:grid-cols-2'}`}>
            {/* Markdown Input */}
            {(!isOutputFullscreen || isInputFullscreen) && (
              <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col ${isInputFullscreen ? 'h-[calc(100vh-32px)]' : 'h-[500px]'}`}>
                <div className="border-b border-gray-200 p-3 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Code size={18} className="text-gray-500" />
                    <h3 className="font-medium text-gray-700">Markdown Editor</h3>
                  </div>
                  <button
                    onClick={toggleInputFullscreen}
                    className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isInputFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                </div>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none flex-grow"
                  placeholder="Write your Markdown here..."
                />
              </div>
            )}

            {/* Preview/Output */}
            {(!isInputFullscreen || isOutputFullscreen) && (
              <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col ${isOutputFullscreen ? 'h-[calc(100vh-32px)]' : 'h-[500px]'}`}>
                <div className="border-b border-gray-200 p-3 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Eye size={18} className="text-gray-500" />
                      <h3 className="font-medium text-gray-700">Preview</h3>
                    </div>
                    <div className="flex bg-gray-100 rounded-md p-1">
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1 text-sm rounded ${activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => setActiveTab('html')}
                        className={`px-3 py-1 text-sm rounded ${activeTab === 'html' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        HTML
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={toggleOutputFullscreen}
                    className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isOutputFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                </div>

                <div
                  className="relative overflow-auto bg-white flex-grow"
                  ref={markdownRef}
                >
                  {activeTab === 'preview' ? (
                    <div className="p-6 prose prose-slate max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeRaw, rehypeKatex]}
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isMermaid = match && match[1] === 'mermaid';
                            
                            if (isMermaid) {
                              const diagramId = Math.random().toString(36).substring(2, 9);
                              return (
                                <MermaidDiagram 
                                  code={String(children).replace(/\n$/, '')} 
                                  diagramId={diagramId}
                                />
                              );
                            }
                            
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={dracula}
                                language={match[1]}
                                PreTag="div"
                                showLineNumbers
                                wrapLines
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {markdown}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <pre className="p-6 text-sm font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
                      {generateHtml()}
                    </pre>
                  )}
                </div>

                {!isOutputFullscreen && !isInputFullscreen && (
                  <div
                    ref={resizeRef}
                    onMouseDown={handleMouseDown}
                    className="h-2 bg-gray-100 hover:bg-gray-200 cursor-ns-resize flex items-center justify-center"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Words</h3>
                <span className="text-xl font-semibold text-gray-900">{wordCount}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Lines</h3>
                <span className="text-xl font-semibold text-gray-900">{lineCount}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Characters</h3>
                <span className="text-xl font-semibold text-gray-900">{charCount}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .mermaid svg {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}

export default MarkdownConverter;