import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
// Remove MDEditor in favour of a simple textarea.  The original
// dependency @uiw/react-md-editor failed to install on Vercel due
// to unavailable versions.  Authors can still write Markdown manually
// and it will be rendered on the public site using the marked library.

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || '';
const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Admin page implementing a unified publish interface and basic post
 * management.  Supports creating text/image/audio posts with an optional
 * draft state.  Audio uploads trigger a background video generation job
 * which is monitored until completion.
 */
export default function AdminPage() {
  // Form state
  const [title, setTitle] = useState('The Gargantuan');
  const [body, setBody] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  // Optional cover image file and uploaded URL.  The cover image is used
  // when posting text or audio‑only entries.  It is uploaded via the
  // images/upload endpoint and the returned URL is stored in coverImageUrl.
  const [coverFile, setCoverFile] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  // Whether to generate a spectral video when an audio file is present.
  const [generateVideo, setGenerateVideo] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  // Post lists
  const [posts, setPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [error, setError] = useState(null);
  // Editing mode
  const [editingId, setEditingId] = useState(null);
  // Ref to file input for images
  const imageInputRef = useRef();

  // Ref to cover image file input
  const coverInputRef = useRef();

  // Load published and draft posts
  const loadLists = async () => {
    try {
      setLoadingLists(true);
      const [postsResp, draftsResp] = await Promise.all([
        axios.get(`${API_BASE}/api/posts`),
        axios.get(`${API_BASE}/api/drafts`),
      ]);
      setPosts(postsResp.data);
      setDrafts(draftsResp.data);
      setLoadingLists(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  // Reset form to initial state
  const resetForm = () => {
    setTitle('The Gargantuan');
    setBody('');
    setAudioFile(null);
    setIsDraft(false);
    setEditingId(null);
    setProgress(null);
    setCoverFile(null);
    setCoverImageUrl('');
    setGenerateVideo(true);
  };

  /** Handle image upload triggered by the insert image button.  Opens
   * a hidden file input, then uploads the selected file to the backend
   * using the images/upload endpoint.  The returned URL is inserted into
   * the Markdown body at the end.  On error a message is logged.
   */
  const handleInsertImage = () => {
    if (!imageInputRef.current) return;
    imageInputRef.current.click();
  };

  const onImageSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await axios.post(`${API_BASE}/api/images/upload`, formData, {
        headers: {
          'x-admin-token': ADMIN_TOKEN,
        },
      });
      const url = resp.data.url;
      setBody((prev) => `${prev}\n\n![image](${url})`);
    } catch (err) {
      console.error('Image upload failed', err);
      alert('Image upload failed');
    }
  };

  /** Handle selection of a cover image.  The selected file is uploaded
   * immediately and the returned URL stored in state so it can be used
   * when saving the post.  Covers are optional; if none is provided the
   * backend will fall back to displaying nothing or using the first
   * embedded image in the Markdown body.
   */
  const onCoverSelected = async (event) => {
    const file = event.target.files[0];
    setCoverFile(file || null);
    if (!file) {
      setCoverImageUrl('');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await axios.post(`${API_BASE}/api/images/upload`, formData, {
        headers: {
          'x-admin-token': ADMIN_TOKEN,
        },
      });
      setCoverImageUrl(resp.data.url);
    } catch (err) {
      console.error('Cover image upload failed', err);
      alert('Cover image upload failed');
    }
  };

  /** Submit handler for the publish button.  Determines whether an audio
   * upload is involved; if so the audio is uploaded and a video is
   * generated.  Otherwise a text/image post is created directly.  Draft
   * status is respected based on the isDraft flag or editingId.
   */
  const handleSubmit = async () => {
    if (!title) {
      alert('Title is required');
      return;
    }
    setUploading(true);
    setProgress(null);
    try {
      if (audioFile) {
        // Step 1: upload audio
        const uploadData = new FormData();
        uploadData.append('file', audioFile);
        const uploadResp = await axios.post(`${API_BASE}/api/upload`, uploadData, {
          headers: { 'x-admin-token': ADMIN_TOKEN },
        });
        const filename = uploadResp.data.filename;
        const id = filename.substring(0, filename.lastIndexOf('.'));
        if (generateVideo) {
          // Generate a video from the uploaded audio
          const genResp = await axios.post(
            `${API_BASE}/api/generate-video`,
            { filename, title },
            { headers: { 'x-admin-token': ADMIN_TOKEN } },
          );
          const { jobId } = genResp.data;
          // Poll job until done
          let complete = false;
          while (!complete) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            const jobResp = await axios.get(`${API_BASE}/api/jobs/${jobId}`);
            const job = jobResp.data;
            setProgress(job.progress);
            if (job.status === 'done') {
              complete = true;
            } else if (job.status === 'error') {
              throw new Error(job.error);
            }
          }
        }
        // Whether or not a video was generated, update metadata.  If
        // generateVideo is false then only the audio exists; the backend
        // listing logic will treat this as an audio post.  Include the
        // optional coverImageUrl so that audio‑only posts can display a
        // representative image on the front page.
        await axios.patch(
          `${API_BASE}/api/posts/${id}`,
          { title, body, imageUrl: coverImageUrl || undefined, draft: isDraft },
          { headers: { 'x-admin-token': ADMIN_TOKEN } },
        );
      } else {
        // No audio: create text or image post.  Provide the coverImageUrl
        // if one has been uploaded; otherwise leave it blank.
        await axios.post(
          `${API_BASE}/api/create-post`,
          {
            title,
            body,
            imageUrl: coverImageUrl || '',
            published: !isDraft,
          },
          { headers: { 'x-admin-token': ADMIN_TOKEN } },
        );
      }
      // Refresh lists and reset form
      await loadLists();
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to publish: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete a post (move to trash).  Accepts id and calls DELETE /api/posts/:id.
   */
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`${API_BASE}/api/posts/${id}`, {
        headers: { 'x-admin-token': ADMIN_TOKEN },
      });
      await loadLists();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  /** Restore a post from trash. */
  const handleRestore = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/posts/${id}/restore`, {}, {
        headers: { 'x-admin-token': ADMIN_TOKEN },
      });
      await loadLists();
    } catch (err) {
      console.error(err);
      alert('Failed to restore');
    }
  };

  /** Toggle draft status on an existing post. */
  const handleToggleDraft = async (id, draft) => {
    try {
      await axios.patch(
        `${API_BASE}/api/posts/${id}`,
        { draft },
        { headers: { 'x-admin-token': ADMIN_TOKEN } },
      );
      await loadLists();
    } catch (err) {
      console.error(err);
      alert('Failed to toggle draft');
    }
  };

  /** Start editing an existing post.  Loads the meta into form fields and
   * marks editingId.  The user may update the title/body and toggle draft.
   */
  const handleEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setBody(post.body);
    setIsDraft(post.draft);
    setAudioFile(null);
    setProgress(null);
  };

  /** Save edits to the currently editing post.  Sends a PATCH request. */
  const handleSaveEdit = async () => {
    if (!editingId) return;
    setUploading(true);
    try {
      await axios.patch(
        `${API_BASE}/api/posts/${editingId}`,
        { title, body, draft: isDraft },
        { headers: { 'x-admin-token': ADMIN_TOKEN } },
      );
      await loadLists();
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <h2>{editingId ? 'Edit Post' : 'Publish New Post'}</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ width: '100%', height: '200px', padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}
          placeholder="Write your post in Markdown here..."
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <button type="button" onClick={handleInsertImage}>Insert image</button>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          style={{ display: 'none' }}
          onChange={onImageSelected}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Cover image (optional):
          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            onChange={onCoverSelected}
            style={{ display: 'block', marginTop: '0.25rem' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Audio (optional):
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files[0] || null)}
            style={{ display: 'block', marginTop: '0.25rem' }}
          />
        </label>
      </div>
      {audioFile && (
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={generateVideo}
              onChange={(e) => setGenerateVideo(e.target.checked)}
            />{' '}
            Generate spectral video
          </label>
        </div>
      )}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={isDraft}
            onChange={(e) => setIsDraft(e.target.checked)}
          />
          {' '}Save as draft
        </label>
      </div>
      {editingId ? (
        <div>
          <button onClick={handleSaveEdit} disabled={uploading}>
            {uploading ? 'Saving…' : 'Save'}
          </button>
          <button onClick={resetForm} disabled={uploading}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={handleSubmit} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Publish'}
        </button>
      )}
      {progress !== null && <p>Processing: {progress}%</p>}
      <hr style={{ margin: '2rem 0' }} />
      <h3>Posts</h3>
      {loadingLists && <p>Loading posts…</p>}
      {error && <p>Error: {error}</p>}
      {!loadingLists && posts.length === 0 && <p>No published posts.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Preview thumbnail if an image is associated with the post */}
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title || ''}
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                />
              )}
              <strong>{post.title}</strong>
            </div>
            <div>
              <button onClick={() => handleEdit(post)}>Edit</button>
              <button onClick={() => handleDelete(post.id)}>Delete</button>
              <button onClick={() => handleToggleDraft(post.id, true)}>Unpublish</button>
            </div>
          </li>
        ))}
      </ul>
      <h3>Drafts</h3>
      {!loadingLists && drafts.length === 0 && <p>No drafts.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {drafts.map((post) => (
          <li key={post.id} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title || ''}
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                />
              )}
              <strong>{post.title || '(Untitled)'} (draft)</strong>
            </div>
            <div>
              <button onClick={() => handleEdit(post)}>Edit</button>
              <button onClick={() => handleDelete(post.id)}>Delete</button>
              <button onClick={() => handleToggleDraft(post.id, false)}>Publish</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}