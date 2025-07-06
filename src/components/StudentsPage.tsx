import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  BookOpen, 
  TrendingUp,
  Award,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Student {
  id: string;
  name: string;
  grade: string;
  rollNumber: string;
  attendance: number;
  performance: number;
  lastActive: string;
  subjects: string[];
  avatar?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const StudentsPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const students: Student[] = [
    {
      id: '1',
      name: 'Arun Kumar',
      grade: 'Grade 3',
      rollNumber: '2024001',
      attendance: 95,
      performance: 88,
      lastActive: '2024-01-15',
      subjects: ['Tamil', 'Mathematics', 'Science'],
      email: 'arun.kumar@school.edu',
      phone: '+91 9876543210',
      address: 'Chennai, Tamil Nadu'
    },
    {
      id: '2',
      name: 'Priya Devi',
      grade: 'Grade 3',
      rollNumber: '2024002',
      attendance: 92,
      performance: 94,
      lastActive: '2024-01-15',
      subjects: ['Tamil', 'Mathematics', 'English'],
      email: 'priya.devi@school.edu',
      phone: '+91 9876543211',
      address: 'Coimbatore, Tamil Nadu'
    },
    {
      id: '3',
      name: 'Karthik Raja',
      grade: 'Grade 4',
      rollNumber: '2024003',
      attendance: 88,
      performance: 76,
      lastActive: '2024-01-14',
      subjects: ['Tamil', 'Science', 'Social Studies'],
      email: 'karthik.raja@school.edu',
      phone: '+91 9876543212',
      address: 'Madurai, Tamil Nadu'
    },
    {
      id: '4',
      name: 'Meera Lakshmi',
      grade: 'Grade 2',
      rollNumber: '2024004',
      attendance: 97,
      performance: 91,
      lastActive: '2024-01-15',
      subjects: ['Tamil', 'Mathematics'],
      email: 'meera.lakshmi@school.edu',
      phone: '+91 9876543213',
      address: 'Trichy, Tamil Nadu'
    },
    {
      id: '5',
      name: 'Rajesh Kumar',
      grade: 'Grade 5',
      rollNumber: '2024005',
      attendance: 89,
      performance: 82,
      lastActive: '2024-01-14',
      subjects: ['Tamil', 'Mathematics', 'Science', 'English'],
      email: 'rajesh.kumar@school.edu',
      phone: '+91 9876543214',
      address: 'Salem, Tamil Nadu'
    },
    {
      id: '6',
      name: 'Divya Bharathi',
      grade: 'Grade 1',
      rollNumber: '2024006',
      attendance: 94,
      performance: 87,
      lastActive: '2024-01-15',
      subjects: ['Tamil', 'Mathematics'],
      email: 'divya.bharathi@school.edu',
      phone: '+91 9876543215',
      address: 'Erode, Tamil Nadu'
    }
  ];

  const gradeStats = [
    { grade: 'Grade 1', count: 45, avgPerformance: 82 },
    { grade: 'Grade 2', count: 52, avgPerformance: 85 },
    { grade: 'Grade 3', count: 48, avgPerformance: 87 },
    { grade: 'Grade 4', count: 41, avgPerformance: 84 },
    { grade: 'Grade 5', count: 38, avgPerformance: 89 }
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.includes(searchTerm);
    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const totalStudents = students.length;
  const avgAttendance = Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length);
  const avgPerformance = Math.round(students.reduce((sum, s) => sum + s.performance, 0) / students.length);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage and track your students' progress</p>
        </div>
        <motion.button
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 w-full sm:w-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{avgAttendance}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">{avgPerformance}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Grade Statistics */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade-wise Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {gradeStats.map((stat, index) => (
            <div key={stat.grade} className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{stat.grade}</h4>
              <p className="text-2xl font-bold text-primary mt-2">{stat.count}</p>
              <p className="text-sm text-gray-600">students</p>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Avg Performance</p>
                <p className="text-sm font-medium text-secondary">{stat.avgPerformance}%</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Grades</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
            </select>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{student.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                    <span>{student.grade}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Roll: {student.rollNumber}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs sm:text-sm">Last active: {student.lastActive}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {student.subjects.slice(0, 3).map((subject, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {subject}
                      </span>
                    ))}
                    {student.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{student.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Attendance</p>
                    <p className="font-medium text-green-600">{student.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Performance</p>
                    <p className="font-medium text-blue-600">{student.performance}%</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleViewStudent(student)}
                  >
                    <Eye className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {showStudentModal && selectedStudent && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowStudentModal(false)}
        >
          <motion.div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Student Details</h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h4>
                  <p className="text-gray-600">{selectedStudent.grade} • Roll: {selectedStudent.rollNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{selectedStudent.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedStudent.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Subjects</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.subjects.map((subject, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Performance Metrics</h5>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Attendance</span>
                          <span>{selectedStudent.attendance}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${selectedStudent.attendance}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Performance</span>
                          <span>{selectedStudent.performance}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${selectedStudent.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Recent Activity</h5>
                    <p className="text-sm text-gray-600">Last active: {selectedStudent.lastActive}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};