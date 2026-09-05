import { useEffect, useState } from 'react'
import { CanvasArea } from './app/CanvasArea'
import { FurniturePalette } from './app/FurniturePalette'
import { InspectorPanel } from './app/InspectorPanel'
import { ResumeSessionPrompt } from './app/ResumeSessionPrompt'
import { StatusBar } from './app/StatusBar'
import { Toast } from './app/Toast'
import { Toolbar } from './app/Toolbar'
import { useProjectStore } from './state/projectStore'
import { loadProjectFromLocalStorage, saveProjectToLocalStorage, clearAutosave } from './state/persistence'

const AUTOSAVE_DEBOUNCE_MS = 2000

function App() {
  const setProject = useProjectStore((s) => s.setProject)
  const [autosavedProject] = useState(() => loadProjectFromLocalStorage())
  const [resumeDecided, setResumeDecided] = useState(() => autosavedProject === null)

  useEffect(() => {
    if (!resumeDecided) return
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsubscribe = useProjectStore.subscribe((state) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => saveProjectToLocalStorage(state.project), AUTOSAVE_DEBOUNCE_MS)
    })
    return () => {
      unsubscribe()
      if (timer) clearTimeout(timer)
    }
  }, [resumeDecided])

  return (
    <div className="flex h-screen flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <FurniturePalette />
        <CanvasArea />
        <InspectorPanel />
      </div>
      <StatusBar />
      <Toast />

      {!resumeDecided && autosavedProject && (
        <ResumeSessionPrompt
          projectName={autosavedProject.name}
          onResume={() => {
            setProject(autosavedProject)
            setResumeDecided(true)
          }}
          onDiscard={() => {
            clearAutosave()
            setResumeDecided(true)
          }}
        />
      )}
    </div>
  )
}

export default App
