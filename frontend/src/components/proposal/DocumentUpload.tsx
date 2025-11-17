import { useState, useRef, DragEvent } from 'react';
import Button from '../common/Button';
import { toast } from '../common/Toast';
import { Upload, File, X, FileText, Image as ImageIcon, Loader } from 'lucide-react';
import { documentService, Document } from '../../services/document.service';

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: string;
}

interface DocumentUploadProps {
  proposalId: string;
  onUploadComplete?: (document?: UploadedDocument) => void;
  existingDocuments?: UploadedDocument[];
  onDeleteDocument?: (documentId?: string) => void;
}

export default function DocumentUpload({
  proposalId,
  onUploadComplete,
  existingDocuments = [],
  onDeleteDocument,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0]; // Handle one file at a time for now

    // Validate file
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, DOCX, and image files are allowed');
      return;
    }

    try {
      setUploading(true);

      // Upload file using the document service
      const uploadedDocument = await documentService.upload({
        file,
        proposalId,
      });

      toast.success('Document uploaded successfully!');

      if (onUploadComplete) {
        onUploadComplete(uploadedDocument);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Delete this document?')) {
      return;
    }

    try {
      await documentService.delete(documentId);
      toast.success('Document deleted');

      if (onDeleteDocument) {
        onDeleteDocument(documentId);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="text-red-500" size={24} />;
    } else if (type.includes('image')) {
      return <ImageIcon className="text-blue-500" size={24} />;
    } else {
      return <File className="text-gray-500" size={24} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="animate-spin text-blue-600" size={48} />
            <p className="text-sm text-gray-600">Uploading document...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-base font-medium text-gray-900 mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              PDF, DOCX, or images up to 50MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
          </>
        )}
      </div>

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Attached Documents ({existingDocuments.length})
          </h4>
          <div className="space-y-2">
            {existingDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.size)} • Uploaded{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
