import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
      <Link href="/" className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" className="size-6 text-primary-500">
          <path d="M2 3h4l6 14 6-14h4L14 21h-4L2 3z" fill="currentColor" />
        </svg>
        <span className="font-display text-lg font-bold text-neutral-900">Vertex</span>
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium text-neutral-700">
        <Link href="/courses" className="hover:text-primary-500">
          Courses
        </Link>
        <Link href="/my-learning" className="hover:text-primary-500">
          My Learning
        </Link>
      </div>
    </nav>
  );
}
