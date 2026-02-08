import React from 'react'
import { Tldraw, type TldrawOptions } from 'tldraw'
import 'tldraw/tldraw.css'
import './theme/jiukisidian.css'
import { JiukisidianNoteUtil } from './components/JiukisidianShape'
import { TopCommandBar } from './components/UiComponents'
import { FloatingPanel } from './components/FloatingPanel'
import { Trash2, RefreshCcw, AlertTriangle } from 'lucide-react'

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
    { hasError: boolean; error: Error | null; errorInfo: any }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("Jiukisidian Crash:", error, errorInfo)
        this.setState({ errorInfo })
    }

    handleHardReset = () => {
        localStorage.clear()
        sessionStorage.clear()
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
                    zIndex: 9999,
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ maxWidth: '600px', background: '#18181b', padding: '32px', borderRadius: '16px', border: '1px solid #27272a' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                            <AlertTriangle size={48} color="#ef4444" />
                        </div>
                        
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#f4f4f5' }}>
                            Ocorreu um erro na renderização
                        </h2>

                        {/* EXIBINDO O ERRO REAL PARA DIAGNÓSTICO */}
                        <div style={{ 
                            background: '#27272a', 
                            padding: '12px', 
                            borderRadius: '8px', 
                            color: '#fb7185', 
                            fontFamily: 'monospace', 
                            fontSize: '12px', 
                            textAlign: 'left',
                            marginBottom: '24px',
                            overflowX: 'auto',
                            maxHeight: '150px'
                        }}>
                            {this.state.error?.toString() || "Erro desconhecido"}
                            <br/>
                            {this.state.errorInfo?.componentStack?.slice(0, 200)}...
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button 
                                onClick={this.handleHardReset}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    background: '#ef4444',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                            >
                                <Trash2 size={18} /> Reseta Tudo (Hard)
                            </button>
                            
                            <button 
                                onClick={() => window.location.reload()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    background: '#3f3f46',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                            >
                                <RefreshCcw size={18} /> Recarregar
                            </button>
                        </div>
                    </div>
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
                    persistenceKey="jiukisidian-v3-debug"
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