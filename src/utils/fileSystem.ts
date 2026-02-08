import { Editor } from 'tldraw'

export const SAVE_FILE_EXTENSION = '.jiukisidian'

export const saveProjectToFile = (editor: Editor, projectName: string) => {
    const snapshot = editor.store.getSnapshot()
    
    const projectData = {
        version: 1,
        meta: {
            name: projectName,
            date: new Date().toISOString(),
            app: 'jiukisidian'
        },
        data: snapshot
    }

    const jsonStr = JSON.stringify(projectData)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName.replace(/\s+/g, '_')}${SAVE_FILE_EXTENSION}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export const loadProjectFromFile = async (file: File, editor: Editor) => {
    return new Promise<void>((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
            try {
                const jsonStr = e.target?.result as string
                const projectFile = JSON.parse(jsonStr)

                if (!projectFile.data || !projectFile.meta) {
                    throw new Error('Arquivo .jiukisidian inválido')
                }

                editor.store.loadSnapshot(projectFile.data)
                resolve()
            } catch (error) {
                console.error(error)
                reject(error)
            }
        }
        
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
        reader.readAsText(file)
    })
}