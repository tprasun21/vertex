import Image from "next/image";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { urlFor } from "@/lib/sanity/image";
import { isSafeHref } from "@/lib/url";
import type { BlockContent } from "@/sanity.types";

type NoteImageValue = Extract<BlockContent[number], { _type: "image" }>;

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-4 text-[15px] leading-7 text-neutral-500 first:mt-0">{children}</p>,
    h2: ({ children }) => (
      <h2 className="mt-8 text-heading-2 font-medium text-neutral-900 first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => <h3 className="mt-6 text-heading-3 text-neutral-900 first:mt-0">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="mt-4 border-l-2 border-primary-300 pl-4 text-[15px] italic leading-7 text-neutral-700 first:mt-0">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-neutral-700 marker:text-primary-500 first:mt-0">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-neutral-700 marker:text-neutral-500 first:mt-0">
        {children}
      </ol>
    ),
  },
  marks: {
    code: ({ children }) => (
      <code className="rounded-xs bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] text-neutral-900">{children}</code>
    ),
    link: ({ children, value }) => {
      const href: unknown = value?.href;
      if (typeof href !== "string" || !isSafeHref(href)) return <>{children}</>;
      const external = !href.startsWith("mailto:");
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-primary-500 underline underline-offset-2 hover:text-primary-400"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: NoteImageValue }) => <NoteImage value={value} />,
  },
};

export function LessonNotes({ notes }: { notes: BlockContent | null }) {
  if (!notes?.length) {
    return <p className="pb-10 text-[15px] leading-7 text-neutral-500">No notes for this lesson yet.</p>;
  }

  return (
    <div className="pb-10">
      <PortableText value={notes} components={components} />
    </div>
  );
}

// Asset refs carry the original size: image-<hash>-<width>x<height>-<ext>.
function NoteImage({ value }: { value: NoteImageValue }) {
  const ref = value.asset?._ref;
  const size = ref?.match(/-(\d+)x(\d+)-[a-z0-9]+$/i);
  if (!ref || !size) return null;

  return (
    <Image
      src={urlFor(ref).width(1400).url()}
      alt={value.alt ?? ""}
      width={Number(size[1])}
      height={Number(size[2])}
      sizes="(min-width: 1280px) 692px, (min-width: 1024px) 50vw, 100vw"
      className="mt-6 h-auto w-full rounded-md first:mt-0"
    />
  );
}
