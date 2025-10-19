export default function PostCard({ post }) {
  return (
    <article className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
      <div className="p-4">
        <h2 className="font-serif text-2xl mb-2">{post.title || "Untitled"}</h2>
        {post.type === "audio" && (
          <audio controls src={`/uploads/${post.filename}`} className="w-full" />
        )}
        {post.type === "video" && (
          <video controls src={`/uploads/${post.filename}`} className="w-full" />
        )}
        {post.text && <p className="text-sm text-gray-700 mt-2">{post.text}</p>}
        {post.image && (
          <img
            src={post.image}
            alt="Post media"
            className="w-full mt-3 rounded-md"
          />
        )}
      </div>
    </article>
  );
}
