import { useState, useEffect } from 'react'
import { Plus, FolderOpen, Trash2, X } from 'lucide-react'

interface Project {
    id: string
    name: string
    lastModified: number
}

interface ProjectManagerProps {
    currentProjectId: string
    onSelectProject: (id: string) => void
    onClose: () => void
}

export const ProjectManager = ({ currentProjectId, onSelectProject, onClose }: ProjectManagerProps) => {
    const [projects, setProjects] = useState<Project[]>([])
    const [newProjectName, setNewProjectName] = useState('')

    useEffect(() => {
        const savedProjects = localStorage.getItem('jiukisidian-projects-index')
        if (savedProjects) {
            setProjects(JSON.parse(savedProjects))
        } else {
            const defaultProject = { id: 'default', name: 'Meu Primeiro Projeto', lastModified: Date.now() }
            setProjects([defaultProject])
            localStorage.setItem('jiukisidian-projects-index', JSON.stringify([defaultProject]))
        }
    }, [])

    const handleCreateProject = () => {
        if (!newProjectName.trim()) return

        const newProject: Project = {
            id: crypto.randomUUID(),
            name: newProjectName,
            lastModified: Date.now()
        }

        const updatedList = [...projects, newProject]
        setProjects(updatedList)
        localStorage.setItem('jiukisidian-projects-index', JSON.stringify(updatedList))
        setNewProjectName('')
        onSelectProject(newProject.id)
    }

    const handleDeleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (projects.length <= 1) {
            alert("Você precisa ter pelo menos um projeto.")
            return
        }
        if (confirm("Tem certeza? Isso apagará este projeto permanentemente.")) {
            const updatedList = projects.filter(p => p.id !== id)
            setProjects(updatedList)
            localStorage.setItem('jiukisidian-projects-index', JSON.stringify(updatedList))
            
            localStorage.removeItem(`jiukisidian-data-${id}`)

            if (currentProjectId === id) {
                onSelectProject(updatedList[0].id)
            }
        }
    }

    return (
        <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <div style={{
                background: '#18181b', width: '500px', maxHeight: '80vh', 
                borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
                border: '1px solid #27272a', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 style={{color: '#f4f4f5', margin: 0, display: 'flex', alignItems: 'center', gap: 10}}>
                        <FolderOpen color="#a855f7" /> Meus Projetos
                    </h2>
                    <button onClick={onClose} style={{background:'none', border:'none', color:'#71717a', cursor:'pointer'}}>
                        <X />
                    </button>
                </div>

                <div style={{display: 'flex', gap: 10}}>
                    <input 
                        type="text" 
                        placeholder="Nome do novo projeto..." 
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        style={{
                            flex: 1, background: '#27272a', border: '1px solid #3f3f46', 
                            padding: '10px', borderRadius: '6px', color: 'white', outline: 'none'
                        }}
                    />
                    <button 
                        onClick={handleCreateProject}
                        style={{
                            background: '#a855f7', color: 'white', border: 'none', 
                            padding: '0 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
                        }}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto'}}>
                    {projects.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => onSelectProject(p.id)}
                            style={{
                                padding: '12px', borderRadius: '8px', 
                                background: p.id === currentProjectId ? 'rgba(168, 85, 247, 0.2)' : '#27272a',
                                border: p.id === currentProjectId ? '1px solid #a855f7' : '1px solid transparent',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                cursor: 'pointer', transition: '0.2s'
                            }}
                        >
                            <div>
                                <div style={{color: 'white', fontWeight: 500}}>{p.name}</div>
                                <div style={{color: '#71717a', fontSize: '12px'}}>
                                    {new Date(p.lastModified).toLocaleDateString()}
                                </div>
                            </div>
                            
                            {p.id !== currentProjectId && (
                                <button 
                                    onClick={(e) => handleDeleteProject(p.id, e)}
                                    style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6}}
                                    title="Deletar Projeto"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                            {p.id === currentProjectId && <div style={{color: '#a855f7', fontSize:'12px', fontWeight:'bold'}}>ATIVO</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}