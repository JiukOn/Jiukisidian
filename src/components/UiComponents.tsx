import React, { useRef, useState, useEffect } from 'react'
import { useEditor, useValue, track } from 'tldraw'
import { 
    MousePointer2, Hand, Eraser, Pen, Highlighter, 
    StickyNote, Square, Circle, Triangle, Star, Diamond,
    Type, Undo2, Redo2, Trash2, Download, ZoomIn, ZoomOut, 
    Image as ImageIcon, MoveRight, Minus, Wand2,
    Sun, Moon, Monitor, Heart, RotateCcw, RotateCw
} from 'lucide-react'
import { MenuLogic } from '../utils/MenuLogic'
import JiukLogo from '../assets/logo.svg'

const ToolbarItem = ({ 
    active, 
    onClick, 
    children, 
    title, 
    dropdownContent,
    onDropdownSelect 
}: { 
    active?: boolean; 
    onClick?: () => void; 
    children: React.ReactNode; 
    title: string;
    dropdownContent?: React.ReactNode;
    onDropdownSelect?: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const timeoutRef = useRef<any>(null)

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (dropdownContent) setIsOpen(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false)
        }, 200) 
    }

    return (
        <div 
            style={{position: 'relative', height: '100%', display: 'flex', alignItems: 'center'}} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`jiuk-icon-btn ${active ? 'active' : ''}`}
                onClick={onClick}
                title={title}
            >
                {children}
            </button>

            {isOpen && dropdownContent && (
                <div 
                    className="jiuk-dropdown-menu"
                    style={{
                        position: 'absolute',
                        top: '115%', 
                        left: '50%',
                        transform: 'translateX(-50%)',
                        minWidth: 'max-content',
                        zIndex: 400
                    }}
                    onClick={() => {
                        if(onDropdownSelect) setIsOpen(false) 
                    }}
                >
                    <div style={{position:'absolute', top:'-15px', left:0, right:0, height:'15px'}} />
                    {dropdownContent}
                </div>
            )}
        </div>
    )
}

export const TopCommandBar = track(() => {
    const editor = useEditor()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uiSize, setUiSize] = useState(32)
    const [lastGeoShape, setLastGeoShape] = useState<string>('rectangle')

    const currentToolId = useValue('tool', () => editor.getCurrentToolId(), [editor])
    
    useEffect(() => {
        MenuLogic.setUiScale(uiSize as any)
    }, [uiSize])

    const setTool = (id: string) => editor.setCurrentTool(id)
    
    const setGeoShape = (geo: 'rectangle' | 'ellipse' | 'triangle' | 'diamond' | 'star') => {
        setLastGeoShape(geo)
        editor.setCurrentTool('geo')
        
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length > 0) {
            editor.updateShapes(selectedIds.map(id => ({
                id,
                type: 'geo',
                props: { geo }
            } as any)))
        }
    }

    const getGeoIcon = () => {
        switch(lastGeoShape) {
            case 'ellipse': return <Circle size={20} />
            case 'triangle': return <Triangle size={20} />
            case 'diamond': return <Diamond size={20} />
            case 'star': return <Star size={20} />
            default: return <Square size={20} />
        }
    }

    return (
        <div style={{
            position: 'absolute',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
        }}>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => MenuLogic.handleImageUpload(editor, e.target.files?.[0])} />

            <div className="jiuk-ui-panel">
                <ToolbarItem title="Menu Principal" dropdownContent={
                    <>
                        <div className="jiuk-menu-label">Exportar</div>
                        <button className="jiuk-menu-item" onClick={() => MenuLogic.exportCanvas(editor, 'png')}><Download size={18} /> PNG</button>
                        <button className="jiuk-menu-item" onClick={() => MenuLogic.exportCanvas(editor, 'pdf')}><Download size={18} /> PDF</button>
                        <button className="jiuk-menu-item" onClick={() => MenuLogic.exportCanvas(editor, 'json')}><Download size={18} /> JSON</button>
                        
                        <div className="jiuk-menu-label">Aparência</div>
                        <div style={{display:'flex', padding:'0 12px', gap:4}}>
                            <button className="jiuk-menu-item" style={{justifyContent:'center'}} onClick={() => MenuLogic.setTheme(editor, 'light')}><Sun size={18}/></button>
                            <button className="jiuk-menu-item" style={{justifyContent:'center'}} onClick={() => MenuLogic.setTheme(editor, 'dark')}><Moon size={18}/></button>
                            <button className="jiuk-menu-item" style={{justifyContent:'center', color:'#a855f7'}} onClick={() => MenuLogic.setTheme(editor, 'jiuk')}><Monitor size={18}/></button>
                        </div>

                        <div className="jiuk-menu-label">Tamanho UI</div>
                        <div style={{display:'flex', padding:'0 12px', gap:4}}>
                            <button className={`jiuk-menu-item ${uiSize===24?'active':''}`} style={{justifyContent:'center'}} onClick={() => setUiSize(24)}>P</button>
                            <button className={`jiuk-menu-item ${uiSize===28?'active':''}`} style={{justifyContent:'center'}} onClick={() => setUiSize(28)}>M</button>
                            <button className={`jiuk-menu-item ${uiSize===32?'active':''}`} style={{justifyContent:'center'}} onClick={() => setUiSize(32)}>G</button>
                        </div>
                        
                        <div className="jiuk-separator" style={{margin: '4px 0'}}/>
                        <button className="jiuk-menu-item" onClick={() => window.open('https://ko-fi.com/jiuk', '_blank')}>
                            <Heart size={18} color="#fb7185" /> Apoiar o Projeto
                        </button>
                    </>
                }>
                    <img src={JiukLogo} alt="Logo" style={{width: 24, height: 24, objectFit: 'contain'}} />
                </ToolbarItem>
            </div>

            <div className="jiuk-ui-panel">
                <ToolbarItem onClick={() => editor.undo()} title="Desfazer"><Undo2 size={20}/></ToolbarItem>
                <ToolbarItem onClick={() => editor.redo()} title="Refazer"><Redo2 size={20}/></ToolbarItem>
                <div className="jiuk-separator" />
                <ToolbarItem onClick={() => MenuLogic.rotateSelection(editor, -90)} title="Girar Esq."><RotateCcw size={20}/></ToolbarItem>
                <ToolbarItem onClick={() => MenuLogic.rotateSelection(editor, 90)} title="Girar Dir."><RotateCw size={20}/></ToolbarItem>
                <div className="jiuk-separator" />
                <ToolbarItem onClick={() => editor.deleteShapes(editor.getSelectedShapeIds())} title="Deletar" active={false}>
                    <Trash2 size={20} color="#ef4444" />
                </ToolbarItem>
            </div>

            <div className="jiuk-ui-panel">
                <ToolbarItem active={currentToolId === 'select'} onClick={() => setTool('select')} title="Selecionar (V)"><MousePointer2 size={20}/></ToolbarItem>
                <ToolbarItem active={currentToolId === 'hand'} onClick={() => setTool('hand')} title="Mover (H)"><Hand size={20}/></ToolbarItem>
                
                <div className="jiuk-separator" />
                
                <ToolbarItem 
                    active={currentToolId === 'draw' || currentToolId === 'highlight' || currentToolId === 'laser'} 
                    onClick={() => setTool('draw')} 
                    title="Desenho"
                    dropdownContent={
                        <>
                            <button className={`jiuk-menu-item ${currentToolId === 'draw' ? 'active' : ''}`} onClick={() => setTool('draw')}><Pen size={18}/> Caneta</button>
                            <button className={`jiuk-menu-item ${currentToolId === 'highlight' ? 'active' : ''}`} onClick={() => setTool('highlight')}><Highlighter size={18}/> Marca-texto</button>
                            <button className={`jiuk-menu-item ${currentToolId === 'laser' ? 'active' : ''}`} onClick={() => setTool('laser')}><Wand2 size={18}/> Laser</button>
                        </>
                    }
                >
                    {currentToolId === 'highlight' ? <Highlighter size={20}/> : currentToolId === 'laser' ? <Wand2 size={20}/> : <Pen size={20}/>}
                </ToolbarItem>

                <ToolbarItem active={currentToolId === 'eraser'} onClick={() => setTool('eraser')} title="Borracha (E)"><Eraser size={20}/></ToolbarItem>
                
                <div className="jiuk-separator" />
                
                <ToolbarItem 
                    active={currentToolId === 'geo'}
                    onClick={() => setTool('geo')} 
                    title="Formas"
                    dropdownContent={
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 4, padding: 4}}>
                            <button className={`jiuk-icon-btn ${lastGeoShape==='rectangle'?'active':''}`} onClick={() => setGeoShape('rectangle')}><Square size={18}/></button>
                            <button className={`jiuk-icon-btn ${lastGeoShape==='ellipse'?'active':''}`} onClick={() => setGeoShape('ellipse')}><Circle size={18}/></button>
                            <button className={`jiuk-icon-btn ${lastGeoShape==='triangle'?'active':''}`} onClick={() => setGeoShape('triangle')}><Triangle size={18}/></button>
                            <button className={`jiuk-icon-btn ${lastGeoShape==='diamond'?'active':''}`} onClick={() => setGeoShape('diamond')}><Diamond size={18}/></button>
                            <button className={`jiuk-icon-btn ${lastGeoShape==='star'?'active':''}`} onClick={() => setGeoShape('star')}><Star size={18}/></button>
                        </div>
                    }
                >
                    {getGeoIcon()}
                </ToolbarItem>

                <ToolbarItem active={currentToolId === 'arrow'} onClick={() => setTool('arrow')} title="Seta"><MoveRight size={20}/></ToolbarItem>
                <ToolbarItem active={currentToolId === 'line'} onClick={() => setTool('line')} title="Linha"><Minus size={20} style={{transform: 'rotate(-45deg)'}}/></ToolbarItem>

                <div className="jiuk-separator" />

                <ToolbarItem active={currentToolId === 'text'} onClick={() => setTool('text')} title="Texto"><Type size={20}/></ToolbarItem>
                <ToolbarItem active={currentToolId === 'note'} onClick={() => setTool('note')} title="Post-it"><StickyNote size={20}/></ToolbarItem>
                <ToolbarItem onClick={() => fileInputRef.current?.click()} title="Imagem"><ImageIcon size={20}/></ToolbarItem>
                
                <ToolbarItem 
                    active={currentToolId === 'obsidian-note'}
                    onClick={() => MenuLogic.createJiukNote(editor)}
                    title="Jiuk Note"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <circle cx="10" cy="13" r="2" />
                    </svg>
                </ToolbarItem>
            </div>
            
            <div className="jiuk-ui-panel">
                <ToolbarItem onClick={() => editor.zoomIn()} title="Zoom In"><ZoomIn size={20}/></ToolbarItem>
                <ToolbarItem onClick={() => editor.zoomOut()} title="Zoom Out"><ZoomOut size={20}/></ToolbarItem>
            </div>
        </div>
    )
})