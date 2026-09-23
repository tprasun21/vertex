// Turns a stored lesson video URL into the provider's own embed. The iframe src
// is rebuilt from validated ids on fixed origins, never taken from the stored URL.

export type VideoProvider = "youtube" | "vimeo" | "bunny";

export type VideoEmbed = { provider: VideoProvider; src: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d+$/;
const VIMEO_HASH = /^[A-Za-z0-9]+$/;
const BUNNY_LIBRARY = /^\d+$/;
const BUNNY_VIDEO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getVideoEmbed(videoUrl: string, startSeconds = 0): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    return null;
  }

  const start = Math.max(0, Math.floor(startSeconds));
  const segments = url.pathname.split("/").filter(Boolean);

  switch (url.hostname) {
    case "youtube.com":
    case "www.youtube.com":
    case "youtu.be": {
      const id =
        url.hostname === "youtu.be"
          ? segments[0]
          : segments[0] === "watch"
            ? url.searchParams.get("v")
            : ["embed", "shorts", "live"].includes(segments[0])
              ? segments[1]
              : null;
      if (!id || !YOUTUBE_ID.test(id)) return null;

      const params = new URLSearchParams({ rel: "0" });
      if (start > 0) params.set("start", String(start));
      return { provider: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}?${params}` };
    }

    case "vimeo.com":
    case "player.vimeo.com": {
      // vimeo.com/<id>[/<hash>] or player.vimeo.com/video/<id>?h=<hash>
      const [id, pathHash] = url.hostname === "vimeo.com" ? segments : segments.slice(1);
      const hash = url.searchParams.get("h") ?? pathHash;
      if (!id || !VIMEO_ID.test(id)) return null;

      const query = hash && VIMEO_HASH.test(hash) ? `?h=${hash}` : "";
      const fragment = start > 0 ? `#t=${start}s` : "";
      return { provider: "vimeo", src: `https://player.vimeo.com/video/${id}${query}${fragment}` };
    }

    case "iframe.mediadelivery.net":
    case "player.mediadelivery.net": {
      // /embed/<libraryId>/<videoId> or /play/<libraryId>/<videoId>
      const [kind, library, video] = segments;
      if (!["embed", "play"].includes(kind) || !BUNNY_LIBRARY.test(library ?? "") || !BUNNY_VIDEO.test(video ?? "")) {
        return null;
      }

      const query = start > 0 ? `?t=${start}` : "";
      return { provider: "bunny", src: `https://iframe.mediadelivery.net/embed/${library}/${video}${query}` };
    }

    default:
      return null;
  }
}
