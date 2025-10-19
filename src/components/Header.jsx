export default function Header({ onAdmin }) {
  return (
    <header className="bg-guardianBlue text-white py-4 sticky top-0 z-50 border-b-4 border-guardianRed">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        <h1 className="text-4xl font-serif italic tracking-tight">
          The Gargantuan
        </h1>
        <button
          onClick={onAdmin}
          className="text-sm italic underline hover:text-guardianRed transition-colors"
        >
          Admin
        </button>
      </div>
    </header>
  );
}
