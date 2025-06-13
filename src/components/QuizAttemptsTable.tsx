import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { QuizAttemptResultDTO } from '../types/quiz';
import { useNavigate } from 'react-router-dom';

interface QuizAttemptsTableProps {
  attempts: QuizAttemptResultDTO[];
}


export default function QuizAttemptsTable({ attempts }: QuizAttemptsTableProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'inprogress':
        return 'bg-yellow-100 text-yellow-800';
      case 'timeexpired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!attempts || attempts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No attempts yet</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attempts.map((attempt) => (
          <TableRow key={attempt.attemptId}>
            <TableCell>
              <div className="font-medium">{attempt.studentName}</div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {new Date(attempt.startTime).toLocaleString()}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">
                {attempt.score ?? 'N/A'}/{attempt.totalPointsPossible}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(attempt.status)}>
                {attempt.status}
              </Badge>
            </TableCell>
            <TableCell>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}