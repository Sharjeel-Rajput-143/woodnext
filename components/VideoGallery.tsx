"use client";

import { useState } from "react";
import { youtubeEmbed, youtubeThumb } from "@/lib/youtube";
import { PlayIcon } from "./Icons";
import Reveal from "./Reveal";
import { useShop } from "./ShopProvider";

/** "Watch our work" section. Videos are YouTube links added by the owner in /admin. */
export default function VideoGallery() {
  const { videos } = useShop();
  const [playing, setPlaying] = useState<string | null>(null);
  if (videos.length === 0) return null;

  return (
    <section className="section" id="videos">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Watch</p>
          <h2>See our work in action</h2>
          <p className="section-lead">Short videos from our workshop and finished projects.</p>
        </Reveal>
        <div className="videos">
          {videos.map((video) => (
            <article className="video-card" key={video.id}>
              <div className="video-frame">
                {playing === video.id ? (
                  <iframe
                    src={youtubeEmbed(video.youtubeId)}
                    title={video.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <button
                    type="button"
                    className="video-play"
                    aria-label={`Play video: ${video.title}`}
                    onClick={() => setPlaying(video.id)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail, already optimised */}
                    <img src={youtubeThumb(video.youtubeId)} alt="" loading="lazy" />
                    <span className="video-play-icon">
                      <PlayIcon />
                    </span>
                  </button>
                )}
              </div>
              <h3>{video.title}</h3>
              {video.description && <p>{video.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
