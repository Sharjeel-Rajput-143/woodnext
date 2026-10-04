"use client";

import { useState, type FormEvent } from "react";
import type { StoredCatalog, Video } from "@/lib/products";
import { parseYouTubeId, youtubeThumb } from "@/lib/youtube";

const CHARS = "abcdefghijkmnpqrstuvwxyz23456789";
function newId(taken: Set<string>): string {
  for (;;) {
    let id = "v-";
    for (let i = 0; i < 6; i++) id += CHARS[Math.floor(Math.random() * CHARS.length)];
    if (!taken.has(id)) return id;
  }
}

export default function VideoForm({
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
      <p className="adm-muted">
        Upload your video to YouTube, then copy its link and paste it here. It shows on the website in the &ldquo;See our work&rdquo; section.
      </p>
      <label className="adm-field">
        <span>YouTube link</span>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" inputMode="url" required autoFocus />
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
        <button type="button" className="adm-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add video"}
        </button>
      </div>
    </form>
  );
}
