export interface Lesson {
  title: string;
  slug: string;
  filename: string;
  order: number;
}

export interface Course {
  title: string;
  slug: string;
  folderName: string;
  lessons: Lesson[];
}
