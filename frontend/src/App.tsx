function App() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">Drawing Practice</p>
        <h1 className="mt-3 text-3xl font-bold">React + TypeScript + Tailwind CSS</h1>
        <p className="mt-4 text-slate-600">
          Tailwind CSS is now enabled. Edit <code className="rounded bg-slate-100 px-1 py-0.5">src/App.tsx</code> and
          start building your UI.
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Ready
        </button>
      </div>
    </main>
  )
}

export default App
