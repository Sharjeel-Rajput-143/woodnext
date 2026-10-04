const ID = /^[A-Za-z0-9_-]{11}$/;

/** Extracts the video id from any common YouTube link (watch, youtu.be, shorts, embed, live) or a bare id. */
export function parseYouTubeId(input: string): string | null {
  const text = input.trim();
  if (ID.test(text)) return text;
  let id: string | null | undefined;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    const host = url.hostname.replace(/^(www|m|music)\./, "");
    if (host === "youtu.be") {
      id = url.pathname.slice(1).split("/")[0];
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else id = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?]+)/)?.[1];
    }
  } catch {
    return null;
  }
  return id && ID.test(id) ? id : null;
}

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youtubeEmbed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
