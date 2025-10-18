import React, { useState, useEffect } from "react";

const SAMPLE_MODE = true;

const samplePosts = [
  {
    id: 1,
    title: "The Gargantuan Reports: Humanity, Interrupted",
    subtitle: "Today’s audio dispatch on culture, collapse, and curiosity.",
    date: "Saturday 19 October 2025",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
  },
  {
    id: 2,
    title: "A New Wave of Sound Journalism",
    subtitle: "Exploring the frontier between narrative and noise.",
    date: "18 October 2025",
  },
  {
    id: 3,
    title: "What Happens When AI Reads the News?",
    subtitle: "The future of human voice in machine stories.",
    date: "17 October 2025",
  },
];

export default function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (SAMPLE_MODE) {
      setPosts(samplePosts);
    } else {
      fetch("https://the-gargantuan-backend.onrender.com/api/posts")
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((err) => console.error("Error fetching posts:", err));
    }
  }, []);

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-guardianWhite text-guardianText">
      {/* Masthead */}
      <header className="bg-guardianBlue text-white px-6 py-4 border-b-4 border-guardianRed">
        <h1 className="text-5xl font-serif font-extrabold italic tracking-tight">
          The Gargantuan
        </h1>
        <p className="text-sm mt-2 text-gray-200 tracking-wide">
          {today} · Edited by The Gargantuan
        </p>
      </header>

      {/* Hero Section */}
      {posts[0] && (
        <section
          className="relative h-[65vh] flex flex-col justify-end bg-cover bg-center text-white p-6"
          style={{
            backgroundImage: `url(${posts[0].image})`,
            backgroundColor: "#052962",
          }}
        >
          <div className="bg-black/50 p-6 rounded max-w-2xl">
            <h2 className="text-4xl font-headline leading-snug mb-2">{posts[0].title}</h2>
            <p className="italic text-guardianRed text-lg">{posts[0].subtitle}</p>
          </div>
        </section>
      )}

      {/* Sub Stories */}
      <section className="grid md:grid-cols-3 gap-8 p-8">
        {posts.slice(1).map((post) => (
          <article
            key={post.id}
            className="border-t border-gray-300 pt-4 hover:opacity-90 transition"
          >
            <h3 className="font-headline text-2xl mb-2">{post.title}</h3>
            <p className="text-sm text-gray-700 mb-2 font-sans">{post.subtitle}</p>
            <p className="text-xs text-gray-500">{post.date}</p>
          </article>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-guardianBlue text-white text-center py-8 mt-16">
        <p className="font-serif text-lg">© {new Date().getFullYear()} The Gargantuan</p>
        <p className="text-sm text-gray-300 mt-1">Contact: hellogargantuan69@gmail.com</p>
      </footer>
    </div>
  );
}
