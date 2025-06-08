import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { quizService } from '../services/quiz';
import type { UploadQuizModelCsvDTO } from '../types/quiz';
import { useAuth } from '../Context/useAuth';

interface AddQuizModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  onModelAdded: () => void;
}

export default function AddQuizModelModal({ isOpen, onClose, quizId, onModelAdded }: AddQuizModelModalProps) {
  const [modelIdentifier, setModelIdentifier] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile || !user?.id) return;

    setLoading(true);

    try {
      const uploadData: UploadQuizModelCsvDTO = {
        requestingInstructorId: user.id,
        quizId: quizId,
        modelIdentifier: modelIdentifier,
        csvFile: csvFile
      };

      await quizService.addQuizModel(uploadData);
      
      onModelAdded();
      handleClose();
    } catch (error) {
      console.error('Error uploading quiz model:', error);
      alert('Error uploading quiz model');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setModelIdentifier('');
    setCsvFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Quiz Model</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="modelIdentifier">Model Identifier *</Label>
            <Input
              id="modelIdentifier"
              value={modelIdentifier}
              onChange={(e) => setModelIdentifier(e.target.value)}
              placeholder="e.g., Model A, Version 1"
              required
            />
          </div>

          <div>
            <Label htmlFor="csvFile">CSV File *</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a CSV file containing quiz questions and options
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !csvFile} className="flex-1 bg-edusync-primary hover:bg-edusync-secondary">
              <Upload className="h-4 w-4 mr-2" />
              {loading ? 'Uploading...' : 'Upload Model'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}