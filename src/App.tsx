import { useEffect, useState } from 'react'
import { CanvasArea } from './app/CanvasArea'
import { FileDropOverlay } from './app/FileDropOverlay'
import { FurniturePalette } from './app/FurniturePalette'
import { InspectorPanel } from './app/InspectorPanel'
import { ResumeSessionPrompt } from './app/ResumeSessionPrompt'
import { StatusBar } from './app/StatusBar'
import { Toast } from './app/Toast'
import { Toolbar } from './app/Toolbar'
import { useProjectStore } from './state/projectStore'
import { useUiStore } from './state/uiStore'
import { loadProjectFromLocalStorage, saveProjectToLocalStorage, clearAutosave } from './state/persistence'

const AUTOSAVE_DEBOUNCE_MS = 2000

type MobilePanel = 'furniture' | 'inspector' | null

function App() {
  const setProject = useProjectStore((s) => s.setProject)
  const [autosavedProject] = useState(() => loadProjectFromLocalStorage())
  const [resumeDecided, setResumeDecided] = useState(() => autosavedProject === null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null)

  // Get the drawer out of the way once a piece is armed, so it can be tapped onto the canvas.
  useEffect(
    () =>
      useUiStore.subscribe((state, prev) => {
        if (state.armedCatalogId && state.armedCatalogId !== prev.armedCatalogId) {
          setMobilePanel(null)
        }
      }),
    [],
  )

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
    <div className="flex h-[100dvh] flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        {/* display:contents keeps the panels as flex children of this row on desktop. */}
        <div className="hidden md:contents">
          <FurniturePalette />
        </div>
        <CanvasArea />
        <div className="hidden md:contents">
          <InspectorPanel />
        </div>
      </div>
      <StatusBar />
      <nav className="flex h-14 shrink-0 items-center gap-2 border-t border-gray-200 bg-white px-3 pb-[env(safe-area-inset-bottom)] md:hidden">
        <button
          type="button"
          className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
            mobilePanel === 'furniture'
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-300'
          }`}
          onClick={() => setMobilePanel((p) => (p === 'furniture' ? null : 'furniture'))}
        >
          Furniture
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
            mobilePanel === 'inspector'
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-300'
          }`}
          onClick={() => setMobilePanel((p) => (p === 'inspector' ? null : 'inspector'))}
        >
          Inspector
        </button>
      </nav>
      {mobilePanel && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close panel"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobilePanel(null)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[75dvh] flex-col rounded-t-2xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-3 py-2">
              <h2 className="text-sm font-semibold">
                {mobilePanel === 'furniture' ? 'Furniture' : 'Inspector'}
              </h2>
              <button
                type="button"
                className="rounded px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
                onClick={() => setMobilePanel(null)}
              >
                Done
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
              {mobilePanel === 'furniture' ? <FurniturePalette /> : <InspectorPanel />}
            </div>
          </div>
        </div>
      )}
      <Toast />
      <FileDropOverlay />

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
