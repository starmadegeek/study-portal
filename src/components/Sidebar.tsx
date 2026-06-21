"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Course, Lesson } from '../lib/types';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';

export default function Sidebar({ courses, completedLessons = [] }: { courses: Course[], completedLessons?: { courseSlug: string, lessonSlug: string }[] }) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize and update expanded state based on pathname
  useEffect(() => {
    setExpandedCourses(prev => {
      const newState = { ...prev };
      courses.forEach(c => {
        const hasActiveLesson = c.lessons.some(l => 
          `/course/${encodeURIComponent(c.slug)}/${encodeURIComponent(l.slug)}` === pathname
        );
        if (hasActiveLesson) {
          newState[c.slug] = true;
        }
      });
      
      // If nothing is expanded and we're at home, expand first course
      if (Object.keys(newState).length === 0 && pathname === '/' && courses.length > 0) {
        newState[courses[0].slug] = true;
      }
      
      return newState;
    });
  }, [pathname, courses]);

  // Scroll active item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [pathname]);

  const toggleCourse = (slug: string) => {
    setExpandedCourses(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <aside className="sidebar-wrapper" ref={sidebarRef} data-collapsed={isCollapsed}>
      <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}>
        {!isCollapsed && (
          <div className="sidebar-brand-area">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', whiteSpace: 'nowrap' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: 'var(--accent)', flexShrink: 0}}>
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <span className="sidebar-title-text">Study Portal</span>
            </Link>
          </div>
        )}
        
        <div className="sidebar-controls" style={{ width: isCollapsed ? '100%' : 'auto', justifyContent: 'center' }}>
          {!isCollapsed && <ThemeToggle />}
          <button 
            className="sidebar-toggle-btn" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            data-collapsed={isCollapsed}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={isCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
            </svg>
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="sidebar-content">
          {courses.map(course => (
            <div key={course.slug} className="course-group">
              <div 
                className="course-title" 
                onClick={() => toggleCourse(course.slug)}
                data-expanded={expandedCourses[course.slug]}
              >
                <span style={{ flex: 1, marginRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {course.title}
                </span>
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
                  const isCompleted = completedLessons.some(c => c.courseSlug === course.slug && c.lessonSlug === lesson.slug);
                  return (
                    <li key={lesson.slug}>
                      <Link 
                        href={href} 
                        className="lesson-item" 
                        data-active={isActive}
                        ref={isActive ? activeItemRef : null}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                          <span>{lesson.title}</span>
                          {isCompleted && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
      
      {!isCollapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <AuthButton />
        </div>
      )}
    </aside>
  );
}
