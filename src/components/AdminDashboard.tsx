
import { useState, useEffect } from 'react';
import { User, AssessmentData, AcademicData } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Users, School, TrendingUp, BookOpen, Loader2 } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalAssessments: 0,
    totalAcademicRecords: 0,
    gradePerformance: [] as any[],
    subjectPerformance: [] as any[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersSnap, assessmentsSnap, academicSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'assessments')),
          getDocs(collection(db, 'academic_records'))
        ]);

        const assessments = assessmentsSnap.docs.map(doc => doc.data() as AssessmentData);
        const academic = academicSnap.docs.map(doc => doc.data() as AcademicData);

        // Calculate stats
        const gradeMap: { [key: string]: { total: number, count: number } } = {};
        academic.forEach(record => {
          if (!gradeMap[record.grade]) gradeMap[record.grade] = { total: 0, count: 0 };
          gradeMap[record.grade].total += record.gradeValue;
          gradeMap[record.grade].count += 1;
        });

        const gradePerformance = Object.entries(gradeMap).map(([name, data]) => ({
          name,
          avg: Math.round(data.total / data.count)
        }));

        setStats({
          totalTeachers: usersSnap.size,
          totalAssessments: assessmentsSnap.size,
          totalAcademicRecords: academicSnap.size,
          gradePerformance,
          subjectPerformance: [] // Simplified for now
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="sleek-stat-card">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Faculty</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-slate-900">{stats.totalTeachers}</div>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="sleek-stat-card">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assessments</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-slate-900">{stats.totalAssessments}</div>
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        <div className="sleek-stat-card">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Academic Records</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-slate-900">{stats.totalAcademicRecords}</div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="sleek-stat-card">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">School ID</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-slate-900">112973</div>
            <School className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sleek-panel">
          <div className="sleek-panel-header">
            <span className="sleek-panel-title">Grade Level Performance</span>
          </div>
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.gradePerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="avg" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sleek-panel">
          <div className="sleek-panel-header">
            <span className="sleek-panel-title">Performance Trends</span>
          </div>
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'BOSY', score: 65 },
                { name: 'MOSY', score: 78 },
                { name: 'EOSY', score: 88 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
