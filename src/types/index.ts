
export type UserPosition = 'Teacher 1' | 'Teacher 2' | 'Teacher 3' | 'Teacher 4' | 'Teacher 5' | 'Teacher 6' | 'Teacher 7' | 'Master Teacher I' | 'School Principal I' | 'Administrative Officer II' | 'Admin Aide';

export interface User {
  uid: string;
  email: string;
  fullName: string;
  employeeNumber: string;
  position: UserPosition;
  isAdviser: boolean;
  advisoryClass?: string; // e.g., "Grade 3-Zinnia"
  assignedClasses: string[]; // e.g., ["Grade 3-Zinnia", "Grade 4-Acacia"]
  assignedSubjects: { [className: string]: string[] };
  role: 'admin' | 'teacher';
}

export type AssessmentType = 'CRLA' | 'Phil-IRI' | 'RMA' | 'ELAK';
export type AssessmentPeriod = 'BOSY' | 'MOSY' | 'EOSY';
export type AcademicTerm = 'Term 1' | 'Term 2' | 'Term 3';

export interface AnonymizedStudent {
  id: string; // [GRADE]-[SECTION]-[INDEX]
  grade: string;
  section: string;
  index: number;
}

export interface AssessmentData {
  id?: string;
  studentId: string; // Anonymized
  type: AssessmentType;
  period: AssessmentPeriod;
  score: number;
  subject?: string;
  grade: string;
  section: string;
  timestamp: any;
  teacherId: string;
}

export interface AcademicData {
  id?: string;
  studentId: string; // Anonymized
  term: AcademicTerm;
  subject: string;
  gradeValue: number;
  masteredSkills: string[];
  leastMasteredSkills: string[];
  grade: string;
  section: string;
  timestamp: any;
  teacherId: string;
}
