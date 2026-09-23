import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { PostHogIdentity } from "@/components/PostHogIdentity";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vertex",
  description: "A unified design language for Vertex learning platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#f97316",
              colorForeground: "#0f172a",
              colorBackground: "#ffffff",
              borderRadius: "12px",
              fontFamily: "var(--font-inter), Arial, Helvetica, sans-serif",
            },
          }}
        >
          <PostHogIdentity />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
