import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  IconButton,
} from "@mui/material";
import { CloudUpload, Delete, InsertDriveFile } from "@mui/icons-material";
import { useSnackbar } from "../contexts/SnackbarContext";
import { API_ENDPOINTS } from "../apis";
import { clientLogger } from "../lib/client-logger";

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onUpload: (urls: string[]) => void;
  currentFiles?: string[];
  onRemove?: (index: number) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label = "Upload Files",
  accept = "image/*",
  multiple = false,
  maxSize = 5,
  onUpload,
  currentFiles = [],
  onRemove,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSnackbar } = useSnackbar();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Validate file sizes
    const oversizedFiles = files.filter(
      (file) => file.size > maxSize * 1024 * 1024,
    );
    if (oversizedFiles.length > 0) {
      showSnackbar(`Some files exceed the ${maxSize}MB limit`, "error");
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(API_ENDPOINTS.IMAGEKIT.UPLOAD, {
          method: "POST",
          body: formData,
          headers: {
            // Try godToken first (for god panel), then authToken (for regular users)
            Authorization: `Bearer ${localStorage.getItem("godToken") || localStorage.getItem("authToken") || ""}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const result = await response.json();
        uploadedUrls.push(result.data[0].filePath.fileUrl);
      }

      onUpload(uploadedUrls);
      showSnackbar("Files uploaded successfully", "success");
    } catch (error: any) {
      clientLogger.error("Upload error:", { error });
      showSnackbar(error.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  const getFileName = (url: string) => {
    return url.split("/").pop() || "Unknown file";
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={disabled || uploading}
      />

      <Button
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
        onClick={handleButtonClick}
        disabled={disabled || uploading}
        sx={{ mb: 2 }}
      >
        {uploading ? "Uploading..." : label}
      </Button>

      {/* Current Files Display */}
      {currentFiles.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
          {currentFiles.map((url, index) => (
            <Card key={index} sx={{ maxWidth: 200, position: "relative" }}>
              {isImage(url) ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={url}
                  alt={`File ${index + 1}`}
                  sx={{ objectFit: "cover" }}
                />
              ) : (
                <Box
                  sx={{
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.100",
                  }}
                >
                  <InsertDriveFile sx={{ fontSize: 48, color: "grey.500" }} />
                </Box>
              )}
              <CardContent sx={{ p: 1 }}>
                <Typography variant="body2" noWrap>
                  {getFileName(url)}
                </Typography>
              </CardContent>
              {onRemove && (
                <IconButton
                  size="small"
                  onClick={() => onRemove(index)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Card>
          ))}
        </Box>
      )}

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Uploading files...
          </Typography>
          <CircularProgress size={24} sx={{ mt: 1 }} />
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
