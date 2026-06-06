import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "ByteByteGo | Study Portal",
  description: "Offline study portal for ByteByteGo courses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const courses = getCourses();

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-container">
          <Sidebar courses={courses} />
          <main className="main-content fade-in">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
