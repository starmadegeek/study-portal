import { getCourses } from '@/lib/courses';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import Link from 'next/link';
import TabsManager from '@/components/TabsManager';
import { getCompletedLessons } from '@/app/actions/progress';
import MarkCompleteButton from '@/components/MarkCompleteButton';

export async function generateStaticParams() {
  const courses = getCourses();
  const params: { courseSlug: string; lessonSlug: string }[] = [];

  for (const course of courses) {
    for (const lesson of course.lessons) {
      params.push({
        courseSlug: course.slug,
        lessonSlug: lesson.slug,
      });
    }
  }

  return params;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}) {
  const { courseSlug, lessonSlug } = await params;
  const courses = getCourses();
  const course = courses.find((c) => c.slug === courseSlug);
  const lesson = course?.lessons.find((l) => l.slug === lessonSlug);

  const completedLessons = await getCompletedLessons(courseSlug);
  const isCompleted = completedLessons.some((l: { lessonSlug: string }) => l.lessonSlug === lessonSlug);

  if (!course || !lesson) {
    notFound();
  }

  // Calculate generic paths
  const courseDir = path.join(process.cwd(), 'public', 'courses', course.folderName);
  const filePath = path.join(courseDir, lesson.filename);
  
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const rawHtml = fs.readFileSync(filePath, 'utf-8');
  
  // Use Cheerio to parse precisely the core content out
  const $ = cheerio.load(rawHtml);
  let contentHtml = '';
  
  const transformContainer = (container: cheerio.Cheerio<any>) => {
    // Rewrite image sources to load correctly from public folder path
    container.find('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.startsWith('images/')) {
        $(el).attr('src', `/courses/${encodeURIComponent(course.folderName)}/${src}`);
      } else if (src && src.startsWith('./images/')) {
        $(el).attr('src', `/courses/${encodeURIComponent(course.folderName)}/${src.replace('./images/', 'images/')}`);
      }
      // Remove srcset to force using the local src
      $(el).removeAttr('srcset');
      $(el).removeAttr('sizes');
    });

    // Handle Code Tabs BEFORE stripping classes
    container.find('.ant-tabs').each((tabsIdx, tabsContainer) => {
      const tabBtns = $(tabsContainer).find('.ant-tabs-tab-btn');
      
      const tabsHtml = $('<div class="custom-code-tabs"></div>');
      const navHtml = $('<div class="custom-tabs-nav"></div>');
      const contentHtml = $('<div class="custom-tabs-content"></div>');
      
      tabBtns.each((idx, btn) => {
        const langName = $(btn).text().trim();
        const correspondingPaneId = $(btn).attr('aria-controls');
        const isActive = idx === 0;
        
        // Add nav button
        const btnHtml = $(`<button class="custom-tab-btn ${isActive ? 'active' : ''}" data-target="tab-${tabsIdx}-${idx}">${langName}</button>`);
        navHtml.append(btnHtml);
        
        if (correspondingPaneId) {
          const pane = $(tabsContainer).find(`#${correspondingPaneId}`);
          if (pane.length) {
            // Clean up the pane
            pane.removeAttr('aria-hidden').removeAttr('style').removeAttr('class');
            pane.addClass(`custom-tab-pane ${isActive ? 'active' : ''}`);
            pane.attr('id', `tab-${tabsIdx}-${idx}`);
            contentHtml.append(pane);
          } else {
            // Fallback for languages missing from the scraped offline data
            const fallbackPane = $(`<div class="custom-tab-pane ${isActive ? 'active' : ''}" id="tab-${tabsIdx}-${idx}">
              <pre><code>// Code for ${langName} is not available in the downloaded offline data.</code></pre>
            </div>`);
            contentHtml.append(fallbackPane);
          }
        }
      });
      
      tabsHtml.append(navHtml);
      tabsHtml.append(contentHtml);
      
      // Replace original container with our custom tabs structure
      $(tabsContainer).replaceWith(tabsHtml);
    });

    // Handle Katex Math rendering to avoid duplicates
    // We remove the complex .katex-html since native MathML works better with stripped CSS
    container.find('.katex-html').remove();

    // Remove hidden elements (like inactive tabs that were not processed above)
    container.find('[aria-hidden="true"]').remove();
    container.find('[aria-selected="false"]').remove();
    container.find('[style*="display: none"]').remove();
    container.find('[style*="display:none"]').remove();

    // Remove native ByteByteGo pagination and mark complete buttons
    container.find('div, button, a').each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (
        text === 'Mark as Complete' || 
        text === '← Previous Lesson' || 
        text === 'Mark Complete & Continue →' ||
        text.includes('Previous Lesson') ||
        text.includes('Mark Complete & Continue')
      ) {
        $el.remove();
      }
    });

    // Remove specific classes so native Next.js CSS takes over cleanly, EXCEPT our custom tabs and their contents
    container.find('*').each((i, el) => {
      const $el = $(el);
      // Skip custom tabs classes and elements
      if ($el.hasClass('custom-code-tabs') || $el.hasClass('custom-tabs-nav') || 
          $el.hasClass('custom-tabs-content') || $el.hasClass('custom-tab-btn') || 
          $el.hasClass('custom-tab-pane')) {
        return;
      }
      
      // Preserve syntax highlighting classes if they start with hljs or language-
      const currentClass = $el.attr('class');
      if (currentClass && (currentClass.includes('hljs') || currentClass.includes('language-'))) {
        const preserveClasses = currentClass.split(' ').filter(c => c.startsWith('hljs') || c.startsWith('language-')).join(' ');
        $el.attr('class', preserveClasses);
      } else {
        $el.removeAttr('class');
      }
      
      // Always remove inline styles unless it's our pane
      $el.removeAttr('style');
    });
  };

  // They use article tags usually or content divs. Find the richest bulk of content:
  const article = $('article');
  if (article.length > 0) {
    transformContainer(article);
    contentHtml = article.html() || '';
  } else {
    // Fallback if no article tag was found
    const contentDiv = $('#content');
    if (contentDiv.length > 0) {
      transformContainer(contentDiv);
      contentHtml = contentDiv.html() || '';
    } else {
      contentHtml = '<p>Content body could not be isolated from source HTML.</p>';
    }
  }

  // Add Bottom Pagination functionality
  const currentIndex = course.lessons.findIndex(l => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflowY: 'auto' }}>
      {/* Top Header Strip */}
      <header style={{
        minHeight: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-base)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {course.title} <span style={{ margin: '0 8px' }}>/</span> 
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lesson.title}</span>
        </div>
      </header>

      {/* Native Rendered Source Content */}
      <div style={{ padding: '40px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '32px', lineHeight: 1.2 }}>{lesson.title}</h1>
        
        <div 
          className="lesson-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }} 
        />
        <TabsManager />
        
        {/* Next & Previous Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '60px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-color)',
          gap: '16px'
        }}>
          {prevLesson ? (
            <Link 
              href={`/course/${course.slug}/${prevLesson.slug}`}
              className="pagination-btn hover-glow"
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>← Previous Lesson</div>
              <div style={{ fontWeight: 500, marginTop: '4px' }}>{prevLesson.title}</div>
            </Link>
          ) : <div />}
          
          {nextLesson ? (
            <MarkCompleteButton 
              courseSlug={course.slug}
              lessonSlug={lesson.slug}
              nextLessonSlug={nextLesson.slug}
              isCompleted={isCompleted}
            />
          ) : (
            <MarkCompleteButton 
              courseSlug={course.slug}
              lessonSlug={lesson.slug}
              isCompleted={isCompleted}
            />
          )}
        </div>
      </div>
    </div>
  );
}
