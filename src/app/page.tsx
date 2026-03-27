export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold tracking-tight mb-6">
          LP Architect
        </h1>
        <p className="text-xl text-gray-400 mb-10">
          Landing pages que convertem. Em breve.
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm text-gray-500">Em construção</span>
        </div>
      </div>
    </main>
  );
}
