import React, { useEffect, useState } from "react";

export default function App() {
  const [posts, setPosts] = useState([]);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    // Fetch posts from backend later
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#121212]">
      <header className="sticky top-0 z-50 bg-[#052962] text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-3 sm:py-4 border-b-4 border-[#c70000]">
            <h1 className="text-5xl sm:text-6xl font-serif italic font-extrabold tracking-tight">
              The Gargantuan
            </h1>
            <p className="text-xs sm:text-sm mt-1 text-white/80">
              {today} · Edited by The Gargantuan
            </p>
          </div>

          <nav className="flex gap-5 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wide font-semibold">
            {["News", "Culture", "Sound", "Ideas", "Dispatches"].map((item) => (
              <a
                key={item}
                href="#"
                className="hover:underline decoration-2 underline-offset-4 decoration-[#c70000]"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg border border-[#dcdcdc] overflow-hidden hover:shadow transition mb-6"
                >
                  <div className="p-5 sm:p-6">
                    <h2 className="text-2xl sm:text-3xl font-serif font-semibold mb-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-[#666] mb-4 italic">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                    <audio controls className="w-full">
                      <source
                        src={`${import.meta.env.VITE_API_BASE}/uploads/${post.filename}`}
                        type="audio/mpeg"
                      />
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                </article>
              ))
            ) : (
              <div className="bg-white border border-[#dcdcdc] rounded-lg p-10 text-center italic text-[#444]">
                No posts yet — new audio will appear here soon.
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <h3 className="font-headline text-xl">Recent</h3>
            <div className="border-t border-[#dcdcdc]" />
            <ul className="space-y-3">
              {posts.length > 0 ? (
                posts.slice(0, 5).map((post) => (
                  <li key={post.id}>
                    <a
                      href="#"
                      className="hover:underline text-[#052962] font-medium"
                    >
                      {post.title}
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-[#777] italic">Nothing yet.</li>
              )}
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}
