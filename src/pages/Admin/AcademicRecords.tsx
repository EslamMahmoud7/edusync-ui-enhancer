
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { academicRecordsService } from '../../services/academicRecords';
import { AcademicRecordDTO, AssessmentType, AcademicRecordStatus } from '../../types/academic';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import SearchInput from '../../components/SearchInput';
import AcademicRecordModal from '../../components/AcademicRecordModal';

export default function AcademicRecords() {
  const [records, setRecords] = useState<AcademicRecordDTO[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecordDTO | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery]);

  const fetchRecords = async () => {
    try {
      const data = await academicRecordsService.getAll();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch academic records:', error);
      toast({
        title: "Error",
        description: "Failed to load academic records",
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
      record.studentName.toLowerCase().includes(query) ||
      record.courseTitle.toLowerCase().includes(query) ||
      record.groupLabel.toLowerCase().includes(query) ||
      record.term.toLowerCase().includes(query)
    );
    setFilteredRecords(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this academic record?')) return;
    
    try {
      await academicRecordsService.delete(id);
      toast({
        title: "Success",
        description: "Academic record deleted successfully"
      });
      fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast({
        title: "Error",
        description: "Failed to delete academic record",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (record: AcademicRecordDTO) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    fetchRecords();
  };

  const getAssessmentTypeLabel = (type: AssessmentType) => {
    return Object.keys(AssessmentType)[type] || 'Unknown';
  };

  const getStatusLabel = (status: AcademicRecordStatus) => {
    return Object.keys(AcademicRecordStatus)[status] || 'Unknown';
  };

  const getStatusColor = (status: AcademicRecordStatus) => {
    switch (status) {
      case AcademicRecordStatus.Pending: return 'text-yellow-600 bg-yellow-100';
      case AcademicRecordStatus.Completed: return 'text-blue-600 bg-blue-100';
      case AcademicRecordStatus.Graded: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Academic Records</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Record
        </Button>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <SearchInput
            placeholder="Search by student, course, group, or term..."
            onSearch={setSearchQuery}
            className="max-w-md"
          />
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="h-4 w-4" />
            <span>{filteredRecords.length} of {records.length} records</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>{record.courseTitle}</TableCell>
                  <TableCell>{record.groupLabel}</TableCell>
                  <TableCell>{getAssessmentTypeLabel(record.assessmentType)}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${record.gradeValue >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      {record.gradeValue}%
                    </span>
                  </TableCell>
                  <TableCell>{record.term}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No academic records found</p>
            </div>
          )}
        </div>
      </div>

      <AcademicRecordModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        record={editingRecord}
      />
    </div>
  );
}
