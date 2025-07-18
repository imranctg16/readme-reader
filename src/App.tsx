import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import { ZoomIn, ZoomOut, Move, Maximize2, Eye, Copy, Download, Palette } from 'lucide-react'
import './App.css'

mermaid.initialize({ 
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 16
})

interface MermaidComponentProps {
  chart: string;
  id: string;
}

const MermaidComponent = ({ chart, id }: MermaidComponentProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [theme, setTheme] = useState('default')

  useEffect(() => {
    if (mermaidRef.current) {
      mermaidRef.current.innerHTML = chart
      mermaid.init({ theme }, mermaidRef.current)
    }
  }, [chart, theme])

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const svgElement = mermaidRef.current?.querySelector('svg')
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mermaid-diagram-${Date.now()}.svg`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const themes = ['default', 'dark', 'forest', 'neutral', 'base']

  return (
    <div className={`mermaid-container ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <div className="mermaid-controls">
        <div className="control-group">
          <button onClick={handleZoomIn} title="Zoom In" className="control-btn">
            <ZoomIn size={16} />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out" className="control-btn">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleReset} title="Reset View" className="control-btn">
            <Move size={16} />
          </button>
        </div>
        
        <div className="control-group">
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="theme-select"
            title="Change Theme"
          >
            {themes.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <button onClick={handleCopy} title="Copy Diagram Code" className="control-btn">
            <Copy size={16} />
          </button>
          <button onClick={handleDownload} title="Download SVG" className="control-btn">
            <Download size={16} />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            title="Toggle Fullscreen" 
            className="control-btn"
          >
            {isFullscreen ? <Eye size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div 
        className="mermaid-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          ref={mermaidRef}
          className="mermaid-diagram"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        />
      </div>
      
      <div className="zoom-indicator">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  )
}

function App() {
  const [markdown, setMarkdown] = useState(`# 🚀 Welcome to README Reader Pro

The ultimate markdown viewer with **advanced Mermaid diagram support**!

## ✨ Key Features
- 🎨 **Beautiful Modern Design** - Clean and professional interface
- 📊 **Interactive Diagrams** - Zoom, pan, and fullscreen support
- 🎯 **Multi-theme Support** - Choose from multiple diagram themes
- 📱 **Fully Responsive** - Perfect on any device
- ⚡ **Real-time Preview** - Instant markdown rendering
- 🔄 **Export Options** - Download diagrams as SVG
- 📋 **Copy Support** - Easy diagram code copying

## 🌟 Advanced Mermaid Features

Try these interactive controls on the diagram below:
- **Zoom**: Use +/- buttons or mouse wheel
- **Pan**: Click and drag to move around
- **Themes**: Switch between different visual styles
- **Fullscreen**: Expand for detailed viewing
- **Export**: Download as SVG or copy code

\`\`\`mermaid
graph TB
    A[📝 Paste Markdown] --> B{🔍 Contains Mermaid?}
    B -->|Yes| C[🎨 Render Interactive Diagram]
    B -->|No| D[📖 Render Standard Markdown]
    C --> E[🔧 Add Controls & Features]
    E --> F[✨ Beautiful Display]
    D --> F
    F --> G[🎯 Perfect Result!]
    
    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style E fill:#e8f5e8
    style F fill:#fff3e0
    style G fill:#ffebee
\`\`\`

## 🎯 More Complex Diagram Example

\`\`\`mermaid
sequenceDiagram
    participant U as 👤 User
    participant E as 📝 Editor
    participant P as 🔍 Parser
    participant R as 🎨 Renderer
    participant D as 📊 Diagram
    
    U->>E: Types markdown
    E->>P: Send content
    P->>P: Parse markdown
    P->>R: Send parsed data
    R->>D: Render mermaid
    D->>U: Display result
    
    Note over U,D: Real-time updates
    Note over D: Interactive controls
\`\`\`

## 🛠️ Supported Diagram Types

- 📊 Flowcharts & Graphs
- 🔄 Sequence Diagrams  
- 📈 Gantt Charts
- 🏛️ Class Diagrams
- 🗺️ State Diagrams
- 🌐 Entity Relationship
- 📋 User Journey
- 🔄 GitGraph

**Try editing this content or paste your own README!**`)

  const [diagramCounter, setDiagramCounter] = useState(0)

  const renderCodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    
    if (language === 'mermaid') {
      const currentId = `mermaid-${diagramCounter}`
      setDiagramCounter(prev => prev + 1)
      return <MermaidComponent chart={String(children).replace(/\n$/, '')} id={currentId} />
    }
    
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>📖 README Reader Pro</h1>
            <div className="header-badges">
              <span className="badge">Mermaid Enabled</span>
              <span className="badge">Interactive</span>
              <span className="badge">No Login</span>
            </div>
          </div>
          <p>Professional markdown viewer with advanced diagram capabilities</p>
        </div>
      </header>
      
      <div className="main-content">
        <div className="editor-panel">
          <div className="panel-header">
            <h3>📝 Markdown Editor</h3>
            <div className="editor-stats">
              {markdown.split('\n').length} lines • {markdown.length} chars
            </div>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Paste your markdown content here..."
            className="markdown-input"
          />
        </div>
        
        <div className="preview-panel">
          <div className="panel-header">
            <h3>👀 Live Preview</h3>
            <div className="preview-badge">Real-time</div>
          </div>
          <div className="markdown-output">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: renderCodeBlock
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App