import Link from "next/link";
import { Bell } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b border-neutral-200 px-4 sm:px-6">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2">
        <Link href="/" aria-label="Vertex" className="flex shrink-0 items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="size-6 text-primary-500">
            <path d="M2 3h4l6 14 6-14h4L14 21h-4L2 3z" fill="currentColor" />
          </svg>
          <span className="hidden font-display text-base font-bold text-neutral-900 min-[375px]:inline sm:text-lg">
            Vertex
          </span>
        </Link>
        <div className="flex items-center gap-3 whitespace-nowrap text-sm font-medium text-neutral-700 sm:gap-6">
          <Link href="/courses" className="hover:text-primary-500">
            Courses
          </Link>
          <Link href="/my-learning" className="hover:text-primary-500">
            My Learning
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <span
            aria-hidden="true"
            className="hidden size-9 items-center justify-center rounded-full text-neutral-700 sm:flex"
          >
            <Bell className="size-5" />
          </span>
          <Show when="signed-out">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline-flex">
                <SignInButton mode="modal">
                  <Button variant="text" className="h-9">
                    Sign in
                  </Button>
                </SignInButton>
              </span>
              <SignUpButton mode="modal">
                <Button variant="primary" className="h-9 px-3.5">
                  Sign up
                </Button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}
