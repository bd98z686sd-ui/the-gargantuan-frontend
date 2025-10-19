export default function Masthead() {
  return (
    <header className="w-full bg-guardian-blue text-white relative">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="masthead-title text-4xl md:text-5xl italic">The Gargantuan</h1>
      </div>
      <div className="h-1 bg-guardian-red absolute bottom-0 left-0 right-0"></div>
    </header>
  )
}
