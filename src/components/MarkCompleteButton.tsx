"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { markLessonComplete } from "@/app/actions/progress"

interface Props {
  courseSlug: string
  lessonSlug: string
  nextLessonSlug?: string
  isCompleted?: boolean
}

export default function MarkCompleteButton({ courseSlug, lessonSlug, nextLessonSlug, isCompleted }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    try {
      setLoading(true)
      await markLessonComplete(courseSlug, lessonSlug)
      if (nextLessonSlug) {
        router.push(`/course/${courseSlug}/${nextLessonSlug}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      style={{
        background: isCompleted ? 'var(--bg-elevated)' : 'var(--accent)',
        color: isCompleted ? 'var(--text-primary)' : 'white',
        border: isCompleted ? '1px solid var(--border-color)' : 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s',
      }}
      className="pagination-btn hover-glow"
    >
      {isCompleted ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Completed {nextLessonSlug && '• Continue →'}
        </>
      ) : (
        <>Mark Complete {nextLessonSlug && '& Continue →'}</>
      )}
    </button>
  )
}
