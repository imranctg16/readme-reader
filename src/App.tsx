import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ZoomIn, ZoomOut, Move, Maximize2, Eye, Copy, Download, ChevronRight, PanelLeftClose, PanelLeftOpen, ChevronUp, Plus, X, FileText, Zap, Layers, Link2 } from 'lucide-react'
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

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

const encodeBase64Url = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const decodeBase64Url = (value: string): Uint8Array => {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalizedValue.length % 4)) % 4)
  const binary = atob(`${normalizedValue}${padding}`)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

const compressText = async (content: string): Promise<string> => {
  const rawBytes = new TextEncoder().encode(content)

  if (typeof CompressionStream === 'undefined') {
    return `p.${encodeBase64Url(rawBytes)}`
  }

  const stream = new CompressionStream('gzip')
  const writer = stream.writable.getWriter()
  await writer.write(rawBytes)
  await writer.close()

  const compressedBytes = new Uint8Array(await new Response(stream.readable).arrayBuffer())
  return `g.${encodeBase64Url(compressedBytes)}`
}

const decompressText = async (value: string): Promise<string> => {
  const [encoding, payload] = value.split('.', 2)
  if (!encoding || !payload) {
    throw new Error('Invalid share link format. Expected format: [encoding].[data]')
  }

  const bytes = decodeBase64Url(payload)

  if (encoding === 'p') {
    return new TextDecoder().decode(bytes)
  }

  if (encoding === 'g') {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('This browser cannot open compressed shared links.')
    }

    const stream = new DecompressionStream('gzip')
    const writer = stream.writable.getWriter()
    await writer.write(bytes)
    await writer.close()

    const decompressedBytes = new Uint8Array(await new Response(stream.readable).arrayBuffer())
    return new TextDecoder().decode(decompressedBytes)
  }

  throw new Error('Unsupported share encoding')
}

let sharedTabIdCounter = 0

const createUniqueTabId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  sharedTabIdCounter += 1
  return `shared-${Date.now()}-${sharedTabIdCounter}`
}

const getShareErrorMessage = (error: unknown, action: 'load' | 'share'): string => {
  if (error instanceof Error) {
    if (error.message.includes('Invalid share link format')) {
      return 'Malformed share link'
    }
    if (error.message.includes('cannot open compressed')) {
      return 'This browser cannot open compressed share links'
    }
    if (action === 'share' && error.message.toLowerCase().includes('clipboard')) {
      return 'Clipboard permission denied'
    }
  }

  return action === 'load' ? 'Unable to open share link' : 'Failed to copy share link'
}

const copyTextWithFallback = async (value: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value)
    return true
  }

  const textArea = document.createElement('textarea')
  textArea.value = value
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  textArea.style.pointerEvents = 'none'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  const copied = document.execCommand('copy')
  document.body.removeChild(textArea)
  return copied
}

function App() {
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false)
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      title: 'README.md',
      content: `# Readme Reader

A professional markdown viewer with advanced Mermaid diagram support and IDE-like syntax highlighting.

## Key Features
- **Clean Modern Design** - Professional and intuitive interface
- **Interactive Diagrams** - Zoom, pan, and fullscreen capabilities
- **IDE-like Syntax Highlighting** - Beautiful code blocks with line numbers
- **Multi-theme Support** - Various diagram themes available
- **Fully Responsive** - Optimized for all devices
- **Real-time Preview** - Instant markdown rendering
- **Export Options** - Download diagrams as SVG
- **Copy Support** - Easy diagram code copying
- **Multi-tab Support** - Work with multiple README files

## Code Syntax Highlighting Examples

### TypeScript/JavaScript
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const fetchUser = async (id: number): Promise<User> => {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
};

class UserManager {
  private users: Map<number, User> = new Map();
  
  async addUser(user: User): Promise<void> {
    this.users.set(user.id, user);
    await this.saveToDatabase(user);
  }
}
\`\`\`

### Python
\`\`\`python
import asyncio
from typing import List, Optional

class DataProcessor:
    def __init__(self, config: dict):
        self.config = config
        self.cache = {}
    
    async def process_data(self, items: List[str]) -> Optional[dict]:
        """Process a list of items and return results."""
        results = {}
        
        for item in items:
            if item in self.cache:
                results[item] = self.cache[item]
            else:
                processed = await self._process_item(item)
                self.cache[item] = processed
                results[item] = processed
        
        return results if results else None

# Usage example
processor = DataProcessor({"batch_size": 100})
data = await processor.process_data(["item1", "item2", "item3"])
\`\`\`

### JSON Configuration
\`\`\`json
{
  "name": "readme-reader",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-syntax-highlighter": "^15.6.1",
    "mermaid": "^11.9.0"
  },
  "features": {
    "syntaxHighlighting": true,
    "lineNumbers": true,
    "themes": ["vscode-dark", "github", "atom"]
  }
}
\`\`\`

### Bash/Shell
\`\`\`bash
#!/bin/bash

# Install dependencies
npm install react-syntax-highlighter

# Build the project
npm run build

# Deploy to production
if [ "$NODE_ENV" = "production" ]; then
    echo "Deploying to production..."
    npm run deploy
    
    # Cleanup
    rm -rf dist/temp
    find . -name "*.log" -delete
fi

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed!"
    exit 1
fi
\`\`\`

## Advanced Mermaid Features

Try these interactive controls on the diagram below:
- **Zoom**: Use +/- buttons for scale adjustment
- **Pan**: Click and drag to navigate
- **Themes**: Switch between visual styles
- **Fullscreen**: Expand for detailed viewing
- **Export**: Download as SVG or copy source code

\`\`\`mermaid
graph TB
    A[Paste Markdown] --> B{Contains Code?}
    B -->|Yes| C[Apply Syntax Highlighting]
    B -->|Mermaid| D[Render Interactive Diagram]
    B -->|Plain Text| E[Render Standard Markdown]
    C --> F[Beautiful Code Display]
    D --> G[Interactive Controls]
    E --> H[Simple Text]
    F --> I[Perfect Result]
    G --> I
    H --> I
    
    style A fill:#e3f2fd
    style C fill:#f3e5f5
    style D fill:#e8f5e8
    style F fill:#fff3e0
    style I fill:#ffebee
\`\`\`

## More Language Examples

### CSS
\`\`\`css
.syntax-highlighter {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.code-block {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .syntax-highlighter {
    padding: 0.5rem;
    font-size: 12px;
  }
}
\`\`\`

### SQL
\`\`\`sql
-- Create users table with indexes
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Insert sample data
INSERT INTO users (username, email) VALUES 
    ('john_doe', 'john@example.com'),
    ('jane_smith', 'jane@example.com');

-- Complex query with joins
SELECT 
    u.username,
    u.email,
    COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.username, u.email
HAVING COUNT(p.id) > 5
ORDER BY post_count DESC;
\`\`\`

**Try editing this content or paste your own README files to see the syntax highlighting in action!**`
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [shareStatus, setShareStatus] = useState('')

  const diagramCounterRef = useRef(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shareStatusTimeoutRef = useRef<number | null>(null)

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  const updateShareStatus = useCallback((message: string) => {
    setShareStatus(message)

    if (shareStatusTimeoutRef.current) {
      window.clearTimeout(shareStatusTimeoutRef.current)
    }

    shareStatusTimeoutRef.current = window.setTimeout(() => {
      setShareStatus('')
      shareStatusTimeoutRef.current = null
    }, 3000)
  }, [])

  useEffect(() => {
    return () => {
      if (shareStatusTimeoutRef.current) {
        window.clearTimeout(shareStatusTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadSharedContent = async () => {
      const searchParams = new URLSearchParams(window.location.search)
      const sharedValue = searchParams.get('share')
      if (!sharedValue) return

      try {
        const decodedPayload = await decompressText(sharedValue)
        let sharedTitle = 'Shared README.md'
        let decodedContent = decodedPayload

        try {
          const parsedPayload = JSON.parse(decodedPayload) as { title?: unknown; content?: unknown }
          if (typeof parsedPayload.content === 'string') {
            decodedContent = parsedPayload.content
          }
          if (typeof parsedPayload.title === 'string' && parsedPayload.title.trim()) {
            sharedTitle = parsedPayload.title
          }
        } catch (parseError) {
          console.info('Loaded legacy shared payload format:', parseError)
          // Backward compatibility: plain markdown payloads are still supported.
        }

        const sharedTab: Tab = {
          id: createUniqueTabId(),
          title: sharedTitle,
          content: decodedContent
        }

        if (!isMounted) return

        setTabs(prevTabs => [...prevTabs, sharedTab])
        setActiveTabId(sharedTab.id)
        updateShareStatus('Shared content loaded')

        searchParams.delete('share')
        const nextSearch = searchParams.toString()
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`
        window.history.replaceState({}, '', nextUrl)
      } catch (error) {
        console.error('Failed to load shared content:', error)
        if (!isMounted) return
        updateShareStatus(getShareErrorMessage(error, 'load'))
      }
    }

    loadSharedContent()

    return () => {
      isMounted = false
    }
  }, [updateShareStatus])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop
        setShowBackToTop(scrollTop > 100)
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      // Check initial scroll position
      const scrollTop = scrollContainer.scrollTop
      setShowBackToTop(scrollTop > 100)
      
      // Add scroll listener
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      
      // Cleanup function
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
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

  const handleShare = async () => {
    try {
      const encodedContent = await compressText(JSON.stringify({
        title: activeTab.title,
        content: activeTab.content
      }))
      const url = new URL(window.location.href)
      url.searchParams.set('share', encodedContent)
      const shareLink = url.toString()

      if (navigator.share) {
        try {
          await navigator.share({
            title: activeTab.title,
            text: `Shared from Readme Reader: ${activeTab.title}`,
            url: shareLink
          })
          updateShareStatus('Share dialog opened')
          return
        } catch (shareError) {
          if (!(shareError instanceof DOMException && shareError.name === 'AbortError')) {
            console.info('Native share unavailable, falling back to copy:', shareError)
          } else {
            updateShareStatus('Share cancelled')
            return
          }
        }
      }

      const copied = await copyTextWithFallback(shareLink)
      if (copied) {
        updateShareStatus('Share link copied')
      } else {
        window.prompt('Copy this share link:', shareLink)
        updateShareStatus('Share link ready to copy')
      }
    } catch (error) {
      console.error('Failed to create share link:', error)
      updateShareStatus(getShareErrorMessage(error, 'share'))
    }
  }

  const renderCodeBlock = ({ inline, className, children, ...props }: CodeBlockProps) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    
    if (language === 'mermaid') {
      const currentId = `${diagramCounterRef.current++}`
      return <MermaidComponent chart={String(children).replace(/\n$/, '')} id={currentId} />
    }
    
    if (!inline && language) {
      return (
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: '1rem 0',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          showLineNumbers={true}
          wrapLines={true}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
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
          <div className="header-logo">
            <div className="logo-icon">
              <FileText size={28} />
              <div className="logo-accent">
                <Zap size={14} />
              </div>
            </div>
            <div className="header-title">
              <h1>Readme Reader</h1>
              <div className="header-badges">
                <span className="badge badge-primary">
                  <Layers size={12} />
                  Mermaid
                </span>
                <span className="badge badge-success">
                  <Zap size={12} />
                  Interactive
                </span>
                <span className="badge badge-info">Multi-tab</span>
              </div>
            </div>
          </div>
          <p className="header-description">
            Professional markdown viewer with advanced diagram capabilities
          </p>
        </div>
      </header>
      
      <div className="tabs-container">
        <div className="tabs-list">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
            >
              <button
                className="tab-title"
                onClick={() => setActiveTabId(tab.id)}
              >
                <span>{tab.title}</span>
              </button>
              {tabs.length > 1 && (
                <button
                  className="tab-close"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  title="Close tab"
                >
                  <X size={16} />
                </button>
              )}
            </div>
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
              <div className="preview-actions">
                <button className="share-btn" onClick={handleShare} title="Copy shareable link">
                  <Link2 size={14} />
                  <span>Share</span>
                </button>
                <div className="preview-badge">{shareStatus || 'Real-time'}</div>
              </div>
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
