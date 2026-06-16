import Link from 'next/link';
import { getCourses } from '@/lib/courses';

export default function HomePage() {
  const courses = getCourses();

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '16px' }}>
        Welcome back 👋
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Ready to master system design? Select a course below or from the sidebar to continue.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {courses.map(course => (
          <Link key={course.slug} href={`/course/${encodeURIComponent(course.slug)}/${encodeURIComponent(course.lessons[0]?.slug || '')}`} style={{ textDecoration: 'none' }}>
            <div className="course-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {course.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'auto' }}>
                {course.lessons.length} Lessons
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
