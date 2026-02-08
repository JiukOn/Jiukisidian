import React, { useState, useEffect, useMemo } from 'react'
import { 
    Tldraw, 
    type TldrawOptions, 
    useEditor, 
    type TLPageId, 
    type TLPage 
} from 'tldraw'
import 'tldraw/tldraw.css'
import './theme/jiukisidian.css'
import { JiukisidianNoteUtil } from './components/JiukisidianShape'
import { TopCommandBar } from './components/UiComponents'
import { FloatingPanel } from './components/FloatingPanel'
import { ProjectManager } from './components/ProjectManager'
import { saveProjectToFile, loadProjectFromFile, SAVE_FILE_EXTENSION } from './utils/fileSystem'
import { Loader2, Folder, FileUp, FileDown, Plus, Layers, AlertTriangle, RefreshCcw, Trash2, Pencil, Check, X } from 'lucide-react'

const customShapeUtils = [JiukisidianNoteUtil]

const ProjectControls = ({ onOpenProjectManager }: { onOpenProjectManager: () => void }) => {
    const editor = useEditor()
    const [pages, setPages] = useState<TLPage[]>([])
    const [currentPageId, setCurrentPageId] = useState<TLPageId>('' as TLPageId)
    const [editingId, setEditingId] = useState<TLPageId | null>(null)
    const [editName, setEditName] = useState('')

    useEffect(() => {
        const updatePages = () => {
            setPages(editor.getPages())
            setCurrentPageId(editor.getCurrentPageId())
        }
        
        const removeListener = editor.store.listen(updatePages, { scope: 'all' })
        updatePages()
        
        return () => removeListener()
    }, [editor])

    const handleCreatePage = () => {
        editor.createPage({ name: 'Nova Página' })
    }

    const handleDeletePage = (id: TLPageId, e: React.MouseEvent) => {
        e.stopPropagation()
        if (pages.length > 1) {
            editor.deletePage(id)
        }
    }

    const startRenaming = (page: TLPage, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingId(page.id)
        setEditName(page.name)
    }

    const cancelRenaming = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setEditingId(null)
        setEditName('')
    }

    const confirmRenaming = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (editingId && editName.trim() !== '') {
            editor.renamePage(editingId, editName)
        }
        setEditingId(null)
        setEditName('')
    }

    const handleSaveFile = () => {
        saveProjectToFile(editor, 'Meu Projeto Jiukisidian')
    }

    const handleLoadFile = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = SAVE_FILE_EXTENSION
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                await loadProjectFromFile(file, editor)
            }
        }
        input.click()
    }

    return (
        <div style={{
            position: 'absolute', top: 24, right: 24, zIndex: 300,
            display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end'
        }}>
            <div className="jiuk-ui-panel" style={{flexDirection: 'row', display: 'flex', gap: '8px', padding: '8px', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a'}}>
                <button className="jiuk-icon-btn" onClick={onOpenProjectManager} title="Gerenciar Projetos" style={{background: 'none', border: 'none', color: '#f4f4f5', cursor: 'pointer'}}>
                    <Folder size={20} />
                </button>
                <div style={{width: '1px', background: '#27272a', margin: '0 4px'}} />
                <button className="jiuk-icon-btn" onClick={handleSaveFile} title="Salvar .jiukisidian" style={{background: 'none', border: 'none', color: '#f4f4f5', cursor: 'pointer'}}>
                    <FileDown size={20} />
                </button>
                <button className="jiuk-icon-btn" onClick={handleLoadFile} title="Abrir .jiukisidian" style={{background: 'none', border: 'none', color: '#f4f4f5', cursor: 'pointer'}}>
                    <FileUp size={20} />
                </button>
            </div>

            <div className="jiuk-ui-panel" style={{flexDirection: 'column', alignItems: 'stretch', minWidth: '180px', display: 'flex', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden'}}>
                <div style={{
                    padding: '8px 12px', borderBottom: '1px solid #27272a', 
                    color: '#a1a1aa', fontSize: '11px', fontWeight: 700,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    letterSpacing: '0.05em'
                }}>
                    <span style={{display:'flex', gap:6, alignItems:'center'}}><Layers size={14}/> PÁGINAS</span>
                    <button 
                        onClick={handleCreatePage}
                        style={{background:'none', border:'none', color:'#a855f7', cursor:'pointer', padding: 0}}
                        title="Nova Página"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <div style={{maxHeight: '300px', overflowY: 'auto', padding: '4px'}}>
                    {pages.map((page) => (
                        <div
                            key={page.id}
                            onClick={() => {
                                if (editingId !== page.id) editor.setCurrentPage(page.id)
                            }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: '0.2s',
                                background: page.id === currentPageId ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                                color: page.id === currentPageId ? '#d8b4fe' : '#d4d4d8',
                                border: page.id === currentPageId ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid transparent'
                            }}
                        >
                            {editingId === page.id ? (
                                <div style={{display: 'flex', alignItems: 'center', gap: 4, width: '100%'}}>
                                    <input 
                                        autoFocus
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') confirmRenaming()
                                            if (e.key === 'Escape') cancelRenaming()
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            background: '#27272a', border: '1px solid #a855f7', 
                                            color: 'white', borderRadius: '4px', padding: '2px 4px',
                                            width: '100%', fontSize: '12px', outline: 'none'
                                        }}
                                    />
                                    <button onClick={confirmRenaming} style={{background:'none', border:'none', color:'#22c55e', cursor:'pointer', padding:0}}><Check size={14}/></button>
                                    <button onClick={cancelRenaming} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', padding:0}}><X size={14}/></button>
                                </div>
                            ) : (
                                <>
                                    <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                        {page.name}
                                    </span>
                                    <div style={{display: 'flex', gap: 4, opacity: page.id === currentPageId ? 1 : 0.4}}>
                                        <button 
                                            onClick={(e) => startRenaming(page, e)}
                                            style={{background:'none', border:'none', color: 'inherit', cursor:'pointer', padding: 2}}
                                            title="Renomear"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                        {pages.length > 1 && (
                                            <button 
                                                onClick={(e) => handleDeletePage(page.id, e)}
                                                style={{background:'none', border:'none', color: 'inherit', cursor:'pointer', padding: 2}}
                                                title="Deletar"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const options: Partial<TldrawOptions> = { maxPages: 50 }

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
        console.error(error)
        this.setState({ error, errorInfo })
    }

    handleHardReset = () => {
        localStorage.clear()
        sessionStorage.clear()
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{position: 'fixed', inset: 0, backgroundColor: '#09090b', color: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999}}>
                    <div style={{ maxWidth: '500px', background: '#18181b', padding: '32px', borderRadius: '16px', border: '1px solid #27272a', textAlign: 'center' }}>
                        <AlertTriangle size={48} color="#ef4444" style={{marginBottom: '16px'}} />
                        <h2 style={{fontSize: '20px', marginBottom: '8px'}}>Erro de Sistema Detectado</h2>
                        <p style={{fontSize: '12px', color: '#fb7185', fontFamily: 'monospace', marginBottom: '20px', wordBreak: 'break-all'}}>
                            {this.state.error?.message || "Erro desconhecido"}
                        </p>
                        <div style={{display:'flex', gap: 10, justifyContent: 'center'}}>
                            <button onClick={this.handleHardReset} style={{display:'flex', alignItems:'center', gap: 8, padding: '10px 20px', background: '#ef4444', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer'}}>
                                <Trash2 size={16}/> Limpar Dados Corrompidos
                            </button>
                            <button onClick={() => window.location.reload()} style={{display:'flex', alignItems:'center', gap: 8, padding: '10px 20px', background: '#3f3f46', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer'}}>
                                <RefreshCcw size={16}/> Tentar Recarregar
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
    const [currentProjectId, setCurrentProjectId] = useState<string>('default')
    const [isProjectManagerOpen, setProjectManagerOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const lastId = localStorage.getItem('jiukisidian-last-project-id')
        if (lastId) setCurrentProjectId(lastId)
    }, [])

    const handleSwitchProject = (newProjectId: string) => {
        setIsLoading(true)
        setProjectManagerOpen(false)
        setTimeout(() => {
            localStorage.setItem('jiukisidian-last-project-id', newProjectId)
            setCurrentProjectId(newProjectId)
            setIsLoading(false)
        }, 500)
    }

    const tldrawComponents = useMemo(() => ({
        Toolbar: null, MainMenu: null, PageMenu: null,
        HelpMenu: null, DebugMenu: null, NavigationPanel: null
    }), [])

    return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#09090b' }}>
            <JiukErrorBoundary>
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a855f7', gap: 16 }}>
                        <Loader2 size={48} className="animate-spin" />
                        <span style={{fontFamily: 'Inter', color: '#f4f4f5'}}>Carregando Projeto...</span>
                        <style>{`@keyframes animate-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: animate-spin 1s linear infinite; }`}</style>
                    </div>
                ) : (
                    <Tldraw 
                        persistenceKey={`jiukisidian-v10-clean-${currentProjectId}`}
                        shapeUtils={customShapeUtils}
                        options={options}
                        hideUi={false}
                        components={tldrawComponents}
                    >
                        <TopCommandBar />
                        <FloatingPanel />
                        <ProjectControls onOpenProjectManager={() => setProjectManagerOpen(true)} />
                    </Tldraw>
                )}
                {isProjectManagerOpen && (
                    <ProjectManager 
                        currentProjectId={currentProjectId}
                        onSelectProject={handleSwitchProject}
                        onClose={() => setProjectManagerOpen(false)}
                    />
                )}
            </JiukErrorBoundary>
        </div>
    )
}