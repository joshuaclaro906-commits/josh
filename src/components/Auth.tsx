
import * as React from 'react';
import { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { User, UserPosition } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { School, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const GRADE_SUBJECTS: { [key: string]: string[] } = {
  'Kinder': ['ELAK'],
  'Grade 1': ['Language', 'Reading & Literacy', 'Math', 'Makabansa', 'GMRC'],
  'Grade 2': ['Filipino', 'English', 'Math', 'Makabansa', 'GMRC'],
  'Grade 3': ['Filipino', 'English', 'Math', 'Science', 'Makabansa', 'GMRC'],
  'Grade 4': ['Filipino', 'English', 'Math', 'Science', 'AP', 'TLE', 'GMRC', 'MAPEH'],
  'Grade 5': ['Filipino', 'English', 'Math', 'Science', 'AP', 'TLE', 'GMRC', 'MAPEH'],
  'Grade 6': ['Filipino', 'English', 'Math', 'Science', 'AP', 'TLE', 'GMRC', 'MAPEH'],
};

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [position, setPosition] = useState<UserPosition>('Teacher 1');
  const [isAdviser, setIsAdviser] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting Auth Process:", isLogin ? "Login" : "Register", email);
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Profile fetching is handled in App.tsx via onAuthStateChanged
        toast.success("Welcome back!");
      } else {
        // Signup logic
        // Password is generated from Employee Number if not provided
        const finalPassword = password || employeeNumber;
        if (!finalPassword) {
          toast.error("Employee Number is required to generate password");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, finalPassword);
        const firebaseUser = userCredential.user;

        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          fullName,
          employeeNumber,
          position,
          isAdviser,
          advisoryClass: isAdviser ? selectedGrade : undefined,
          assignedClasses: selectedGrade ? [selectedGrade] : [],
          assignedSubjects: selectedGrade ? { [selectedGrade]: GRADE_SUBJECTS[selectedGrade] || [] } : {},
          role: (position === 'School Principal I' || position === 'Master Teacher I') ? 'admin' : 'teacher',
        };

        // Special Kinder Rule
        if (selectedGrade === 'Kinder') {
          userData.advisoryClass = 'Kinder (Lily & Lotus)';
          userData.assignedClasses = ['Kinder-Lily', 'Kinder-Lotus'];
        }

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        onAuthSuccess(userData);
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      console.error("Auth Error Details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
            <School className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tagbac Elementary School</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Data Management & Analytics System</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 pb-6">
            <div className="flex p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all tracking-wider ${
                  isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all tracking-wider ${
                  !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                REGISTER
              </button>
            </div>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Juan Dela Cruz"
                      className="h-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="employeeNumber" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee Number</Label>
                    <Input
                      id="employeeNumber"
                      placeholder="1234567"
                      className="h-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                      value={employeeNumber}
                      onChange={(e) => setEmployeeNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="position" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Position</Label>
                    <Select value={position} onValueChange={(v) => setPosition(v as UserPosition)}>
                      <SelectTrigger className="h-10 border-slate-200">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teacher 1">Teacher 1</SelectItem>
                        <SelectItem value="Teacher 2">Teacher 2</SelectItem>
                        <SelectItem value="Teacher 3">Teacher 3</SelectItem>
                        <SelectItem value="Teacher 4">Teacher 4</SelectItem>
                        <SelectItem value="Teacher 5">Teacher 5</SelectItem>
                        <SelectItem value="Teacher 6">Teacher 6</SelectItem>
                        <SelectItem value="Teacher 7">Teacher 7</SelectItem>
                        <SelectItem value="Master Teacher I">Master Teacher I</SelectItem>
                        <SelectItem value="School Principal I">School Principal I</SelectItem>
                        <SelectItem value="Administrative Officer II">Administrative Officer II</SelectItem>
                        <SelectItem value="Admin Aide">Admin Aide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="grade" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Class Assignment</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="h-10 border-slate-200">
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kinder">Kinder (Lily & Lotus)</SelectItem>
                        <SelectItem value="Grade 1">Grade 1</SelectItem>
                        <SelectItem value="Grade 2">Grade 2</SelectItem>
                        <SelectItem value="Grade 3">Grade 3</SelectItem>
                        <SelectItem value="Grade 4">Grade 4</SelectItem>
                        <SelectItem value="Grade 5">Grade 5</SelectItem>
                        <SelectItem value="Grade 6">Grade 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="isAdviser"
                      checked={isAdviser}
                      onCheckedChange={(v) => setIsAdviser(!!v)}
                    />
                    <Label htmlFor="isAdviser" className="text-xs font-bold text-slate-600 leading-none cursor-pointer">
                      I am the Class Adviser
                    </Label>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isLogin ? "••••••••" : "Leave blank to use Employee Number"}
                  className="h-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={isLogin}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6 flex flex-col gap-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-xs font-bold tracking-wider shadow-lg shadow-blue-200" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isLogin ? (
                  <LogIn className="w-4 h-4 mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isLogin ? "SIGN IN TO SYSTEM" : "COMPLETE REGISTRATION"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
