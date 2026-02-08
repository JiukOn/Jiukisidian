import { useEditor, createShapeId } from 'tldraw'
import { handleExport } from './ExportLogic'

export const CustomToolbar = () => {
	const editor = useEditor()

	const createNote = () => {
		const center = editor.getViewportScreenCenter()
		editor.createShape({
			id: createShapeId(),
			type: 'obsidian-note' as any,
			x: center.x - 175,
			y: center.y - 200,
		})
	}

	return (
		<div style={{
			position: 'absolute',
			top: 20,
			left: '50%',
			transform: 'translateX(-50%)',
			zIndex: 200,
			display: 'flex',
			gap: '12px',
			background: '#1a1a1a',
			padding: '10px 20px',
			borderRadius: '12px',
			border: '1px solid #333',
			boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
		}}>
			<button 
				className="jiuk-btn" 
				onClick={createNote} 
				style={{borderColor: '#8a2be2', color: '#e0e0e0'}}
			>
				+ New Obsidian Note
			</button>
			
			<div style={{width: '1px', background: '#444', margin: '0 10px'}}></div>

			<button className="jiuk-btn" onClick={() => handleExport(editor, 'png')}>PNG</button>
			<button className="jiuk-btn" onClick={() => handleExport(editor, 'pdf')}>PDF</button>
		</div>
	)
}