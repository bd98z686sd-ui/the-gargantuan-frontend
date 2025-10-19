import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PostCard from "./components/PostCard";
import AdminPanel from "./components/AdminPanel";

const API_BASE = import.meta.env.VITE_API_BASE || "https://the-gargantuan-backend.onrender.com";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onAdmin={() => setIsAdmin(!isAdmin)} />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isAdmin ? (
          <AdminPanel posts={posts} refresh={fetchPosts} />
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </main>
      <Footer />
    </div>
  );
}
