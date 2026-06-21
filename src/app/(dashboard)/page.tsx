import Link from 'next/link';
import { getCourses } from '@/lib/courses';
import { auth } from '@/lib/auth';
import { getCompletedLessons } from '@/app/actions/progress';

export default async function HomePage() {
  const session = await auth();
  const courses = getCourses();
  const completedLessons = await getCompletedLessons();

  if (!session?.user) {
    return null;
  }

  // Calculate course progress
  const coursesWithProgress = courses.map(course => {
    const courseCompletedCount = completedLessons.filter(l => l.courseSlug === course.slug).length;
    const totalLessons = course.lessons.length;
    const progressPercent = totalLessons === 0 ? 0 : Math.round((courseCompletedCount / totalLessons) * 100);
    
    // Find next uncompleted lesson
    const completedSlugs = new Set(completedLessons.filter(l => l.courseSlug === course.slug).map(l => l.lessonSlug));
    const nextLesson = course.lessons.find(l => !completedSlugs.has(l.slug)) || course.lessons[0];

    return {
      ...course,
      courseCompletedCount,
      totalLessons,
      progressPercent,
      nextLesson,
      isOngoing: progressPercent > 0 && progressPercent < 100,
      isCompleted: progressPercent === 100
    };
  });

  const ongoingCourses = coursesWithProgress.filter(c => c.isOngoing);
  const otherCourses = coursesWithProgress.filter(c => !c.isOngoing);

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%', height: '100%', overflowY: 'auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '8px' }}>
          Welcome back, {session.user.name?.split(' ')[0] || 'Friend'} 👋
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Ready to master system design? Pick up where you left off or start a new challenge.
        </p>
      </header>

      {ongoingCourses.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></span>
            Resume Learning
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {ongoingCourses.map(course => (
              <Link key={course.slug} href={`/course/${encodeURIComponent(course.slug)}/${encodeURIComponent(course.nextLesson?.slug || '')}`} style={{ textDecoration: 'none' }}>
                <div className="course-card ongoing-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'var(--accent)', background: 'linear-gradient(180deg, var(--bg-hover) 0%, var(--bg-sidebar) 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {course.title}
                    </h3>
                    <span style={{ fontSize: '0.8rem', padding: '4px 10px', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '12px', fontWeight: 500 }}>
                      In Progress
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ opacity: 0.7 }}>Up next:</span> <span style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.nextLesson?.title}</span>
                  </p>
                  
                  {/* Progress Bar */}
                  <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                      <span>{course.progressPercent}% Complete</span>
                      <span>{course.courseCompletedCount} / {course.totalLessons}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-active)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${course.progressPercent}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '20px' }}>
          {ongoingCourses.length > 0 ? 'Explore Other Courses' : 'Available Courses'}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {otherCourses.map(course => (
            <Link key={course.slug} href={`/course/${encodeURIComponent(course.slug)}/${encodeURIComponent(course.nextLesson?.slug || '')}`} style={{ textDecoration: 'none' }}>
              <div className="course-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: course.isCompleted ? 0.7 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                    {course.title}
                  </h3>
                  {course.isCompleted && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: 'var(--bg-active)', color: 'var(--text-secondary)', borderRadius: '12px' }}>
                      Completed
                    </span>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-active)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${course.progressPercent}%`, height: '100%', backgroundColor: course.isCompleted ? 'var(--text-secondary)' : 'var(--accent)', transition: 'width 0.3s' }} />
                  </div>
                  {!course.isCompleted && course.progressPercent === 0 && (
                     <div style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '12px', fontWeight: 500 }}>
                       Start Course →
                     </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
