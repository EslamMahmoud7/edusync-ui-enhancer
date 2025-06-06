
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { materialService, MaterialDTO, UpdateMaterialDTO } from '../services/material';

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialDTO | null;
  onMaterialUpdated: () => void;
}

interface FormData {
  title: string;
  description: string;
  fileUrl: string;
  type: number;
}

export default function EditMaterialModal({ isOpen, onClose, material, onMaterialUpdated }: EditMaterialModalProps) {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      fileUrl: '',
      type: 0,
    }
  });

  useEffect(() => {
    if (material) {
      form.reset({
        title: material.title,
        description: material.description,
        fileUrl: material.fileUrl,
        type: material.type,
      });
    }
  }, [material, form]);

  const handleSubmit = async (data: FormData) => {
    if (!material) return;
    
    setLoading(true);

    try {
      const stored = localStorage.getItem("eduSyncUser");
      if (!stored) throw new Error("Not logged in");
      const { id: instructorId } = JSON.parse(stored);

      const updateData: UpdateMaterialDTO = {
        ...data,
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
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ 
                required: "Title is required",
                minLength: { value: 2, message: "Title must be at least 2 characters" },
                maxLength: { value: 100, message: "Title cannot exceed 100 characters" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter material title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{ 
                maxLength: { value: 500, message: "Description cannot exceed 500 characters" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter material description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileUrl"
              rules={{ 
                required: "File URL is required",
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "Please enter a valid URL"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/file"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              rules={{ required: "Type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Document</SelectItem>
                        <SelectItem value="1">Video</SelectItem>
                        <SelectItem value="2">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Material'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
