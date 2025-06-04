import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Video, Download, X, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { materialService, MaterialDTO } from '../services/material';
import EditMaterialModal from './EditMaterialModal';

interface MaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  courseTitle: string;
}

export default function MaterialsModal({ isOpen, onClose, groupId, courseTitle }: MaterialsModalProps) {
  const [materials, setMaterials] = useState<MaterialDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [editMaterial, setEditMaterial] = useState<MaterialDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && groupId) {
      fetchMaterials();
      getCurrentUser();
    }
  }, [isOpen, groupId]);

  const getCurrentUser = () => {
    const stored = localStorage.getItem("eduSyncUser");
    if (stored) {
      const { id } = JSON.parse(stored);
      setCurrentUserId(id);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await materialService.getByGroupId(groupId);
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Error",
        description: "Failed to load materials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {  
    if (window.confirm('Are you sure you want to delete this material?')) {
      setActionLoading(true);
      try {
        await materialService.delete(materialId);
        setMaterials(prevMaterials => prevMaterials.filter(m => m.id !== materialId));
        toast({
          title: "Success",
          description: "Material deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting material:', error);
        toast({
          title: "Error",
          description: "Failed to delete material",
          variant: "destructive"
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleEditMaterial = (material: MaterialDTO) => {
    setEditMaterial(material);
    setIsEditModalOpen(true);
  };

  const handleMaterialUpdated = () => {
    fetchMaterials();
    setIsEditModalOpen(false);
    setEditMaterial(null);
    toast({
      title: "Success",
      description: "Material updated successfully",
    });
  };

  const canEditMaterial = (material: MaterialDTO) => {
    return currentUserId === material.uploadedById;
  };

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const getTypeIcon = (type: number) => {
    switch (type) {
      case 1: return <Video className="h-4 w-4" />;
      case 0: return <FileText className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: number) => {
    switch (type) {
      case 1: return 'bg-red-100 text-red-700';
      case 0: return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isVideoUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('.mp4') || url.includes('vimeo.com');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Course Resources - {courseTitle}
            </DialogTitle>
          </DialogHeader>

          {selectedVideo && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Video Player</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedVideo(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={getVideoEmbedUrl(selectedVideo)}
                  className="w-full h-full"
                  allowFullScreen
                  title="Course Video"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edusync-primary"></div>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No resources available for this course yet.
              </div>
            ) : (
              materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(material.type)}`}>
                          {getTypeIcon(material.type)}
                          {material.type === 1 ? 'Video' : material.type === 0 ? 'Document' : 'File'}
                        </span>
                        <h3 className="font-semibold">{material.title}</h3>
                      </div>
                      {material.description && (
                        <p className="text-gray-600 text-sm mb-3">{material.description}</p>
                      )}
                      <div className="text-xs text-gray-500 mb-3">
                        Uploaded by {material.uploadedByName} on {new Date(material.dateUploaded).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-between">
                    <div className="flex gap-2">
                      {material.type === 1 && isVideoUrl(material.fileUrl) ? (
                        <Button
                          onClick={() => setSelectedVideo(material.fileUrl)}
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Watch Video
                        </Button>
                      ) : null}
                      
                      <Button
                        onClick={() => window.open(material.fileUrl, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {material.type === 0 ? 'View Document' : 'Download'}
                      </Button>
                    </div>

                    {canEditMaterial(material) && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditMaterial(material)}
                          variant="outline"
                          size="sm"
                          disabled={actionLoading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteMaterial(material.id)}
                          variant="outline"
                          size="sm"
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EditMaterialModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        material={editMaterial}
        onMaterialUpdated={handleMaterialUpdated}
      />
    </>
  );
}
