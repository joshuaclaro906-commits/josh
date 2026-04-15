
import * as XLSX from 'xlsx';
import { AssessmentData, AcademicData, AssessmentType, AssessmentPeriod, AcademicTerm } from '../types';

export const parseExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      resolve(jsonData);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const anonymizeStudent = (grade: string, section: string, index: number): string => {
  // Format: [GRADE]-[SECTION]-[INDEX]
  // Example: G3-ZIN-01
  const gradeCode = grade.startsWith('Grade') ? `G${grade.split(' ')[1]}` : grade.charAt(0).toUpperCase();
  const sectionCode = section.substring(0, 3).toUpperCase();
  const indexStr = index.toString().padStart(2, '0');
  return `${gradeCode}-${sectionCode}-${indexStr}`;
};

export const processAssessmentExcel = (
  jsonData: any[], 
  type: AssessmentType, 
  period: AssessmentPeriod, 
  grade: string, 
  section: string,
  teacherId: string
): AssessmentData[] => {
  return jsonData.map((row, index) => {
    // We assume the score is in a column named "Score" or similar
    // In a real app, we'd have more robust mapping
    const score = row.Score || row.score || row.Result || row.result || 0;
    
    return {
      studentId: anonymizeStudent(grade, section, index + 1),
      type,
      period,
      score: Number(score),
      grade,
      section,
      teacherId,
      timestamp: new Date().toISOString(),
    };
  });
};

export const processAcademicExcel = (
  jsonData: any[], 
  term: AcademicTerm, 
  subject: string,
  grade: string, 
  section: string,
  teacherId: string
): AcademicData[] => {
  return jsonData.map((row, index) => {
    const gradeValue = row.Grade || row.grade || row.Average || row.average || 0;
    const mastered = row.Mastered || row.mastered || "";
    const leastMastered = row.LeastMastered || row.leastMastered || "";

    return {
      studentId: anonymizeStudent(grade, section, index + 1),
      term,
      subject,
      gradeValue: Number(gradeValue),
      masteredSkills: mastered ? String(mastered).split(',').map(s => s.trim()) : [],
      leastMasteredSkills: leastMastered ? String(leastMastered).split(',').map(s => s.trim()) : [],
      grade,
      section,
      teacherId,
      timestamp: new Date().toISOString(),
    };
  });
};
