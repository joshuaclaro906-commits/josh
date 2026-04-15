
import { useState } from 'react';
import { User, AssessmentData, AcademicData } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { analyzeClassPerformance } from '../lib/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BrainCircuit, Sparkles, FileText, Download, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AIAnalyticsProps {
  user: User;
}

export default function AIAnalytics({ user }: AIAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState(user.assignedClasses[0] || '');

  const handleGenerateAnalysis = async () => {
    if (!selectedClass) {
      toast.error("Please select a class first");
      return;
    }

    setLoading(true);
    try {
      // Fetch data for the selected class
      const assessmentsQuery = query(collection(db, 'assessments'), where('grade', '==', selectedClass));
      const academicQuery = query(collection(db, 'academic_records'), where('grade', '==', selectedClass));

      const [assessmentsSnap, academicSnap] = await Promise.all([
        getDocs(assessmentsQuery),
        getDocs(academicQuery)
      ]);

      const assessments = assessmentsSnap.docs.map(doc => doc.data() as AssessmentData);
      const academicRecords = academicSnap.docs.map(doc => doc.data() as AcademicData);

      if (assessments.length === 0 && academicRecords.length === 0) {
        toast.error("No data available for this class to analyze");
        setLoading(false);
        return;
      }

      const result = await analyzeClassPerformance(assessments, academicRecords);
      setAnalysis(result);
      toast.success("AI Analysis generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-600" />
              AI Analytics Engine
            </CardTitle>
            <CardDescription>Generate data-driven insights for your classes</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {user.assignedClasses.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerateAnalysis} 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <div className="space-y-4">
              <div className="sleek-ai-box">
                <div className="ai-title flex items-center gap-2 text-blue-700 font-bold text-xs mb-2">
                  <Sparkles className="w-4 h-4" />
                  AI-Driven Performance Insight
                </div>
                <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-blue-900 font-medium">
                  {analysis}
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  Privacy Mode Active: Analysis performed on anonymized registry data.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Ready to analyze?</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Select a class and click "Generate Insights" to get AI-driven recommendations and performance summaries.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
