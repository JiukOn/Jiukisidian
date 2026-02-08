import { useEffect, useCallback } from 'react'
import { HTMLContainer, ShapeUtil, Rectangle2d, useEditor } from 'tldraw'
import { useEditor as useTiptap, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'

export class JiukisidianNoteUtil extends ShapeUtil<any> {
    static override type = 'obsidian-note' as const

    override canResize = () => true

    override getDefaultProps() {
        return { 
            w: 350, 
            h: 400, 
            text: '<h2>Novo Card</h2><p>Digite aqui...</p>' 
        }
    }

    override getGeometry(shape: any) {
        return new Rectangle2d({
            width: shape.props.w,
            height: shape.props.h,
            isFilled: true,
        })
    }

    override onResize(_shape: any, info: any) {
        return {
            props: {
                w: Math.max(200, info.initialShape.props.w * info.scaleX),
                h: Math.max(150, info.initialShape.props.h * info.scaleY),
            },
        }
    }

    override component(shape: any) {
        return (
            <HTMLContainer style={{ pointerEvents: 'all' }}>
                <ObsidianCard 
                    id={shape.id}
                    text={shape.props.text} 
                />
            </HTMLContainer>
        )
    }

    override indicator(shape: any) {
        return <rect width={shape.props.w} height={shape.props.h} />
    }
}

const ObsidianCard = ({ id, text }: any) => {
    const editorApp = useEditor()

    const handleUpdate = useCallback((newText: string) => {
        editorApp.updateShape({
            id: id,
            type: 'obsidian-note',
            props: { text: newText },
        })
    }, [editorApp, id])

    const editor = useTiptap({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            TextAlign.configure({ types: ['heading', 'paragraph'] })
        ],
        content: text,
        onUpdate: ({ editor }) => handleUpdate(editor.getHTML()),
        editorProps: {
            attributes: {
                class: 'prose prose-invert',
                style: 'height: 100%; color: #f4f4f5; outline: none; font-family: Inter, sans-serif; line-height: 1.6;'
            }
        }
    })

    useEffect(() => {
        if (!editor) return

        const handleCommand = (e: any) => {
            if (e.detail.id !== id) return

            const { action, value } = e.detail
            const chain = editor.chain().focus()
            
            switch(action) {
                case 'bold': chain.toggleBold().run(); break;
                case 'italic': chain.toggleItalic().run(); break;
                case 'h1': chain.toggleHeading({ level: 1 }).run(); break;
                case 'h2': chain.toggleHeading({ level: 2 }).run(); break;
                case 'list': chain.toggleBulletList().run(); break;
                case 'align': (chain as any).setTextAlign(value).run(); break;
                case 'color': (chain as any).setColor(value).run(); break;
                case 'emoji': chain.insertContent(value).run(); break;
            }
        }

        window.addEventListener('jiuk-editor-action', handleCommand)
        return () => window.removeEventListener('jiuk-editor-action', handleCommand)
    }, [editor, id])

    if (!editor) return null

    return (
        <div className="obsidian-card" style={{ width: '100%', height: '100%' }}>
            <div className="obsidian-header">
                <div className="circle-btn" style={{background:'#a855f7', boxShadow: '0 0 8px rgba(168, 85, 247, 0.4)'}}></div>
                <div className="circle-btn" style={{background:'#fb7185'}}></div>
                <div className="circle-btn" style={{background:'#fde047'}}></div>
                <span style={{
                    marginLeft:'8px', 
                    fontSize:'12px', 
                    color:'#a1a1aa', 
                    fontWeight: 600,
                    letterSpacing: '0.02em'
                }}>
                    Jiukisidian Note
                </span>
            </div>
            
            <div 
                style={{ flex: 1, padding: '16px', overflowY: 'auto', cursor: 'text' }}
                onPointerDown={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => e.stopPropagation()}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}