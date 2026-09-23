import Link from "next/link";
import { Bell } from "lucide-react";

export function Navbar({ user }: { user?: { avatarUrl?: string } }) {
  return (
    <nav className="border-b border-neutral-200 px-4 sm:px-6">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="size-6 text-primary-500">
            <path d="M2 3h4l6 14 6-14h4L14 21h-4L2 3z" fill="currentColor" />
          </svg>
          <span className="font-display text-base font-bold text-neutral-900 sm:text-lg">
            Vertex
          </span>
        </Link>
        <div className="flex items-center gap-4 whitespace-nowrap text-sm font-medium text-neutral-700 sm:gap-6">
          <Link href="/courses" className="hover:text-primary-500">
            Courses
          </Link>
          <Link href="/my-learning" className="hover:text-primary-500">
            My Learning
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="flex size-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100"
          >
            <Bell className="size-5" />
          </button>
          <span className="size-9 shrink-0 overflow-hidden rounded-full bg-neutral-200">
            {user?.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="size-full object-cover" />
            )}
          </span>
        </div>
      </div>
    </nav>
  );
}
