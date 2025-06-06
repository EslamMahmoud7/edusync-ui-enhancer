
import { Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditingSubmission {
  id: string;
  title: string;
  submissionLink: string;
}

interface EditSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubmission: EditingSubmission;
  setEditingSubmission: (submission: EditingSubmission) => void;
  onUpdate: () => void;
}

export default function EditSubmissionModal({
  isOpen,
  onClose,
  editingSubmission,
  setEditingSubmission,
  onUpdate
}: EditSubmissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-edusync-primary" />
            Edit Submission
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Submission Title</Label>
            <Input
              id="edit-title"
              value={editingSubmission.title}
              onChange={(e) => setEditingSubmission({ ...editingSubmission, title: e.target.value })}
              placeholder="Enter submission title"
            />
          </div>

          <div>
            <Label htmlFor="edit-link">Submission Link</Label>
            <Input
              id="edit-link"
              type="url"
              value={editingSubmission.submissionLink}
              onChange={(e) => setEditingSubmission({ ...editingSubmission, submissionLink: e.target.value })}
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onUpdate}
              className="flex-1 bg-edusync-primary hover:bg-edusync-secondary"
              disabled={!editingSubmission.title || !editingSubmission.submissionLink}
            >
              Update Submission
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
