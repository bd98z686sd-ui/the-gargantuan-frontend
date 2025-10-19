import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://the-gargantuan-backend.onrender.com";

export default function Editor({ token, refresh }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/posts`,
        { title, text, image },
        { headers: { "x-admin-token": token } }
      );
      setTitle("");
      setText("");
      setImage(null);
      refresh();
    } catch (err) {
      alert("Create failed");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${API_BASE}/api/upload`, formData);
    setImage(`/uploads/${res.data.filename}`);
  };

  return (
    <div className="p-4 bg-white shadow space-y-3 rounded-md">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="w-full border px-3 py-2"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your post..."
        rows={4}
        className="w-full border px-3 py-2"
      />
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button
        onClick={handleSubmit}
        className="bg-guardianBlue text-white px-4 py-2 rounded hover:bg-guardianRed transition"
      >
        Publish Post
      </button>
    </div>
  );
}
