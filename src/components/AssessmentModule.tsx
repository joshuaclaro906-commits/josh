
import { useState, useEffect } from 'react';
import { User, AssessmentData, AssessmentType, AssessmentPeriod } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { parseExcel, processAssessmentExcel } from '../lib/excel';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileUp, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AssessmentModuleProps {
  user: User;
}

export default function AssessmentModule({ user }: AssessmentModuleProps) {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(user.assignedClasses[0] || '');
  const [selectedType, setSelectedType] = useState<AssessmentType | ''>('');
  const [selectedPeriod, setSelectedPeriod] = useState<AssessmentPeriod | ''>('');

  useEffect(() => {
    if (!selectedClass) return;

    const q = query(
      collection(db, 'assessments'),
      where('grade', '==', selectedClass),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssessmentData));
      setAssessments(data);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [selectedClass]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!selectedClass || !selectedType || !selectedPeriod) {
      toast.error("Please select Class, Type, and Period first");
      return;
    }

    // Restrictions
    if (selectedClass.includes('Kinder') && selectedType !== 'ELAK') {
      toast.error("Kinder is restricted to ELAK only");
      return;
    }
    if (selectedClass === 'Grade 1' && selectedType === 'Phil-IRI') {
      toast.error("Grade 1 has no Phil-IRI");
      return;
    }
    if (['Grade 4', 'Grade 5', 'Grade 6'].some(g => selectedClass.includes(g)) && selectedType === 'CRLA') {
      toast.error("Grades 4-6 have no CRLA");
      return;
    }

    setLoading(true);
    try {
      const file = acceptedFiles[0];
      const jsonData = await parseExcel(file);
      const processedData = processAssessmentExcel(
        jsonData,
        selectedType as AssessmentType,
        selectedPeriod as AssessmentPeriod,
        selectedClass,
        'Section Placeholder', // In real app, extract from filename or sheet
        user.uid
      );

      // Batch upload (simplified)
      for (const record of processedData) {
        await addDoc(collection(db, 'assessments'), record);
      }

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
            <span className="sleek-panel-title">Upload Assessment</span>
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
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessment Type</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as AssessmentType)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRLA">CRLA</SelectItem>
                  <SelectItem value="Phil-IRI">Phil-IRI</SelectItem>
                  <SelectItem value="RMA">RMA</SelectItem>
                  <SelectItem value="ELAK">ELAK (Kinder)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period</label>
              <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as AssessmentPeriod)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOSY">BOSY (Beginning)</SelectItem>
                  <SelectItem value="MOSY">MOSY (Middle)</SelectItem>
                  <SelectItem value="EOSY (End)">EOSY (End)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div 
              {...getRootProps()} 
              className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
              } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
            <span className="sleek-panel-title">Assessment Records</span>
            <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold">
              {assessments.length} Records
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
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Type</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Period</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Score</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-400 text-xs">
                        No records found for this class.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assessments.map((record) => (
                      <TableRow key={record.id} className="border-slate-100">
                        <TableCell><span className="sleek-id-tag">{record.studentId}</span></TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-bold text-[9px] uppercase bg-slate-100 text-slate-600 border-none">
                            {record.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[11px] font-medium text-slate-500">{record.period}</TableCell>
                        <TableCell className="text-right font-bold text-slate-900 text-xs">{record.score}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Anonymized</span>
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
