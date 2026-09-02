export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
}

export type UserRole = 'admin' | 'student';

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  dob: string;
  gender: string;
  subject: string;
  class: string;
  semester: string;
  mobile: string;
  whatsapp?: string;
  address: string;
  admissionDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  rollNumber?: string;
  dateOfJoining?: string;
  avatarUrl?: string;
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: 'paid' | 'unpaid';
  month: string;
  paymentMethod?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: 'Electricity' | 'Rent' | 'Salary' | 'Others';
  description?: string;
}

export interface Attendance {
  id: string;
  date: string;
  studentId: string;
  status: 'present' | 'absent';
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  durationMinutes: number;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'note';
  url: string;
  uploadDate: string;
  description?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

export interface DueFee {
  id: string;
  studentId: string;
  amount: number;
  remarks: string;
  date: string;
}

export interface ExternalTest {
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
}

export interface ResultLink {
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
}
