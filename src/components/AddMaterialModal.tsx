
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { materialService, CreateMaterialDTO } from '../services/material';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onMaterialAdded: () => void;
}

export default function AddMaterialModal({ isOpen, onClose, groupId, onMaterialAdded }: AddMaterialModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    type: 0, // 0: Document, 1: Video, 2: Other
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stored = localStorage.getItem("eduSyncUser");
      if (!stored) throw new Error("Not logged in");
      const { id: instructorId } = JSON.parse(stored);

      const createData: CreateMaterialDTO = {
        ...formData,
        groupId,
        uploadingInstructorId: instructorId,
      };

      await materialService.create(createData);
      onMaterialAdded();
      onClose();
      setFormData({ title: '', description: '', fileUrl: '', type: 0 });
    } catch (error) {
      console.error('Error adding material:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File URL</label>
            <Input
              type="url"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Select
              value={formData.type.toString()}
              onValueChange={(value) => setFormData({ ...formData, type: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Document</SelectItem>
                <SelectItem value="1">Video</SelectItem>
                <SelectItem value="2">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
