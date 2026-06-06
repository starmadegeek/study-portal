import fs from 'fs';
import path from 'path';
import type { Course, Lesson } from './types';

function createSafeSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/\.html$/, '') // remove explicit extension if present
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumerics with hyphens
    .replace(/(^-|-$)/g, ''); // trim hyphens at ends
}

export function getCourses(): Course[] {
  const coursesDir = path.join(process.cwd(), 'public', 'courses');
  
  if (!fs.existsSync(coursesDir)) {
    return [];
  }

  const courseFolders = fs.readdirSync(coursesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const courses: Course[] = courseFolders.map(folderName => {
    const coursePath = path.join(coursesDir, folderName);
    const files = fs.readdirSync(coursePath);
    
    const lessons: Lesson[] = files
      .filter(f => f.endsWith('.html'))
      .map(filename => {
        const match = filename.match(/^(\d+)_(.+)\.html$/);
        const order = match ? parseInt(match[1], 10) : 999;
        const rawTitle = match ? match[2] : filename.replace('.html', '');
        
        return {
          title: rawTitle.replace(/-/g, ' '),
          slug: createSafeSlug(rawTitle), 
          filename,
          order
        };
      })
      .sort((a, b) => a.order - b.order);

    return {
      title: folderName.replace(/-/g, ' '),
      slug: createSafeSlug(folderName),
      folderName,
      lessons
    };
  });

  return courses;
}
