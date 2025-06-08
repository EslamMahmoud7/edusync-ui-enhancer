import { useState, useEffect } from 'react';
import { GraduationCap, Filter } from 'lucide-react';
import { useAuth } from '../../Context/useAuth';
import { useToast } from '../../hooks/use-toast';
import { academicRecordsService } from '../../services/academicRecords';
import { AcademicRecordDTO, AssessmentType, AcademicRecordStatus } from '../../types/academic';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import SearchInput from '../../components/SearchInput';

export default function StudentAcademicRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AcademicRecordDTO[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchRecords(user.id);
    } else {
        setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery]);

  const fetchRecords = async (studentId: string) => {
    setLoading(true);
    try {
      const data = await academicRecordsService.getByStudentId(studentId);
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch academic records:', error);
      toast({
        title: "Error",
        description: "Failed to load your academic records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    if (!searchQuery) {
      setFilteredRecords(records);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = records.filter(record => 
      record.courseTitle.toLowerCase().includes(query) ||
      record.groupLabel.toLowerCase().includes(query) ||
      record.term.toLowerCase().includes(query)
    );
    setFilteredRecords(filtered);
  };

  const getAssessmentTypeLabel = (type: AssessmentType) => {
    return AssessmentType[type] || 'Unknown';
  };

  const getStatusLabel = (status: AcademicRecordStatus) => {
    return AcademicRecordStatus[status] || 'Unknown';
  };

  const getStatusColor = (status: AcademicRecordStatus) => {
    switch (status) {
      case AcademicRecordStatus.Pending: return 'text-yellow-600 bg-yellow-100';
      case AcademicRecordStatus.Provisional: return 'text-blue-600 bg-blue-100';
      case AcademicRecordStatus.Final: return 'text-purple-600 bg-purple-100';
      case AcademicRecordStatus.Graded: return 'text-green-600 bg-green-100';
      case AcademicRecordStatus.Excused: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateGPA = () => {
    const gradedRecords = records.filter(r => r.status === AcademicRecordStatus.Graded || r.status === AcademicRecordStatus.Final);
    if (gradedRecords.length === 0) return "0.00";
    
    const totalPoints = gradedRecords.reduce((sum, record) => sum + record.gradeValue, 0);
    return (totalPoints / gradedRecords.length).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-edusync-primary" />
            My Academic Records
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Current GPA (Average Grade): <span className="font-semibold text-edusync-primary">{calculateGPA()}%</span>
          </p>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <SearchInput
            placeholder="Search by course, group, or term..."
            onSearch={setSearchQuery}
            className="max-w-md"
          />
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-auto">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredRecords.length} of {records.length} records</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Assessment</TableHead> 
                <TableHead>Grade</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.courseTitle}</TableCell>
                  <TableCell>{record.groupLabel}</TableCell>
                  <TableCell>{getAssessmentTypeLabel(record.assessmentType)}</TableCell> 
                  <TableCell>
                    <span className={`font-semibold text-lg ${getGradeColor(record.gradeValue)}`}>
                      {record.gradeValue}%
                    </span>
                  </TableCell>
                  <TableCell>{record.term}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>
                      {getStatusLabel(record.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!loading && filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                  {records.length === 0 ? "You have no academic records yet." : "No records match your search."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}