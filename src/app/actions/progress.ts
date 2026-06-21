"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function markLessonComplete(courseSlug: string, lessonSlug: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("You must be logged in to track progress")
  }

  await prisma.lessonProgress.upsert({
    where: {
      userId_courseSlug_lessonSlug: {
        userId: session.user.id,
        courseSlug,
        lessonSlug,
      }
    },
    create: {
      userId: session.user.id,
      courseSlug,
      lessonSlug,
    },
    update: {
      completedAt: new Date()
    }
  })

  revalidatePath(`/course/${courseSlug}`)
  revalidatePath(`/`)
  
  return { success: true }
}

export async function getCompletedLessons(courseSlug?: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return []
  }

  const whereClause = courseSlug 
    ? { userId: session.user.id, courseSlug } 
    : { userId: session.user.id }

  const progress = await prisma.lessonProgress.findMany({
    where: whereClause,
    select: {
      courseSlug: true,
      lessonSlug: true,
      completedAt: true,
    }
  })

  return progress
}
