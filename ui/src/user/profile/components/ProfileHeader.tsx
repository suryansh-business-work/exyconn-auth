import React, { useRef } from "react";
import {
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, Google } from "@mui/icons-material";

interface ProfileHeaderProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
    isVerified?: boolean;
    role?: string;
    provider?: string;
  } | null;
  uploadingPicture: boolean;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  uploadingPicture,
  onPhotoUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUserInitials = () => {
    if (!user) return "?";
    const firstInitial = user.firstName?.charAt(0) || "";
    const lastInitial = user.lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
  };

  const isOAuthUser = user?.provider === "google";

  return (
    <Box display="flex" alignItems="center" mb={3}>
      <Box position="relative">
        {user?.profilePicture ? (
          <Avatar src={user.profilePicture} sx={{ width: 100, height: 100 }} />
        ) : (
          <Avatar
            sx={{
              width: 100,
              height: 100,
              fontSize: "2rem",
              bgcolor: "primary.main",
            }}
          >
            {getUserInitials()}
          </Avatar>
        )}
        {uploadingPicture && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 100,
              height: 100,
              bgcolor: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={32} sx={{ color: "white" }} />
          </Box>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onPhotoUpload}
          accept="image/*"
          style={{ display: "none" }}
        />
        <IconButton
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            bgcolor: "background.paper",
            boxShadow: 1,
            "&:hover": { bgcolor: "grey.100" },
          }}
          size="small"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPicture}
        >
          {uploadingPicture ? (
            <CircularProgress size={16} />
          ) : (
            <PhotoCamera fontSize="small" />
          )}
        </IconButton>
      </Box>
      <Box ml={3}>
        <Typography variant="h5" fontWeight={600}>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
        <Box mt={1} display="flex" gap={1}>
          {user?.isVerified && (
            <Chip label="Verified" size="small" color="success" />
          )}
          {isOAuthUser && (
            <Chip
              icon={<Google fontSize="small" />}
              label="Google Account"
              size="small"
              variant="outlined"
            />
          )}
          <Chip label={user?.role || "User"} size="small" variant="outlined" />
        </Box>
      </Box>
    </Box>
  );
};
