import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import { ZoomIn, ZoomOut, Move, Maximize2, Eye, Copy, Download, ChevronRight, PanelLeftClose, PanelLeftOpen, ChevronUp, Plus, X } from 'lucide-react'
import './App.css'

mermaid.initialize({ 
  startOnLoad: false,
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
  const [svgContent, setSvgContent] = useState('')

  useEffect(() => {
    const renderDiagram = async () => {
      if (mermaidRef.current && chart.trim()) {
        try {
          // Clear previous content
          mermaidRef.current.innerHTML = ''
          
          // Generate unique ID for this diagram
          const diagramId = `mermaid-${id}-${Date.now()}`
          
          // Configure mermaid with current theme
          mermaid.initialize({ 
            startOnLoad: false,
            theme: theme as 'default' | 'base' | 'dark' | 'forest' | 'neutral' | 'null',
            securityLevel: 'loose',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 16
          })
          
          // Render the diagram
          const { svg } = await mermaid.render(diagramId, chart)
          setSvgContent(svg)
          
          // Insert the SVG into the container
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `
              <div style="padding: 2rem; text-align: center; color: #e53e3e; background: #fed7d7; border-radius: 8px;">
                <p><strong>Mermaid Diagram Error</strong></p>
                <p>Failed to render diagram. Please check the syntax.</p>
                <pre style="text-align: left; margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 4px; font-size: 12px;">${chart}</pre>
              </div>
            `
          }
        }
      }
    }
    
    renderDiagram()
  }, [chart, theme, id])

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
    if (svgContent) {
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
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

interface Tab {
  id: string;
  title: string;
  content: string;
}

function App() {
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false)
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      title: 'README.md',
      content: `# README Reader Pro

A professional markdown viewer with advanced Mermaid diagram support.

## Key Features
- **Clean Modern Design** - Professional and intuitive interface
- **Interactive Diagrams** - Zoom, pan, and fullscreen capabilities
- **Multi-theme Support** - Various diagram themes available
- **Fully Responsive** - Optimized for all devices
- **Real-time Preview** - Instant markdown rendering
- **Export Options** - Download diagrams as SVG
- **Copy Support** - Easy diagram code copying
- **Multi-tab Support** - Work with multiple README files

## Advanced Mermaid Features

Try these interactive controls on the diagram below:
- **Zoom**: Use +/- buttons for scale adjustment
- **Pan**: Click and drag to navigate
- **Themes**: Switch between visual styles
- **Fullscreen**: Expand for detailed viewing
- **Export**: Download as SVG or copy source code

\`\`\`mermaid
graph TB
    A[Paste Markdown] --> B{Contains Mermaid?}
    B -->|Yes| C[Render Interactive Diagram]
    B -->|No| D[Render Standard Markdown]
    C --> E[Add Controls & Features]
    E --> F[Beautiful Display]
    D --> F
    F --> G[Perfect Result]
    
    style A fill:#e3f2fd
    style C fill:#f3e5f5
    style E fill:#e8f5e8
    style F fill:#fff3e0
    style G fill:#ffebee
\`\`\`

## Complex Diagram Example

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant E as Editor
    participant P as Parser
    participant R as Renderer
    participant D as Diagram
    
    U->>E: Types markdown
    E->>P: Send content
    P->>P: Parse markdown
    P->>R: Send parsed data
    R->>D: Render mermaid
    D->>U: Display result
    
    Note over U,D: Real-time updates
    Note over D: Interactive controls
\`\`\`

## Supported Diagram Types

- Flowcharts & Graphs
- Sequence Diagrams  
- Gantt Charts
- Class Diagrams
- State Diagrams
- Entity Relationship
- User Journey
- GitGraph

**Try editing this content or paste your own README files using the tab system!**

## Simple Test Diagram

\`\`\`mermaid
graph LR
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

This renders as a simple three-node flowchart above.`
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [showBackToTop, setShowBackToTop] = useState(false)

  const diagramCounterRef = useRef(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop
        setShowBackToTop(scrollTop > 200)
      }
    }

    // Initial check
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop
        setShowBackToTop(scrollTop > 200)
      }
    }, 100)

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [activeTabId]) // Re-run when tab changes

  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: `README-${tabs.length + 1}.md`,
      content: `# New README File

Start writing your markdown content here...

\`\`\`mermaid
graph TD
    A[New Document] --> B[Edit Content]
    B --> C[Preview Result]
\`\`\`
`
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return // Don't close the last tab
    
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    setTabs(newTabs)
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id)
    }
  }

  const updateTabContent = (content: string) => {
    setTabs(tabs.map(tab => 
      tab.id === activeTabId ? { ...tab, content } : tab
    ))
  }

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  const renderCodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    
    if (language === 'mermaid') {
      const currentId = `${diagramCounterRef.current++}`
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
            <h1>README Reader Pro</h1>
            <div className="header-badges">
              <span className="badge">Mermaid Enabled</span>
              <span className="badge">Interactive</span>
              <span className="badge">Multi-tab</span>
            </div>
          </div>
          <p>Professional markdown viewer with advanced diagram capabilities</p>
        </div>
      </header>
      
      <div className="tabs-container">
        <div className="tabs-list">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span>{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  className="tab-close"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </button>
          ))}
          <button className="add-tab" onClick={addTab}>
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className={`main-content ${isEditorCollapsed ? 'editor-collapsed' : ''}`}>
        <div className={`editor-panel ${isEditorCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <h3>Markdown Editor</h3>
            <div className="editor-controls">
              {!isEditorCollapsed && (
                <div className="editor-stats">
                  {activeTab.content.split('\n').length} lines • {activeTab.content.length} chars
                </div>
              )}
              <button 
                onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                className="collapse-btn"
                title={isEditorCollapsed ? "Expand Editor" : "Collapse Editor"}
              >
                {isEditorCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>
          </div>
          {!isEditorCollapsed && (
            <textarea
              value={activeTab.content}
              onChange={(e) => updateTabContent(e.target.value)}
              placeholder="Paste your markdown content here..."
              className="markdown-input"
            />
          )}
        </div>
        
        <div className="preview-panel">
          <div className="panel-header">
            <div className="preview-header-content">
              {isEditorCollapsed && (
                <button 
                  onClick={() => setIsEditorCollapsed(false)}
                  className="expand-editor-btn"
                  title="Expand Editor"
                >
                  <ChevronRight size={16} />
                  <span>Show Editor</span>
                </button>
              )}
              <h3>Live Preview</h3>
              <div className="preview-badge">Real-time</div>
            </div>
          </div>
          <div className="markdown-output" ref={scrollContainerRef}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: renderCodeBlock
              }}
            >
              {activeTab.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      
      <button 
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Back to top"
      >
        <ChevronUp size={20} />
      </button>
    </div>
  )
}

export default App