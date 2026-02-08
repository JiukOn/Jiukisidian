import { 
    Editor, 
    createShapeId, 
    AssetRecordType,
} from 'tldraw'

export type ExportType = 'png' | 'jpg' | 'pdf' | 'json'
export type ThemeType = 'light' | 'dark' | 'jiuk'
export type UiSize = 24 | 28 | 32

export const MenuLogic = {

    exportCanvas: async (editor: Editor, format: ExportType) => {
        const shapeIds = editor.getSelectedShapeIds()
        const idsToExport = shapeIds.length > 0 ? shapeIds : Array.from(editor.getCurrentPageShapeIds())

        if (idsToExport.length === 0) return

        try {
            if (format === 'json') {
                const snapshot = editor.getSnapshot()
                const stringified = JSON.stringify(snapshot, null, 2)
                const blob = new Blob([stringified], { type: 'application/json' })
                downloadBlob(blob, `jiukisidian-project.json`)
                return
            }

            const svg = await (editor as any).getSvg(idsToExport, {
                scale: 2,
                background: true,
            })

            if (!svg) throw new Error('Falha ao gerar SVG')

            if (format === 'pdf') {
                alert('Exportação direta para PDF requer biblioteca externa. Exportando como PNG.')
                const blob = await svgToBlob(svg, 'image/png')
                if(blob) downloadBlob(blob, `jiukisidian-export.png`)
                return
            }

            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
            const blob = await svgToBlob(svg, mimeType)
            
            if (blob) {
                downloadBlob(blob, `jiukisidian-export.${format}`)
            }

        } catch (error) {
            console.error(error)
            alert('Não foi possível exportar o arquivo.')
        }
    },

    handleImageUpload: (editor: Editor, file: File | undefined) => {
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.')
            return
        }

        const reader = new FileReader()
        reader.onload = async () => {
            const assetId = AssetRecordType.createId()
            const imageId = createShapeId()
            const center = editor.getViewportScreenCenter()

            const img = new Image()
            img.src = reader.result as string
            img.onload = () => {
                editor.createAssets([{
                    id: assetId,
                    typeName: 'asset',
                    type: 'image',
                    props: {
                        name: file.name,
                        src: reader.result as string,
                        w: img.width,
                        h: img.height,
                        mimeType: file.type,
                        isAnimated: false
                    },
                    meta: {}
                }])

                editor.createShape({
                    id: imageId,
                    type: 'image',
                    x: center.x - (img.width / 2),
                    y: center.y - (img.height / 2),
                    props: {
                        assetId: assetId,
                        w: img.width,
                        h: img.height
                    }
                })
            }
        }
        reader.readAsDataURL(file)
    },

    setTheme: (editor: Editor, theme: ThemeType) => {
        const colorScheme = theme === 'light' ? 'light' : 'dark'
        editor.user.updateUserPreferences({ colorScheme: colorScheme })

        document.body.setAttribute('data-theme', theme)
        
        if (theme === 'jiuk') {
            document.documentElement.style.setProperty('--primary', '#a855f7')
        } else if (theme === 'dark') {
            document.documentElement.style.setProperty('--primary', '#3b82f6')
        }
    },

    setUiScale: (size: UiSize) => {
        document.documentElement.style.setProperty('--ui-icon-size', `${size}px`)
    },

    toggleReducedMotion: (editor: Editor) => {
        const currentSpeed = editor.user.getAnimationSpeed()
        const newSpeed = currentSpeed === 0 ? 1 : 0
        editor.user.updateUserPreferences({ animationSpeed: newSpeed })
        return newSpeed === 0
    },

    toggleGrid: (editor: Editor) => {
        const current = editor.getInstanceState().isGridMode
        editor.updateInstanceState({ isGridMode: !current })
    },

    toggleHighContrast: () => {
        document.body.classList.toggle('high-contrast')
    },

    createJiukNote: (editor: Editor) => {
        const center = editor.getViewportScreenCenter()
        const offset = (Math.random() - 0.5) * 20 
        
        editor.createShape({
            id: createShapeId(),
            type: 'obsidian-note' as any,
            x: center.x - 175 + offset,
            y: center.y - 200 + offset,
            props: {
                w: 350,
                h: 400
            }
        })
    },

    rotateSelection: (editor: Editor, degrees: number) => {
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length === 0) return

        const radians = (degrees * Math.PI) / 180
        
        editor.updateShapes(selectedIds.map(id => {
            const shape = editor.getShape(id) as any
            return {
                id,
                type: shape.type,
                rotation: (shape.rotation || 0) + radians
            }
        }))
    },

    flipSelection: (editor: Editor, direction: 'horizontal' | 'vertical') => {
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length === 0) return
        editor.flipShapes(selectedIds, direction)
    },

    stackSelection: (editor: Editor, action: 'front' | 'back' | 'forward' | 'backward') => {
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length === 0) return

        switch (action) {
            case 'front': editor.bringToFront(selectedIds); break
            case 'back': editor.sendToBack(selectedIds); break
            case 'forward': editor.bringForward(selectedIds); break
            case 'backward': editor.sendBackward(selectedIds); break
        }
    },

    alignSelection: (editor: Editor, alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical') => {
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length < 2) return
        editor.alignShapes(selectedIds, alignment)
    },

    distributeSelection: (editor: Editor, axis: 'horizontal' | 'vertical') => {
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length < 3) return
        editor.distributeShapes(selectedIds, axis)
    },

    toggleLock: (editor: Editor) => {
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length === 0) return
        editor.toggleLock(selectedIds)
    },

    duplicateSelection: (editor: Editor) => {
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length === 0) return
        editor.duplicateShapes(selectedIds)
    },

    groupSelection: (editor: Editor) => {
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length === 0) return
        editor.groupShapes(selectedIds)
    },

    ungroupSelection: (editor: Editor) => {
        const selectedIds = editor.getSelectedShapeIds()
        if (selectedIds.length === 0) return
        editor.ungroupShapes(selectedIds)
    },

    selectAll: (editor: Editor) => {
        editor.selectAll()
    }
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

function svgToBlob(svg: SVGSVGElement, mimeType: string): Promise<Blob | null> {
    return new Promise((resolve) => {
        const xml = new XMLSerializer().serializeToString(svg)
        const svg64 = btoa(unescape(encodeURIComponent(xml)))
        const b64Start = `data:image/svg+xml;base64,${svg64}`
        const image = new Image()

        image.onload = () => {
            const canvas = document.createElement('canvas')
            const scale = 2
            canvas.width = image.width * scale
            canvas.height = image.height * scale
            const ctx = canvas.getContext('2d')
            if (!ctx) return resolve(null)
            
            ctx.scale(scale, scale)

            if (mimeType === 'image/jpeg') {
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            
            ctx.drawImage(image, 0, 0)
            canvas.toBlob((blob) => resolve(blob), mimeType)
        }
        image.src = b64Start
    })
}