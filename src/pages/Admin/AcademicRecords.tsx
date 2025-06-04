import { useState, useEffect } from 'react';
import { GraduationCap, Upload, Download, Plus, Filter, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { academicRecordsService } from '../../services/academicRecords';
import { groupService } from '../../services/group';
import { AcademicRecordDTO, CreateAcademicRecordDTO, BulkAddAcademicRecordsResultDTO, AcademicRecordStatus, AssessmentType } from '../../types/academic';
import { GroupDTO } from '../../types/group';
import AcademicRecordModal from '../../components/AcademicRecordModal';
import SearchInput from '../../components/SearchInput';

export default function AdminAcademicRecords() {
  const [records, setRecords] = useState<AcademicRecordDTO[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecordDTO[]>([]);
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkAddAcademicRecordsResultDTO | null>(null);
  const [editingRecord, setEditingRecord] = useState<AcademicRecordDTO | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
    fetchGroups();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery, selectedStatus, selectedGroup]);

  const fetchRecords = async () => {
    setLoading(true);
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

  const fetchGroups = async () => {
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const filterRecords = () => {
    if (!searchQuery && !selectedStatus && !selectedGroup) {
      setFilteredRecords(records);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = records.filter(record => {
      const matchesSearch = !searchQuery || 
        record.courseTitle.toLowerCase().includes(query) ||
        record.studentName.toLowerCase().includes(query) ||
        record.groupLabel.toLowerCase().includes(query);
      
      const matchesStatus = !selectedStatus || record.status.toString() === selectedStatus;
      const matchesGroup = !selectedGroup || record.groupId === selectedGroup;
      
      return matchesSearch && matchesStatus && matchesGroup;
    });
    setFilteredRecords(filtered);
  };

  const getStatusLabel = (status: AcademicRecordStatus) => {
    switch (status) {
      case AcademicRecordStatus.Pending: return 'Pending';
      case AcademicRecordStatus.Completed: return 'Completed';
      case AcademicRecordStatus.Graded: return 'Graded';
      case AcademicRecordStatus.Provisional: return 'Provisional';
      case AcademicRecordStatus.Final: return 'Final';
      default: return 'Unknown';
    }
  };

  const getStatusVariant = (status: AcademicRecordStatus) => {
    switch (status) {
      case AcademicRecordStatus.Pending: return 'yellow';
      case AcademicRecordStatus.Completed: return 'blue';
      case AcademicRecordStatus.Graded: return 'green';
      case AcademicRecordStatus.Provisional: return 'orange';
      case AcademicRecordStatus.Final: return 'purple';
      default: return 'default';
    }
  };

  const getAssessmentTypeLabel = (type: AssessmentType) => {
    switch (type) {
      case AssessmentType.Quiz: return 'Quiz';
      case AssessmentType.Assignment: return 'Assignment';
      case AssessmentType.Exam: return 'Exam';
      case AssessmentType.Project: return 'Project';
      case AssessmentType.Midterm: return 'Midterm';
      case AssessmentType.Final: return 'Final';
      default: return 'Unknown';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleEditRecord = (record: AcademicRecordDTO) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await academicRecordsService.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkUploading(true);
    try {
      const result = await academicRecordsService.uploadBulk({ file });
      setBulkResult({
        message: result.message,
        recordsAdded: result.recordsAdded,
        successfullyAddedCount: result.successfullyAddedCount,
        totalRowsAttempted: result.totalRowsAttempted
      });
      
      toast({
        title: "Success",
        description: `${result.successfullyAddedCount} of ${result.totalRowsAttempted} records uploaded successfully`,
      });
      
      if (result.successfullyAddedCount > 0) {
        fetchRecords();
      }
    } catch (error) {
      console.error('Bulk upload failed:', error);
      setBulkResult({
        message: 'Upload failed',
        recordsAdded: 0,
        successfullyAddedCount: 0,
        totalRowsAttempted: 0
      });
      
      toast({
        title: "Error",
        description: "Failed to upload academic records",
        variant: "destructive"
      });
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-edusync-primary" />
          Academic Records Management
        </h1>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Academic Records</CardTitle>
                  <CardDescription>Manage student academic records and grades</CardDescription>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
                <SearchInput
                  placeholder="Search by student, course, or group..."
                  onSearch={setSearchQuery}
                  className="flex-1 mb-2 md:mb-0"
                />
                <Select
                  value={selectedStatus || ''}
                  onValueChange={(value) => setSelectedStatus(value || null)}
                  className="w-48"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value={AcademicRecordStatus.Pending.toString()}>Pending</SelectItem>
                    <SelectItem value={AcademicRecordStatus.Completed.toString()}>Completed</SelectItem>
                    <SelectItem value={AcademicRecordStatus.Graded.toString()}>Graded</SelectItem>
                    <SelectItem value={AcademicRecordStatus.Provisional.toString()}>Provisional</SelectItem>
                    <SelectItem value={AcademicRecordStatus.Final.toString()}>Final</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedGroup || ''}
                  onValueChange={(value) => setSelectedGroup(value || null)}
                  className="w-48"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Groups</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell>{record.courseTitle}</TableCell>
                        <TableCell>{record.groupLabel}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getGradeColor(record.gradeValue)}`}>
                            {record.gradeValue}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(record.status)}>
                            {getStatusLabel(record.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{getAssessmentTypeLabel(record.assessmentType)}</TableCell>
                        <TableCell>{record.term}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRecord(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecord(record.id)}
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
                    <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No academic records found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>Upload multiple academic records via CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="bulk-upload" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Upload CSV File
                </label>
                <Input
                  id="bulk-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleBulkUpload}
                  disabled={bulkUploading}
                />
              </div>

              {bulkResult && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Upload Results</h3>
                  <p className="text-blue-700">{bulkResult.message}</p>
                  <p className="text-sm text-blue-600">
                    Successfully added: {bulkResult.successfullyAddedCount} of {bulkResult.totalRowsAttempted} records
                  </p>
                  <p className="text-sm text-blue-600">
                    Total records processed: {bulkResult.recordsAdded}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <AcademicRecordModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRecord(null);
          }}
          record={editingRecord}
          onSave={() => {
            fetchRecords();
            setIsModalOpen(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}
