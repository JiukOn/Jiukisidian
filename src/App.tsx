import React, { useCallback } from 'react'
import {
  Tldraw,
  createShapeId,
  HTMLContainer,
  ShapeUtil,
  TLBaseShape,
  useEditor as useTldrawEditor,
  AssetRecordType
} from 'tldraw'
import 'tldraw/tldraw.css'
import { useEditor as useTiptapEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'

type ICustomNode = TLBaseShape<
  'obsidian-note',
  {
    w: number
    h: number
    text: string
  }
>

class ObsidianNoteUtil extends ShapeUtil<ICustomNode> {
  static type = 'obsidian-note' as const

  getDefaultProps(): ICustomNode['props'] {
    return {
      w: 300,
      h: 300,
      text: '## Título\nEscreva sua nota aqui...',
    }
  }

  component(shape: ICustomNode) {
    const isSelected = this.editor.getOnlySelectedShapeId() === shape.id

    const handleUpdate = (newText: string) => {
      this.editor.updateShape({
        id: shape.id,
        type: 'obsidian-note',
        props: { text: newText },
      })
    }

    return (
      <HTMLContainer style={{ pointerEvents: 'all' }}>
        <ObsidianEditor
          initialContent={shape.props.text}
          isSelected={isSelected}
          onUpdate={handleUpdate}
        />
      </HTMLContainer>
    )
  }

  indicator(shape: ICustomNode) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }
}

const ObsidianEditor = ({ initialContent, isSelected, onUpdate }: any) => {
  const editor = useTiptapEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML()) 
    },
    editorProps: {
      attributes: {
        class: 'obsidian-content',
        style: 'height: 100%; overflow-y: auto; color: #e0e0e0;',
      },
    },
  })

  const stopPropagation = (e: React.PointerEvent) => e.stopPropagation()

  if (!editor) return null

  return (
    <div
      onPointerDown={stopPropagation}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1e1e1e', // Cor de fundo do Obsidian Dark
        border: isSelected ? '2px solid #a882ff' : '1px solid #333',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div style={{ padding: '8px 12px', flex: 1, overflow: 'hidden' }}>
        <EditorContent editor={editor} style={{height: '100%'}} />
      </div>
    </div>
  )
}


const ExportPanel = () => {
  const handleExport = useCallback(async (format: 'png' | 'jpg' | 'pdf') => {
    // Hack para pegar o elemento DOM do canvas
    const canvasElement = document.querySelector('.tl-canvas') as HTMLElement
    if (!canvasElement) return

    try {
      if (format === 'pdf') {
        const dataUrl = await toPng(canvasElement, { backgroundColor: '#121212' })
        const pdf = new jsPDF({ orientation: 'landscape' })
        const imgProps = pdf.getImageProperties(dataUrl)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save('meu-canvas.pdf')
      } else {
        const dataUrl = format === 'png' 
          ? await toPng(canvasElement, { backgroundColor: '#121212' }) 
          : await toJpeg(canvasElement, { backgroundColor: '#121212' })
        
        const link = document.createElement('a')
        link.download = `meu-canvas.${format}`
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      console.error('Erro ao exportar:', err)
      alert('Erro ao exportar. Tente dar menos zoom out.')
    }
  }, [])

  return (
    <div style={{
      position: 'absolute', top: 12, right: 60, zIndex: 1000, 
      display: 'flex', gap: '8px', background: '#2d2d2d', padding: '6px', 
      borderRadius: '6px'
    }}>
      <button onClick={() => handleExport('png')}>PNG</button>
      <button onClick={() => handleExport('pdf')}>PDF</button>
    </div>
  )
}

const customShapeUtils = [ObsidianNoteUtil]

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        shapeUtils={customShapeUtils}
        onMount={(editor) => {
          editor.createShape({
            id: createShapeId(),
            type: 'obsidian-note',
            x: 200,
            y: 200,
            props: { text: '<h3>Olá!</h3><p>Este é um card estilo Obsidian.</p>' }
          })
        }}
      >
        <ExportPanel />
      </Tldraw>
    </div>
  )
}