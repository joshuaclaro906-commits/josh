
import { useState } from 'react';
import { User } from '../types';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  GraduationCap, 
  BrainCircuit, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Settings,
  ShieldCheck
} from 'lucide-react';
import AssessmentModule from './AssessmentModule';
import AcademicModule from './AcademicModule';
import AIAnalytics from './AIAnalytics';
import AdminDashboard from './AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function Dashboard({ user, setUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'academic' | 'ai' | 'admin'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'assessment', label: 'Assessments', icon: ClipboardCheck },
    { id: 'academic', label: 'Academic Grades', icon: GraduationCap },
    { id: 'ai', label: 'AI Insights', icon: BrainCircuit },
  ];

  if (user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-[240px] bg-sidebar text-sidebar-foreground flex flex-col z-30"
          >
            <div className="p-6 flex flex-col gap-1 border-b border-sidebar-accent/30 mb-4">
              <h1 className="font-bold text-white text-sm tracking-wider uppercase">Tagbac Elem. School</h1>
              <p className="text-[10px] text-slate-400 font-medium">LID: 112973 | Ragay 1</p>
            </div>

            <nav className="flex-1 px-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm ${
                    activeTab === item.id
                      ? 'bg-sidebar-accent text-white font-medium'
                      : 'text-slate-400 hover:bg-sidebar-accent/50 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4.5 h-4.5 opacity-70" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 mt-auto">
              <div className="bg-sidebar-accent/40 rounded-lg p-3 text-[11px] text-slate-300">
                <p className="font-bold text-white mb-1">Google Drive Linked</p>
                <p className="opacity-80">clarojosh@gmail.com</p>
                <p className="opacity-80">Auto-sync active</p>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10 h-9 px-2 mt-2"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium">Sign Out</span>
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="header-title">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {activeTab === 'admin' ? 'Administrative Dashboard' : 'Teacher Dashboard'}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Key Stage 1 & 2 Performance Analysis | School Year 2023-24
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="user-profile flex items-center gap-3">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px] uppercase tracking-wider">
                {user.position}
              </span>
              <strong className="text-sm font-bold text-slate-800">{user.fullName}</strong>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5 text-slate-500" />
            </Button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="sleek-stat-card">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Learners</div>
                      <div className="text-2xl font-bold text-slate-900">412</div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-1">Anonymized Registry Active</div>
                    </div>
                    <div className="sleek-stat-card">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assessment Sync</div>
                      <div className="text-2xl font-bold text-slate-900">BOSY</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1">Extraction Complete</div>
                    </div>
                    <div className="sleek-stat-card">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mastery Rate</div>
                      <div className="text-2xl font-bold text-slate-900">76.4%</div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-1">↑ 4.2% from previous term</div>
                    </div>
                    <div className="sleek-stat-card">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">At-Risk Alerts</div>
                      <div className="text-2xl font-bold text-slate-900">14</div>
                      <div className="text-[10px] text-red-500 font-bold mt-1">Requires Intervention</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="sleek-panel">
                      <div className="sleek-panel-header">
                        <span className="sleek-panel-title">Quick Actions</span>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col gap-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                          onClick={() => setActiveTab('assessment')}
                        >
                          <ClipboardCheck className="w-5 h-5 text-blue-600" />
                          <span className="text-xs font-bold">Upload Assessment</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col gap-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                          onClick={() => setActiveTab('academic')}
                        >
                          <GraduationCap className="w-5 h-5 text-indigo-600" />
                          <span className="text-xs font-bold">Upload Grades</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="sleek-panel">
                      <div className="sleek-panel-header">
                        <span className="sleek-panel-title">Teaching Load</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {user.assignedClasses.map(cls => (
                          <div key={cls} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-xs font-bold text-slate-700">{cls}</span>
                            <div className="flex gap-1 flex-wrap justify-end">
                              {user.assignedSubjects[cls]?.map(sub => (
                                <span key={sub} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-500 uppercase">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assessment' && <AssessmentModule user={user} />}
              {activeTab === 'academic' && <AcademicModule user={user} />}
              {activeTab === 'ai' && <AIAnalytics user={user} />}
              {activeTab === 'admin' && <AdminDashboard user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
