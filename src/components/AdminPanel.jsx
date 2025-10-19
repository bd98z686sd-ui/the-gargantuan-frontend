import { useState } from "react";
import axios from "axios";
import Editor from "./Editor";

const API_BASE = import.meta.env.VITE_API_BASE || "https://the-gargantuan-backend.onrender.com";

export default function AdminPanel({ posts, refresh }) {
  const [token, setToken] = useState("");
  const [selected, setSelected] = useState(null);

  const deletePost = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/posts/${id}`, {
        headers: { "x-admin-token": token },
      });
      refresh();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="password"
          placeholder="Admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="border px-3 py-1 text-sm w-64"
        />
      </div>

      <Editor token={token} refresh={refresh} />

      <div className="grid gap-4">
        {posts.map((p) => (
          <div
            key={p.id}
            className="bg-white p-4 shadow flex justify-between items-center"
          >
            <span className="truncate w-1/2">{p.title}</span>
            <div className="space-x-2">
              <button
                onClick={() => deletePost(p.id)}
                className="bg-red-600 text-white px-2 py-1 text-xs rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
