import React, { useRef, useState, useEffect } from 'react'
import { useEditor, track } from 'tldraw'
import { 
    MousePointer2, Hand, Eraser, Pen, Highlighter, 
    StickyNote, Square, Circle, Triangle, Star, Diamond,
    Type, Undo2, Redo2, Trash2, Download, ZoomIn, ZoomOut, 
    Image as ImageIcon, MoveRight, Minus, Wand2,
    Sun, Moon, Monitor, Heart, ChevronDown, Check
} from 'lucide-react'
import { MenuLogic } from './MenuLogic'
import JiukLogo from '../assets/logo.svg'

export const TopCommandBar = track(() => {
    const editor = useEditor()
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [isMainMenuOpen, setMainMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [uiSize, setUiSize] = useState(32)

    const activeTool = editor.getCurrentToolId()

    useEffect(() => {
        MenuLogic.setUiScale(uiSize as any)
    }, [uiSize])

    useEffect(() => {
        const closeMenus = () => {
            setMainMenuOpen(false)
            setActiveDropdown(null)
        }
        document.querySelector('.tl-canvas')?.addEventListener('pointerdown', closeMenus)
        return () => document.querySelector('.tl-canvas')?.removeEventListener('pointerdown', closeMenus)
    }, [])

    const setTool = (id: string) => editor.setCurrentTool(id)

    const MainMenu = () => (
        <div 
            style={{position: 'relative', height: '100%', display: 'flex', alignItems: 'center'}}
            onMouseEnter={() => setMainMenuOpen(true)}
            onMouseLeave={() => setMainMenuOpen(false)}
        >
            <button 
                className={`jiuk-icon-btn ${isMainMenuOpen ? 'active' : ''}`} 
                title="Menu Principal"
                style={{ padding: 4 }}
            >
                <img 
                    src={JiukLogo} 
                    alt="Jiukisidian Logo" 
                    style={{
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        borderRadius: '6px',
                        filter: activeTool === 'select' ? 'none' : 'grayscale(0.5)'
                    }} 
                />
            </button>

            {isMainMenuOpen && (
                <div className="jiuk-dropdown-menu">
                    <div className="jiuk-menu-label">Exportar</div>
                    <button className="jiuk-menu-item" onClick={() => MenuLogic.exportCanvas(editor, 'png')}>
                        <Download size={18} /> PNG
                    </button>
                    <button className="jiuk-menu-item" onClick={() => MenuLogic.exportCanvas(editor, 'pdf')}>
                        <Download size={18} /> PDF
                    </button>
                    <button className="jiuk-menu-item" onClick={() => MenuLogic.exportCanvas(editor, 'json')}>
                        <Download size={18} /> JSON
                    </button>

                    <div className="jiuk-menu-label">Aparência</div>
                    <div style={{display:'flex', padding:'0 12px', gap:4}}>
                        <button className="jiuk-menu-item" style={{justifyContent:'center'}} title="Claro" onClick={() => MenuLogic.setTheme(editor, 'light')}><Sun size={18}/></button>
                        <button className="jiuk-menu-item" style={{justifyContent:'center'}} title="Escuro" onClick={() => MenuLogic.setTheme(editor, 'dark')}><Moon size={18}/></button>
                        <button className="jiuk-menu-item" style={{justifyContent:'center', color:'#a855f7'}} title="Jiuk Mode" onClick={() => MenuLogic.setTheme(editor, 'jiuk')}><Monitor size={18}/></button>
                    </div>

                    <div className="jiuk-menu-label">Tamanho UI</div>
                    <div style={{display:'flex', padding:'0 12px', gap:4}}>
                        <button className={`jiuk-menu-item ${uiSize===24?'active':''}`} style={{justifyContent:'center'}} onClick={() => setUiSize(24)}>P</button>
                        <button className={`jiuk-menu-item ${uiSize===28?'active':''}`} style={{justifyContent:'center'}} onClick={() => setUiSize(28)}>M</button>
                        <button className={`jiuk-menu-item ${uiSize===32?'active':''}`} style={{justifyContent:'center'}} onClick={() => setUiSize(32)}>G</button>
                    </div>

                    <div className="jiuk-separator" style={{width:'100%', height:'1px', margin:'4px 0'}} />
                    
                    <button className="jiuk-menu-item" onClick={() => window.open('https://ko-fi.com/jiuk', '_blank')}>
                        <Heart size={18} color="#fb7185" /> Apoiar o Projeto
                    </button>
                </div>
            )}
        </div>
    )

    const ToolWithDropdown = ({ id, icon, tools }: any) => {
        const isActive = activeTool === id || tools.some((t:any) => t.id === activeTool)
        const currentTool = tools.find((t:any) => t.id === activeTool)
        const displayIcon = currentTool ? currentTool.icon : icon

        return (
            <div 
                style={{position: 'relative', display: 'flex', alignItems: 'center', height: '100%'}}
                onMouseEnter={() => setActiveDropdown(id)}
                onMouseLeave={() => setActiveDropdown(null)}
            >
                <div style={{display: 'flex', height: '100%', alignItems: 'center'}}>
                    <button 
                        className={`jiuk-icon-btn ${isActive ? 'active' : ''}`}
                        style={{ borderRadius: '10px 0 0 10px', paddingRight: 4, width: 'auto', minWidth: 'calc(var(--ui-icon-size) + 12px)', borderRight: 'none' }}
                        onClick={() => setTool(currentTool ? currentTool.id : tools[0].id)}
                        title={id}
                    >
                        {displayIcon}
                    </button>
                    
                    <div 
                        className={`jiuk-icon-btn ${isActive ? 'active' : ''}`}
                        style={{ 
                            width: 20, 
                            borderRadius: '0 10px 10px 0', 
                            borderLeft: 'none', 
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.6
                        }}
                    >
                        <ChevronDown style={{ width: 14, height: 14 }} />
                    </div>
                </div>

                {activeDropdown === id && (
                    <div className="jiuk-dropdown-menu" style={{minWidth: 160}}>
                        {tools.map((t: any) => (
                            <button 
                                key={t.id} 
                                className={`jiuk-menu-item ${activeTool === t.id ? 'active' : ''}`}
                                onClick={() => { setTool(t.id); setActiveDropdown(null) }}
                            >
                                {React.cloneElement(t.icon, { size: 18 })} <span style={{marginLeft: 8}}>{t.label}</span>
                                {activeTool === t.id && <Check size={16} style={{marginLeft: 'auto'}}/>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div style={{
            position: 'absolute',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start'
        }}>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => MenuLogic.handleImageUpload(editor, e.target.files?.[0])} />

            <div className="jiuk-ui-panel">
                <MainMenu />
            </div>

            <div className="jiuk-ui-panel">
                <button className="jiuk-icon-btn" onClick={() => editor.undo()} title="Desfazer"><Undo2 /></button>
                <button className="jiuk-icon-btn" onClick={() => editor.redo()} title="Refazer"><Redo2 /></button>
                <div className="jiuk-separator" />
                <button className="jiuk-icon-btn danger" onClick={() => editor.deleteShapes(editor.getSelectedShapeIds())} title="Deletar"><Trash2 /></button>
            </div>

            <div className="jiuk-ui-panel">
                <button className={`jiuk-icon-btn ${activeTool === 'select' ? 'active' : ''}`} onClick={() => setTool('select')} title="Selecionar (V)"><MousePointer2 /></button>
                <button className={`jiuk-icon-btn ${activeTool === 'hand' ? 'active' : ''}`} onClick={() => setTool('hand')} title="Mover (H)"><Hand /></button>
                <button className={`jiuk-icon-btn ${activeTool === 'laser' ? 'active' : ''}`} onClick={() => setTool('laser')} title="Laser"><Wand2 /></button>
                
                <div className="jiuk-separator" />
                
                <ToolWithDropdown 
                    id="draw-group" 
                    icon={<Pen />} 
                    tools={[
                        {id: 'draw', label: 'Caneta', icon: <Pen />},
                        {id: 'highlight', label: 'Marca-texto', icon: <Highlighter />},
                    ]}
                />

                <button className={`jiuk-icon-btn ${activeTool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')} title="Borracha (E)"><Eraser /></button>
                
                <div className="jiuk-separator" />
                
                <ToolWithDropdown 
                    id="geo-group" 
                    icon={<Square />} 
                    tools={[
                        {id: 'geo', label: 'Retângulo', icon: <Square />},
                        {id: 'ellipse', label: 'Círculo', icon: <Circle />}, 
                        {id: 'triangle', label: 'Triângulo', icon: <Triangle />},
                        {id: 'diamond', label: 'Losango', icon: <Diamond />},
                        {id: 'star', label: 'Estrela', icon: <Star />},
                    ]}
                />

                <button className={`jiuk-icon-btn ${activeTool === 'arrow' ? 'active' : ''}`} onClick={() => setTool('arrow')} title="Seta"><MoveRight /></button>
                <button className={`jiuk-icon-btn ${activeTool === 'line' ? 'active' : ''}`} onClick={() => setTool('line')} title="Linha"><Minus style={{transform: 'rotate(-45deg)'}} /></button>

                <div className="jiuk-separator" />

                <button className={`jiuk-icon-btn ${activeTool === 'text' ? 'active' : ''}`} onClick={() => setTool('text')} title="Texto"><Type /></button>
                <button className={`jiuk-icon-btn ${activeTool === 'note' ? 'active' : ''}`} onClick={() => setTool('note')} title="Post-it"><StickyNote /></button>
                <button className="jiuk-icon-btn" onClick={() => fileInputRef.current?.click()} title="Imagem"><ImageIcon /></button>
                
                <button 
                    className={`jiuk-icon-btn ${editor.getCurrentToolId() === 'obsidian-note' ? 'active' : ''}`}
                    onClick={() => MenuLogic.createJiukNote(editor)}
                    title="Jiukisidian Note"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <circle cx="10" cy="13" r="2" />
                    </svg>
                </button>
            </div>
            
            <div className="jiuk-ui-panel">
                <button className="jiuk-icon-btn" onClick={() => editor.zoomIn()} title="Zoom In"><ZoomIn /></button>
                <button className="jiuk-icon-btn" onClick={() => editor.zoomOut()} title="Zoom Out"><ZoomOut /></button>
            </div>
        </div>
    )
}) 