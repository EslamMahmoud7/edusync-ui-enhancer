
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { materialService, MaterialDTO, UpdateMaterialDTO } from '../services/material';

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialDTO | null;
  onMaterialUpdated: () => void;
}

export default function EditMaterialModal({ isOpen, onClose, material, onMaterialUpdated }: EditMaterialModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    type: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material) {
      setFormData({
        title: material.title,
        description: material.description,
        fileUrl: material.fileUrl,
        type: material.type,
      });
    }
  }, [material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material) return;
    
    setLoading(true);

    try {
      const stored = localStorage.getItem("eduSyncUser");
      if (!stored) throw new Error("Not logged in");
      const { id: instructorId } = JSON.parse(stored);

      const updateData: UpdateMaterialDTO = {
        ...formData,
        updatingInstructorId: instructorId,
      };

      await materialService.update(material.id, updateData);
      onMaterialUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ title: '', description: '', fileUrl: '', type: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
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
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
