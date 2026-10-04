"use client";

import { useState, type FormEvent } from "react";
import type { StoredCatalog, Video } from "@/lib/products";
import { parseYouTubeId, youtubeThumb } from "@/lib/youtube";
import type { Commit } from "./AdminApp";

type Props = { catalog: StoredCatalog; commit: Commit; saving: boolean };

const CHARS = "abcdefghijkmnpqrstuvwxyz23456789";
function newId(taken: Set<string>): string {
  for (;;) {
    let id = "v-";
    for (let i = 0; i < 6; i++) id += CHARS[Math.floor(Math.random() * CHARS.length)];
    if (!taken.has(id)) return id;
  }
}

export default function VideosPanel({ catalog, commit, saving }: Props) {
  const [editing, setEditing] = useState<Video | "new" | null>(null);

  async function save(video: Video) {
    const exists = catalog.videos.some((v) => v.id === video.id);
    const videos = exists ? catalog.videos.map((v) => (v.id === video.id ? video : v)) : [...catalog.videos, video];
    const ok = await commit({ ...catalog, videos }, exists ? "Video updated." : "Video added to the website.");
    if (ok) setEditing(null);
  }

  async function remove(video: Video) {
    if (!window.confirm(`Remove "${video.title}" from the website?`)) return;
    await commit({ ...catalog, videos: catalog.videos.filter((v) => v.id !== video.id) }, "Video removed.");
  }

  async function move(index: number, direction: -1 | 1) {
    const videos = [...catalog.videos];
    const target = index + direction;
    if (target < 0 || target >= videos.length) return;
    [videos[index], videos[target]] = [videos[target], videos[index]];
    await commit({ ...catalog, videos }, "Video order updated.");
  }

  if (editing) {
    return (
      <VideoForm
        key={editing === "new" ? "new" : editing.id}
        initial={editing === "new" ? null : editing}
        catalog={catalog}
        saving={saving}
        onSave={save}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <section>
      <div className="adm-toolbar">
        <p className="adm-muted">
          Upload your video to YouTube, copy its link and add it here. It then shows on the website in the &ldquo;See our work&rdquo; section.
        </p>
        <button type="button" className="btn btn-wa btn-sm" onClick={() => setEditing("new")}>
          + Add video
        </button>
      </div>
      {catalog.videos.length === 0 ? (
        <p className="adm-empty">No videos yet. The video section stays hidden on the website until you add one.</p>
      ) : (
        <ul className="adm-list">
          {catalog.videos.map((video, index) => (
            <li className="adm-row" key={video.id}>
              {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail */}
              <img className="adm-thumb adm-thumb-wide" src={youtubeThumb(video.youtubeId)} alt="" loading="lazy" />
              <div className="adm-row-main">
                <strong>{video.title}</strong>
                <span className="adm-muted">youtube.com/watch?v={video.youtubeId}</span>
              </div>
              <div className="adm-row-actions">
                <button type="button" className="adm-icon" aria-label="Move up" disabled={saving || index === 0} onClick={() => move(index, -1)}>
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-icon"
                  aria-label="Move down"
                  disabled={saving || index === catalog.videos.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <a className="adm-btn" href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer">
                  Open
                </a>
                <button type="button" className="adm-btn" disabled={saving} onClick={() => setEditing(video)}>
                  Edit
                </button>
                <button type="button" className="adm-btn adm-btn-danger" disabled={saving} onClick={() => remove(video)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function VideoForm({
  initial,
  catalog,
  saving,
  onSave,
  onCancel,
}: {
  initial: Video | null;
  catalog: StoredCatalog;
  saving: boolean;
  onSave: (video: Video) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial ? `https://www.youtube.com/watch?v=${initial.youtubeId}` : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState("");
  const youtubeId = parseYouTubeId(url);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return setError("Please enter a title.");
    if (!youtubeId) return setError("That doesn't look like a YouTube link. Copy it from the YouTube address bar or the Share button.");
    await onSave({
      id: initial?.id ?? newId(new Set(catalog.videos.map((v) => v.id))),
      title: title.trim(),
      description: description.trim(),
      youtubeId,
    });
  }

  return (
    <form className="adm-form" onSubmit={onSubmit}>
      <h2>{initial ? `Edit ${initial.title}` : "Add a video"}</h2>
      <label className="adm-field">
        <span>YouTube link</span>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" inputMode="url" required />
      </label>
      {url.trim() && (
        <div className="adm-video-preview">
          {youtubeId ? (
            // eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail preview
            <img src={youtubeThumb(youtubeId)} alt="Video preview" />
          ) : (
            <span className="adm-muted">Not a valid YouTube link yet.</span>
          )}
        </div>
      )}
      <label className="adm-field">
        <span>Title</span>
        <input value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How we build a king-size bed" required />
      </label>
      <label className="adm-field">
        <span>Short description (optional)</span>
        <textarea value={description} maxLength={300} rows={2} onChange={(e) => setDescription(e.target.value)} />
      </label>
      {error && (
        <p className="adm-alert adm-alert-error" role="alert">
          {error}
        </p>
      )}
      <div className="adm-form-actions">
        <button type="submit" className="btn btn-wa" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add video"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
