import Sidebar from "@/components/Sidebar";
import { getCourses } from "@/lib/courses";
import { getCompletedLessons } from "@/app/actions/progress";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
