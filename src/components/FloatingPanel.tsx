import React, { useRef, useState } from 'react'
import { 
    useEditor, 
    track, 
    DefaultColorStyle, 
    DefaultFillStyle, 
    DefaultSizeStyle, 
    DefaultDashStyle,
    DefaultFontStyle,
    DefaultHorizontalAlignStyle
} from 'tldraw'
import Draggable from 'react-draggable'
import { 
    PaintBucket, Scaling, Palette, GripHorizontal, Minus, Type,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Bold, Italic, Heading1, Heading2, List, Smile
} from 'lucide-react'

export const FloatingPanel = track(() => {
    const editor = useEditor()
    const nodeRef = useRef(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const shapes = editor.getSelectedShapes()
    const hasSelection = shapes.length > 0

    // Modo Jiuk Note (apenas se 1 note estiver selecionado)
    const isNote = shapes.length === 1 && (shapes[0] as any).type === 'obsidian-note'
    
    // Lógica de visualização baseada na seleção
    const showFill = hasSelection && !isNote && shapes.some(s => ['geo', 'draw'].includes((s as any).type))
    const showDash = hasSelection && !isNote && shapes.some(s => ['geo', 'line', 'arrow', 'draw'].includes((s as any).type))
    const showFont = hasSelection && !isNote && shapes.some(s => ['text', 'note', 'geo'].includes((s as any).type))
    const showAlign = hasSelection && !isNote && shapes.some(s => ['text', 'note', 'geo'].includes((s as any).type))

    const dispatchNoteAction = (action: string, value: any = null) => {
        if (!isNote) return
        const event = new CustomEvent('jiuk-editor-action', {
            detail: { id: shapes[0].id, action, value }
        })
        window.dispatchEvent(event)
    }

    const tldrawColors = [
        { name: 'black', hex: '#18181b' },
        { name: 'grey', hex: '#e0e0e0' },
        { name: 'light-violet', hex: '#d8b4fe' },
        { name: 'violet', hex: '#a855f7' },
        { name: 'blue', hex: '#60a5fa' },
        { name: 'light-green', hex: '#4ade80' },
        { name: 'yellow', hex: '#fde047' },
        { name: 'light-red', hex: '#fb7185' },
        { name: 'red', hex: '#dc2626' },
    ]

    const fills = [
        { name: 'none', label: 'Vazio' },
        { name: 'semi', label: 'Semi' },
        { name: 'solid', label: 'Sólido' },
        { name: 'pattern', label: 'Padrão' },
    ]

    const sizes = [
        { name: 's', label: 'P' },
        { name: 'm', label: 'M' },
        { name: 'l', label: 'G' },
        { name: 'xl', label: 'XG' },
    ]

    const dashes = [
        { name: 'draw', label: 'Mão' },
        { name: 'solid', label: 'Reto' },
        { name: 'dashed', label: 'Traço' },
        { name: 'dotted', label: 'Ponto' },
    ]

    const fonts = [
        { name: 'draw', label: 'Draw' },
        { name: 'sans', label: 'Sans' },
        { name: 'serif', label: 'Serif' },
        { name: 'mono', label: 'Mono' },
    ]

    const aligns = [
        { name: 'start', icon: <AlignLeft /> },
        { name: 'middle', icon: <AlignCenter /> },
        { name: 'end', icon: <AlignRight /> },
        { name: 'justify', icon: <AlignJustify /> },
    ]

    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
        '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
        '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
        '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
        '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
        '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦',
        '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
        '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿',
        '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
        '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
        '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
        '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
        '✍️', '💅', '🤳', '💪', '🧠', '🦴', '👀', '👁️', '👄', '💋',
        '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯',
        '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️',
        '🗯️', '💭', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏'
    ]

    const handleStyleChange = (styleObj: any, value: string, e: React.PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (hasSelection) {
            editor.setStyleForSelectedShapes(styleObj, value)
        } else {
            editor.setStyleForNextShapes(styleObj, value)
        }
    }

    // Estilo comum para botões de texto que devem escalar com a UI
    const textBtnStyle = { 
        width: 'auto', 
        padding: '0 8px', 
        fontSize: 'calc(var(--ui-icon-size) * 0.45)', 
        height: 'calc(var(--ui-icon-size) + 4px)',
        minHeight: '24px' 
    }

    return (
        <Draggable nodeRef={nodeRef} handle=".drag-handle" defaultPosition={{ x: 50, y: window.innerHeight - 450 }}>
            <div ref={nodeRef} className="jiuk-ui-panel" style={{ 
                position: 'absolute', 
                zIndex: 400, 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                minWidth: '260px',
            }}>
                <div className="drag-handle" style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    cursor: 'grab',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                    marginBottom: '4px',
                    color: 'var(--text-muted)'
                }}>
                    <GripHorizontal />
                </div>

                {/* --- SEÇÃO DE CORES (SEMPRE VISÍVEL) --- */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
                    <Palette style={{ marginTop: 6, color: 'var(--text-muted)', flexShrink: 0, width: 'var(--ui-icon-size)', height: 'var(--ui-icon-size)' }} />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {tldrawColors.map((c) => (
                            <button
                                key={c.name}
                                onPointerDown={(e) => {
                                    if (isNote) {
                                        e.preventDefault()
                                        dispatchNoteAction('color', c.hex)
                                    } else {
                                        handleStyleChange(DefaultColorStyle, c.name, e)
                                    }
                                }}
                                title={c.name}
                                style={{
                                    width: 'calc(var(--ui-icon-size) - 4px)',
                                    height: 'calc(var(--ui-icon-size) - 4px)',
                                    borderRadius: '50%',
                                    background: c.hex,
                                    border: '2px solid var(--border)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'transform 0.1s'
                                }}
                            />
                        ))}
                        {isNote && (
                             <div style={{
                                 position:'relative', 
                                 width: 'calc(var(--ui-icon-size) - 4px)', 
                                 height: 'calc(var(--ui-icon-size) - 4px)', 
                                 overflow:'hidden', 
                                 borderRadius:'50%', 
                                 border:'2px solid var(--border)', 
                                 display:'flex', 
                                 alignItems:'center', 
                                 justifyContent:'center', 
                                 background:'conic-gradient(red, yellow, green, cyan, blue, magenta, red)'
                             }}>
                                <input 
                                    type="color" 
                                    onChange={(e) => dispatchNoteAction('color', e.target.value)}
                                    style={{position:'absolute', opacity:0, width:'100%', height:'100%', cursor:'pointer'}}
                                />
                             </div>
                        )}
                    </div>
                </div>

                {/* --- SEÇÃO JIUK NOTE (Contextual) --- */}
                {isNote && (
                    <>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                            <Type style={{ color: 'var(--text-muted)', flexShrink: 0, width: 'var(--ui-icon-size)' }} />
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="jiuk-icon-btn" onClick={() => dispatchNoteAction('h1')} title="Título 1"><Heading1 /></button>
                                <button className="jiuk-icon-btn" onClick={() => dispatchNoteAction('h2')} title="Título 2"><Heading2 /></button>
                                <div className="jiuk-separator" />
                                <button className="jiuk-icon-btn" onClick={() => dispatchNoteAction('bold')} title="Negrito"><Bold /></button>
                                <button className="jiuk-icon-btn" onClick={() => dispatchNoteAction('italic')} title="Itálico"><Italic /></button>
                                <div className="jiuk-separator" />
                                <button className="jiuk-icon-btn" onClick={() => dispatchNoteAction('list')} title="Lista"><List /></button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                            <AlignLeft style={{ color: 'var(--text-muted)', flexShrink: 0, width: 'var(--ui-icon-size)' }} />
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="jiuk-icon-btn" onClick={() => dispatchNoteAction('align', 'left')}><AlignLeft /></button>
                                <button className="jiuk-icon-btn" onClick={() => dispatchNoteAction('align', 'center')}><AlignCenter /></button>
                                <button className="jiuk-icon-btn" onClick={() => dispatchNoteAction('align', 'right')}><AlignRight /></button>
                                <div className="jiuk-separator" />
                                
                                <div style={{position: 'relative'}}>
                                    <button 
                                        className={`jiuk-icon-btn ${showEmojiPicker ? 'active' : ''}`}
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        <Smile />
                                    </button>
                                    
                                    {showEmojiPicker && (
                                        <div className="jiuk-ui-panel" style={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            left: '-40px',
                                            marginBottom: '8px',
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(5, 1fr)',
                                            gap: '4px',
                                            width: '280px',
                                            maxHeight: '260px',
                                            overflowY: 'auto',
                                            zIndex: 500,
                                            padding: '8px',
                                            backgroundColor: 'var(--bg-surface)',
                                            border: '1px solid var(--border)',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                        }}>
                                            {emojis.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    className="jiuk-icon-btn"
                                                    style={{ width: '100%', height: 'auto', fontSize: '24px', aspectRatio: '1/1' }}
                                                    onClick={() => {
                                                        dispatchNoteAction('emoji', emoji)
                                                        setShowEmojiPicker(false)
                                                    }}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* --- SEÇÕES PADRÃO (Contextual) --- */}
                {showFill && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                        <PaintBucket style={{ color: 'var(--text-muted)', flexShrink: 0, width: 'var(--ui-icon-size)' }} />
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {fills.map((f) => (
                                <button
                                    key={f.name}
                                    onPointerDown={(e) => handleStyleChange(DefaultFillStyle, f.name, e)}
                                    className="jiuk-icon-btn"
                                    style={textBtnStyle}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {showAlign && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                        <AlignLeft style={{ color: 'var(--text-muted)', flexShrink: 0, width: 'var(--ui-icon-size)' }} />
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {aligns.map((a) => (
                                <button
                                    key={a.name}
                                    onPointerDown={(e) => handleStyleChange(DefaultHorizontalAlignStyle, a.name, e)}
                                    className="jiuk-icon-btn"
                                >
                                    {a.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {showDash && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                        <Minus style={{ color: 'var(--text-muted)', flexShrink: 0, width: 'var(--ui-icon-size)' }} />
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {dashes.map((d) => (
                                <button
                                    key={d.name}
                                    onPointerDown={(e) => handleStyleChange(DefaultDashStyle, d.name, e)}
                                    className="jiuk-icon-btn"
                                    style={textBtnStyle}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!isNote && hasSelection && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                        <Scaling style={{ color: 'var(--text-muted)', flexShrink: 0, width: 'var(--ui-icon-size)' }} />
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {sizes.map((s) => (
                                <button
                                    key={s.name}
                                    onPointerDown={(e) => handleStyleChange(DefaultSizeStyle, s.name, e)}
                                    className="jiuk-icon-btn"
                                    style={textBtnStyle}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {showFont && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                        <Type style={{ color: 'var(--text-muted)', flexShrink: 0, width: 'var(--ui-icon-size)' }} />
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {fonts.map((ft) => (
                                <button
                                    key={ft.name}
                                    onPointerDown={(e) => handleStyleChange(DefaultFontStyle, ft.name, e)}
                                    className="jiuk-icon-btn"
                                    style={textBtnStyle}
                                >
                                    {ft.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Draggable>
    )
})