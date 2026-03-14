import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Paper,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Props for component
interface ResumeUploadProps {
  uploadUrl: string; // API endpoint
  studentId?: string | number;
  onUploadComplete?: (
    result: {
      fileName: string;
      uploadedUrl?: string;
      studentId?: string | number;
      error?: string;
    } | null
  ) => void;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const readableFileTypes = ["PDF", "DOC", "DOCX"];

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  uploadUrl,
  studentId,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);

  // Handle file select by input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) validateAndSetFile(file);
  };

  // Validate file type and size
  const validateAndSetFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        `File type not allowed. Please upload one of: ${readableFileTypes.join(", ")}`
      );
      setSelectedFile(null);
      setShowSnackbar(true);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 4 MB limit.");
      setSelectedFile(null);
      setShowSnackbar(true);
      return;
    }
    setSelectedFile(file);
    setError("");
  };

  // Drag and drop events
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0] ?? null;
    if (file) validateAndSetFile(file);
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setProgress(0);
    setError("");
    setSuccess("");
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || uploading) return;
    setUploading(true);
    setProgress(0);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      if (studentId !== undefined) {
        formData.append("studentId", String(studentId));
      }
      // Use XMLHttpRequest for progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          setSuccess("Resume uploaded successfully.");
          setShowSnackbar(true);
          setSelectedFile(null);
          if (onUploadComplete) {
            let uploadedUrl;
            try {
              const resp = JSON.parse(xhr.responseText);
              uploadedUrl = resp.url || resp.fileUrl || resp.location; // Try common keys
            } catch {
              // Intentionally left blank: response may not be JSON
            }
            onUploadComplete({
              fileName: selectedFile.name,
              uploadedUrl,
              studentId,
            });
          }
        } else {
          let msg = "Upload failed. Please try again.";
          try {
            const resp = JSON.parse(xhr.responseText);
            if (resp.error) msg = resp.error;
          } catch {
            // Intentionally left blank: response may not be JSON
          }
          setError(msg);
          setShowSnackbar(true);
          if (onUploadComplete) {
            onUploadComplete({
              fileName: selectedFile.name,
              error: msg,
              studentId,
            });
          }
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        setError("Network error during upload.");
        setShowSnackbar(true);
        if (onUploadComplete) {
          onUploadComplete({
            fileName: selectedFile.name,
            error: "Network error",
            studentId,
          });
        }
      };
      xhr.send(formData);
    } catch {
      setUploading(false);
      setError("Unexpected error during upload.");
      setShowSnackbar(true);
    }
  };

  // Render
  return (
    <Box>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: "background.default",
          border: "2px dashed #aaa",
          mb: 2,
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        tabIndex={0}
        aria-label="Upload Resume"
        role="region"
      >
        <CloudUploadIcon fontSize="large" color="action" sx={{ mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Drag and drop your resume here
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          or
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          Select File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf, .doc, .docx"
          style={{ display: "none" }}
          onChange={handleFileChange}
          tabIndex={-1}
        />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Accepted formats: PDF, DOC, DOCX. Max size 4 MB.
        </Typography>
      </Paper>

      {selectedFile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "background.paper",
            px: 2,
            py: 1,
            borderRadius: 2,
            mb: 2,
            boxShadow: 1,
          }}
          aria-live="polite"
        >
          <UploadFileIcon color="action" sx={{ mr: 1 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body1">{selectedFile.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </Typography>
          </Box>
          <IconButton
            aria-label="Remove file"
            onClick={handleRemoveFile}
            disabled={uploading}
            size="large"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}

      {uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress value={progress} variant="determinate" />
          <Typography variant="body2" color="text.secondary">
            Uploading... {progress}%
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        color="success"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        sx={{ minWidth: 180 }}
        aria-label="Upload Resume"
      >
        Upload Resume
      </Button>

      <Snackbar
        open={showSnackbar && (!!error || !!success)}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {error ? (
          <Alert severity="error" onClose={() => setShowSnackbar(false)}>{error}</Alert>
        ) : success ? (
          <Alert severity="success" onClose={() => setShowSnackbar(false)}>{success}</Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

export default ResumeUpload;
