"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getVideoEmbed } from "@/lib/video";

// Plays in the provider's own player. `?t=<seconds>` (from search results) sets
// the start second through the provider's start parameter.
export function LessonVideo({ videoUrl, title }: { videoUrl: string; title: string }) {
  const searchParams = useSearchParams();
  const embed = getVideoEmbed(videoUrl, parseStartSeconds(searchParams.get("t")));

  return (
    <VideoFrame>
      {embed ? (
        <iframe
          src={embed.src}
          title={`${title} video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/70">
          This video can&rsquo;t be played here.
        </p>
      )}
    </VideoFrame>
  );
}

// Shown in the prerendered HTML until the embed mounts on the client.
export function LessonVideoFallback({ posterUrl }: { posterUrl: string | null }) {
  return (
    <VideoFrame>
      {posterUrl && (
        <Image
          src={posterUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 732px, 100vw"
          className="object-cover opacity-80"
        />
      )}
    </VideoFrame>
  );
}

function VideoFrame({ children }: { children: React.ReactNode }) {
  return <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">{children}</div>;
}

function parseStartSeconds(value: string | null) {
  return value && /^\d+$/.test(value) ? Number(value) : 0;
}
