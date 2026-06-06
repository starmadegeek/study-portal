"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Course, Lesson } from '../lib/types';

export default function Sidebar({ courses }: { courses: Course[] }) {
  const pathname = usePathname();
  
  // Auto-expand the course that matches the current pathname
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    courses.forEach(c => {
      // expand if any of its lessons are the current path, or just expand the first course by default
      const isActive = c.lessons.some(l => `/course/${encodeURIComponent(c.slug)}/${encodeURIComponent(l.slug)}` === pathname);
      initialState[c.slug] = isActive || c.slug === courses[0]?.slug;
    });
    return initialState;
  });

  const toggleCourse = (slug: string) => {
    setExpandedCourses(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <aside className="sidebar-wrapper">
      <div className="sidebar-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: 'var(--accent)'}}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        Study Portal
      </div>
      <div className="sidebar-content">
        {courses.map(course => (
          <div key={course.slug} className="course-group">
            <div 
              className="course-title" 
              onClick={() => toggleCourse(course.slug)}
              data-expanded={expandedCourses[course.slug]}
            >
              <span>{course.title}</span>
              <svg 
                className="course-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
            <ul 
              className="lesson-list" 
              data-expanded={expandedCourses[course.slug]}
            >
              {course.lessons.map(lesson => {
                const href = `/course/${encodeURIComponent(course.slug)}/${encodeURIComponent(lesson.slug)}`;
                const isActive = pathname === href;
                return (
                  <li key={lesson.slug}>
                    <Link href={href} className="lesson-item" data-active={isActive}>
                      {lesson.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
