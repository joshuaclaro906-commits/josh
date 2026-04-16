
import { useState, useEffect } from 'react';
import { User, AcademicData, AcademicTerm } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { parseExcel, processAcademicExcel } from '../lib/excel';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileUp, GraduationCap, Loader2, CheckCircle2, Star, AlertCircle } from 'lucide-react';

interface AcademicModuleProps {
  user: User;
}

export default function AcademicModule({ user }: AcademicModuleProps) {
  const [records, setRecords] = useState<AcademicData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(user.assignedClasses[0] || '');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | ''>('');

  useEffect(() => {
    if (!selectedClass) return;

    const path = 'academic_records';
    const q = query(
      collection(db, path),
      where('grade', '==', selectedClass),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcademicData));
      setRecords(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [selectedClass]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      toast.error("Please select Class, Subject, and Term first");
      return;
    }

    setLoading(true);
    try {
      const file = acceptedFiles[0];
      const jsonData = await parseExcel(file);
      const processedData = processAcademicExcel(
        jsonData,
        selectedTerm as AcademicTerm,
        selectedSubject,
        selectedClass,
        'Section Placeholder',
        user.uid
      );

      const path = 'academic_records';
      for (const record of processedData) {
        try {
          await addDoc(collection(db, path), record);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }

      // Mock Drive Upload
      await fetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          folderPath: `${selectedClass}/${selectedSubject}/${selectedTerm}`
        })
      });

      toast.success(`Successfully uploaded ${processedData.length} records`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to process Excel file");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  } as any);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 sleek-panel">
          <div className="sleek-panel-header">
            <span className="sleek-panel-title">Upload Academic Grades</span>
          </div>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {user.assignedClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {user.assignedSubjects[selectedClass]?.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Term</label>
              <Select value={selectedTerm} onValueChange={(v) => setSelectedTerm(v as AcademicTerm)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div 
              {...getRootProps()} 
              className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
              } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                ) : (
                  <FileUp className="w-8 h-8 text-slate-400" />
                )}
                <p className="text-xs font-bold text-slate-600">
                  {isDragActive ? "Drop the file here" : "Drag & drop Excel file"}
                </p>
                <p className="text-[10px] text-slate-400">.xlsx or .xls templates only</p>
              </div>
            </div>
          </CardContent>
        </div>

        <div className="md:col-span-2 sleek-panel">
          <div className="sleek-panel-header">
            <span className="sleek-panel-title">Academic Records</span>
            <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold">
              {records.length} Records
            </Badge>
          </div>
          <div className="p-4">
            <div className="sleek-privacy-banner">
              <AlertCircle className="w-3.5 h-3.5" />
              ⚠️ Privacy Mode Active: Student names and LRNs are permanently hashed.
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-200">
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Learner ID</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Subject</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Term</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Grade</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Skills</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs">
                        No records found for this class.
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id} className="border-slate-100">
                        <TableCell><span className="sleek-id-tag">{record.studentId}</span></TableCell>
                        <TableCell className="text-[11px] font-bold text-slate-600 uppercase">{record.subject}</TableCell>
                        <TableCell className="text-[11px] font-medium text-slate-500">{record.term}</TableCell>
                        <TableCell className="text-right font-bold text-slate-900 text-xs">{record.gradeValue}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{record.masteredSkills.length} Mastered</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{record.leastMasteredSkills.length} Least Mastered</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
