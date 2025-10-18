import React from 'react';
export default function Home(){
  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">
      <header className="bg-[#052962] text-white border-b-4 border-[#c70000]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-4xl font-serif italic font-extrabold">The Gargantuan</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <p>Welcome. Go to <a href="/admin" className="underline text-[#052962]">Admin</a> to upload audio and generate Shorts.</p>
      </main>
    </div>
  );
}
