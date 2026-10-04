"use client";

import type { StoredCatalog, Video } from "@/lib/products";
import { youtubeThumb } from "@/lib/youtube";
import type { Actions } from "./actions";
import AdmIcon from "./AdmIcons";

export default function VideosPanel({
  catalog,
  saving,
  actions,
  onAdd,
  onEdit,
  onDelete,
}: {
  catalog: StoredCatalog;
  saving: boolean;
  actions: Actions;
  onAdd: () => void;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
}) {
  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <p className="adm-muted adm-toolbar-note">
          Upload your video to YouTube, copy its link and add it here. It then shows on the website in the &ldquo;See our work&rdquo; section.
        </p>
        <button type="button" className="adm-btn adm-btn-primary adm-push" onClick={onAdd}>
          <AdmIcon name="plus" /> Add video
        </button>
      </div>

      {catalog.videos.length === 0 ? (
        <p className="adm-empty">No videos yet. The video section stays hidden on the website until you add one.</p>
      ) : (
        <div className="adm-table adm-table-videos">
          <div className="adm-tr adm-th">
            <span>Preview</span>
            <span>Video</span>
            <span className="adm-th-actions">Actions</span>
          </div>
          {catalog.videos.map((video, index) => (
            <div className="adm-tr" key={video.id}>
              {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail */}
              <img className="adm-thumb adm-thumb-wide" src={youtubeThumb(video.youtubeId)} alt="" loading="lazy" />
              <span className="adm-cell-main">
                <strong>{video.title}</strong>
                <small>youtube.com/watch?v={video.youtubeId}</small>
              </span>
              <span className="adm-actions">
                <button type="button" className="adm-iconbtn" aria-label="Move up" title="Move up" disabled={saving || index === 0} onClick={() => actions.moveVideo(index, -1)}>
                  <AdmIcon name="up" />
                </button>
                <button
                  type="button"
                  className="adm-iconbtn"
                  aria-label="Move down"
                  title="Move down"
                  disabled={saving || index === catalog.videos.length - 1}
                  onClick={() => actions.moveVideo(index, 1)}
                >
                  <AdmIcon name="down" />
                </button>
                <a className="adm-iconbtn" href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" aria-label="Open on YouTube" title="Open on YouTube">
                  <AdmIcon name="external" />
                </a>
                <button type="button" className="adm-iconbtn" aria-label="Edit" title="Edit" disabled={saving} onClick={() => onEdit(video)}>
                  <AdmIcon name="edit" />
                </button>
                <button type="button" className="adm-iconbtn adm-iconbtn-danger" aria-label="Delete" title="Delete" disabled={saving} onClick={() => onDelete(video)}>
                  <AdmIcon name="trash" />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
