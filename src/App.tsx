import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import './App.css'

mermaid.initialize({ 
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose'
})

const MermaidComponent = ({ chart }: { chart: string }) => {
  useEffect(() => {
    mermaid.contentLoaded()
  }, [chart])

  return (
    <div className="mermaid">
      {chart}
    </div>
  )
}

function App() {
  const [markdown, setMarkdown] = useState(`# Welcome to README Reader

Paste your markdown content here and see it rendered with full **Mermaid diagram support**!

## Features
- ✅ GitHub Flavored Markdown
- ✅ Mermaid Diagrams
- ✅ Live Preview
- ✅ No Login Required

## Example Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
\`\`\`

Try editing the content on the left!`)

  const renderCodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    
    if (language === 'mermaid') {
      return <MermaidComponent chart={String(children).replace(/\n$/, '')} />
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
        <h1>📖 README Reader</h1>
        <p>Markdown viewer with Mermaid diagram support</p>
      </header>
      
      <div className="main-content">
        <div className="editor-panel">
          <h3>📝 Markdown Input</h3>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Paste your markdown here..."
            className="markdown-input"
          />
        </div>
        
        <div className="preview-panel">
          <h3>👀 Live Preview</h3>
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