import { Editor } from 'tldraw'
import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'

export const handleExport = async (editor: Editor, format: 'png' | 'jpg' | 'pdf') => {
	const canvasElement = document.querySelector('.tl-canvas') as HTMLElement
	if (!canvasElement) return

	const selectedIds = editor.getSelectedShapeIds()
	editor.selectNone()

	await new Promise(resolve => setTimeout(resolve, 100))

	try {
		const options = { backgroundColor: '#121212', quality: 0.95 }
		
		if (format === 'pdf') {
			const dataUrl = await toPng(canvasElement, options)
			const pdf = new jsPDF({ orientation: 'landscape' })
			const imgProps = pdf.getImageProperties(dataUrl)
			const pdfWidth = pdf.internal.pageSize.getWidth()
			const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
			pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
			pdf.save('jiukisidian-board.pdf')
		} else {
			const dataUrl = format === 'png' 
				? await toPng(canvasElement, options)
				: await toJpeg(canvasElement, options)
			
			const link = document.createElement('a')
			link.download = `jiukisidian.${format}`
			link.href = dataUrl
			link.click()
		}
	} catch (err) {
		console.error(err)
	} finally {
		if (selectedIds.length > 0) {
			editor.select(...selectedIds)
		}
	}
}