import Sidebar from "@/components/Sidebar";
import { getCourses } from "@/lib/courses";
import { getCompletedLessons } from "@/app/actions/progress";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const courses = getCourses();
  const completedLessons = await getCompletedLessons();

  return (
    <div className="app-container">
      <Sidebar courses={courses} completedLessons={completedLessons} />
      <main className="main-content fade-in">
        {children}
      </main>
    </div>
  );
}
