import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Edit, Trash2, Filter, UploadCloud, ListChecks, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useForm } from 'react-hook-form';
import { useToast } from '../../hooks/use-toast';
import { academicRecordsService } from '../../services/academicRecords';
import { groupService } from '../../services/group';
import { 
    AcademicRecordDTO, 
    AssessmentType, 
    AcademicRecordStatus, 
    UploadAcademicRecordsCsvDTO, 
    BulkAddAcademicRecordsResultDTO,
    UpdateAcademicRecordDTO, 
    
} from '../../types/academic';
import { GroupDTO } from '../../types/group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import SearchInput from '../../components/SearchInput';
import AcademicRecordModal from '../../components/AcademicRecordModal'; 
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../Context/useAuth'; 

interface CsvUploadFormData {
  groupId: string;
  term: string;
  assessmentType: string;
}

export default function AcademicRecordsPage() {
  const { user } = useAuth(); 
  const [records, setRecords] = useState<AcademicRecordDTO[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecordDTO | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkAddAcademicRecordsResultDTO | null>(null);

  const csvForm = useForm<CsvUploadFormData>({
    defaultValues: {
      groupId: '',
      term: '',
      assessmentType: ''
    }
  });

  useEffect(() => {
    fetchPageData();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const [recordsData, groupsData] = await Promise.all([
        academicRecordsService.getAll(),
        groupService.getAll()
      ]);
      setRecords(recordsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to fetch page data:', error);
      toast({
        title: "Error",
        description: "Failed to load academic records or groups list.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRecords = async () => { 
    setLoading(true); 
    try {
      const data = await academicRecordsService.getAll();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch academic records:', error);
      toast({
        title: "Error",
        description: "Failed to reload academic records.",
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
      (record.studentFullName && record.studentFullName.toLowerCase().includes(query)) ||
      (record.courseTitle && record.courseTitle.toLowerCase().includes(query)) ||
      (record.groupLabel && record.groupLabel.toLowerCase().includes(query)) ||
      (record.term && record.term.toLowerCase().includes(query))
    );
    setFilteredRecords(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this academic record?')) return;
    try {
      await academicRecordsService.delete(id);
      toast({ title: "Success", description: "Academic record deleted successfully" });
      fetchRecords(); 
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast({ title: "Error", description: "Failed to delete academic record", variant: "destructive" });
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCsvFile(event.target.files[0]);
    } else {
      setCsvFile(null);
    }
  };

  const handleCsvUploadSubmit = async (data: CsvUploadFormData) => {
    if (!csvFile) {
      toast({ title: "Missing File", description: "Please select a CSV file to upload.", variant: "destructive" });
      return;
    }
    
    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('CsvFile', csvFile);
    formData.append('GroupId', data.groupId);
    formData.append('Term', data.term);
    formData.append('AssessmentType', data.assessmentType);
    if (user?.id) {
      formData.append('UploadingInstructorId', user.id);
    }
    formData.append('DefaultStatus', AcademicRecordStatus.Final.toString());

    try {
      const result = await academicRecordsService.addFromCsv(formData);
      setUploadResult(result);
      toast({
        title: "Upload Processed",
        description: `${result.successfullyAddedCount} of ${result.totalRowsAttempted} records added.`,
      });
      if (result.successfullyAddedCount > 0) {
        fetchRecords(); 
      }
      csvForm.reset();
      setCsvFile(null);
    } catch (error: any) {
      console.error('CSV Upload failed:', error);
      const errorMsg = error.response?.data?.errorMessages?.join(', ') || error.response?.data?.title || "CSV upload failed. Please check the file format and data.";
      setUploadResult({ successfullyAddedCount: 0, totalRowsAttempted: csvFile ? 1 : 0, errorMessages: [errorMsg]});
      toast({ title: "Upload Error", description: errorMsg, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const getAssessmentTypeLabel = (type: AssessmentType | string) => {
    const numericType = typeof type === 'string' ? parseInt(type, 10) : type;
    return Object.keys(AssessmentType).find(key => AssessmentType[key as keyof typeof AssessmentType] === numericType) || 'Unknown';
  };

  const getStatusLabel = (status: AcademicRecordStatus) => {
    return AcademicRecordStatus[status] || 'Unknown';
  };

  const getStatusColor = (status: AcademicRecordStatus) => {
    switch (status) {
      case AcademicRecordStatus.Provisional: return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case AcademicRecordStatus.Final: return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/30';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 dark:text-green-400';
    if (grade >= 80) return 'text-blue-600 dark:text-blue-400';
    if (grade >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (grade >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading && records.length === 0 && groups.length === 0) { 
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-edusync-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Academic Records Management</h1>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <UploadCloud className="h-6 w-6 text-edusync-primary" />
            Upload Grades via CSV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...csvForm}>
            <form onSubmit={csvForm.handleSubmit(handleCsvUploadSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                  <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CSV File*</label>
                  <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} required className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                </div>
                
                <FormField
                  control={csvForm.control}
                  name="groupId"
                  rules={{ required: "Group is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group*</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select Group" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.length > 0 ? groups.map(group => (
                              <SelectItem key={group.id} value={group.id}>{group.courseTitle}</SelectItem>
                            )) : <SelectItem value="" disabled>No groups found</SelectItem>}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={csvForm.control}
                  name="term"
                  rules={{ 
                    required: "Term is required",
                    minLength: { value: 3, message: "Term must be at least 3 characters" }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fall 2024" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={csvForm.control}
                  name="assessmentType"
                  rules={{ required: "Assessment type is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Type*</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(AssessmentType)
                                .filter(([, value]) => typeof value === 'number')
                                .map(([key, value]) => (
                              <SelectItem key={value as number} value={(value as number).toString()}>{key}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isUploading || !csvFile} className="bg-edusync-primary hover:bg-edusync-primary/90 w-full md:w-auto lg:col-span-1">
                  {isUploading ? 'Uploading...' : 'Upload Records'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CSV format: Header row (StudentId,GradeValue), then data rows.</p>
            </form>
          </Form>

          {uploadResult && (
            <div className={`mt-4 p-3 rounded-md text-sm ${uploadResult.errorMessages.length > 0 && uploadResult.successfullyAddedCount === 0 ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : (uploadResult.errorMessages.length > 0 ? 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-700 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300')}`}>
              <div className="flex items-start gap-2">
                 {uploadResult.errorMessages.length > 0 && uploadResult.successfullyAddedCount === 0 ? <AlertCircle className="h-5 w-5 text-red-500" /> : (uploadResult.errorMessages.length > 0 ? <AlertCircle className="h-5 w-5 text-yellow-500" /> :  <ListChecks className="h-5 w-5 text-green-500" />)}
                <div>
                    <h4 className="font-semibold mb-1">Upload Summary:</h4>
                    <p>Attempted to process: {uploadResult.totalRowsAttempted} records.</p>
                    <p>Successfully added: {uploadResult.successfullyAddedCount} records.</p>
                </div>
              </div>
              {uploadResult.errorMessages.length > 0 && (
                <div className="mt-2 pl-7"> 
                  <p className="font-medium">Details:</p>
                  <ul className="list-disc list-inside max-h-28 overflow-y-auto text-xs">
                    {uploadResult.errorMessages.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <SearchInput
            placeholder="Search by student, course, group, or term..."
            onSearch={setSearchQuery}
            className="flex-grow max-w-md"
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
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Recorded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.studentFullName}</TableCell>
                  <TableCell>{record.courseTitle}</TableCell>
                  <TableCell>{record.groupLabel}</TableCell>
                  <TableCell>{getAssessmentTypeLabel(record.assessmentType)}</TableCell>
                  <TableCell>
                    <span className={`font-semibold text-lg ${getGradeColor(record.gradeValue)}`}>
                      {record.gradeValue}%
                    </span>
                  </TableCell>
                  <TableCell>{record.term}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-300">
                    {new Date(record.dateRecorded).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {loading && records.length > 0 && <p className="text-center py-4">Refreshing records...</p> }
          {!loading && filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <ListChecks className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {records.length === 0 ? "No academic records have been added yet." : "No records match your search."}
              </p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AcademicRecordModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          record={editingRecord}
        />
      )}
    </div>
  );
}
