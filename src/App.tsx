import React from 'react'
import { Tldraw, type TldrawOptions } from 'tldraw'
import 'tldraw/tldraw.css'
import './theme/jiukisidian.css'
import { JiukisidianNoteUtil } from './components/JiukisidianShape'
import { TopCommandBar } from './components/UiComponents'
import { FloatingPanel } from './components/FloatingPanel'
import { Trash2, RefreshCcw } from 'lucide-react'

const customShapeUtils = [JiukisidianNoteUtil]

const components = {
    Toolbar: null,
    MainMenu: null,
    DebugMenu: null,
    PageMenu: null,
    HelpMenu: null,
    NavigationPanel: null,
    SharePanel: null,
    Minimap: null,
    StylePanel: null,
    QuickActions: null,
    ZoomMenu: null,
}

const options: Partial<TldrawOptions> = {
    maxPages: 20,
}

class JiukErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    handleHardReset = () => {
        localStorage.removeItem('jiukisidian-pro-v1')
        localStorage.removeItem('jiukisidian-v2')
        localStorage.clear()
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: '#09090b',
                    color: '#f4f4f5',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    gap: '24px',
                    zIndex: 9999
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#fb7185' }}>
                            Reinicialização Necessária
                        </h2>
                        <p style={{ color: '#a1a1aa', maxWidth: '400px', lineHeight: '1.5' }}>
                            Detectamos um conflito com dados antigos salvos no navegador.
                            Por favor, limpe os dados para continuar.
                        </p>
                    </div>

                    <button 
                        onClick={this.handleHardReset}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 24px',
                            background: '#a855f7',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px',
                            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)'
                        }}
                    >
                        <Trash2 size={20} />
                        Limpar Dados e Reiniciar
                    </button>
                    
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            background: 'transparent',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#a1a1aa',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        <RefreshCcw size={16} />
                        Tentar Recarregar
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default function App() {
    return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
            <JiukErrorBoundary>
                <Tldraw 
                    persistenceKey="jiukisidian-v2"
                    shapeUtils={customShapeUtils}
                    components={components as any}
                    options={options}
                    hideUi={false}
                >
                    <TopCommandBar />
                    <FloatingPanel />
                </Tldraw>
            </JiukErrorBoundary>
        </div>
    )
}