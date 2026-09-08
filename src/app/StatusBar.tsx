export function StatusBar() {
  return (
    <footer className="hidden h-6 shrink-0 items-center gap-4 border-t border-gray-200 bg-white px-3 text-xs text-gray-500 md:flex">
      <span>Zoom: 100%</span>
      <span>x: 0, y: 0</span>
      <span className="flex-1" />
      <span>No selection</span>
    </footer>
  );
}
