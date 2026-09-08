interface ResumeSessionPromptProps {
  projectName: string;
  onResume: () => void;
  onDiscard: () => void;
}

export function ResumeSessionPrompt({
  projectName,
  onResume,
  onDiscard,
}: ResumeSessionPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[min(20rem,calc(100vw-2rem))] rounded-lg bg-white p-4 shadow-lg">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">Resume last session?</h2>
        <p className="mb-3 text-xs text-gray-500">
          We found an autosaved project "{projectName}" from your last session.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            onClick={onDiscard}
          >
            Start New
          </button>
          <button
            type="button"
            className="rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-700"
            onClick={onResume}
          >
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}
