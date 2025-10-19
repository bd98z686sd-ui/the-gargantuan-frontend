export default function PostCard({ post, big }) {
  return (
    <article className={`${big ? 'md:col-span-2' : ''} bg-white p-4 border border-gray-200`}>
      <h2 className="font-display text-2xl md:text-3xl leading-tight mb-2 wrap-balance">{post.title}</h2>
      {(post.tagline || post.date) && <p className="text-sm text-gray-600 mb-3">{post.date ? new Date(post.date).toLocaleDateString() : ''}{post.tagline ? ` · ${post.tagline}` : ''}</p>}
      {post.videoUrl ? (
        <video className="w-full mb-3" controls playsInline src={post.videoUrl}></video>
      ) : post.audioUrl ? (
        <audio className="w-full mb-3" controls src={post.audioUrl}></audio>
      ) : null}
      {!post.videoUrl && post.audioUrl && <div className="text-xs text-gray-600">Processing… generating video</div>}
      {post.imageUrl && <img className="w-full mb-3" src={post.imageUrl} alt="" />}
      {post.text && <p className="prose max-w-none">{post.text}</p>}
    </article>
  )
}