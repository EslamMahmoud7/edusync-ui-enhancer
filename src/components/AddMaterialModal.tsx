
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { materialService, CreateMaterialDTO } from '../services/material';
import { useAuth } from '../Context/useAuth';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onMaterialAdded: () => void;
}

export default function AddMaterialModal({ isOpen, onClose, groupId, onMaterialAdded }: AddMaterialModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    type: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const materialData: CreateMaterialDTO = {
        ...formData,
        groupId,
        uploadingInstructorId: user.id
      };
      
      await materialService.create(materialData);
      onMaterialAdded();
      onClose();
      setFormData({ title: '', description: '', fileUrl: '', type: 0 });
    } catch (error) {
      console.error('Error adding material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Course Material</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter material title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter material description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File URL *</label>
            <Input
              value={formData.fileUrl}
              onChange={(e) => handleInputChange('fileUrl', e.target.value)}
              placeholder="https://example.com/file.pdf"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <Select value={formData.type.toString()} onValueChange={(value) => handleInputChange('type', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Document/PDF</SelectItem>
                <SelectItem value="1">Video</SelectItem>
                <SelectItem value="2">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
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
