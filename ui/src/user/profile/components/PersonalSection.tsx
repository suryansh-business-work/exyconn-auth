import React, { useRef } from "react";
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  alpha,
  useTheme,
  Stack,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  Email,
  PhotoCamera,
  Google,
  AccessTime,
  LocationOn,
  VerifiedUser,
} from "@mui/icons-material";
import { ProfileFormValues } from "../useProfileLogic";
import { UserData } from "../../../contexts/AuthContext";

interface PersonalSectionProps {
  user: UserData | null;
  isEditing: boolean;
  profileForm: ProfileFormValues;
  submitting: boolean;
  uploadingPicture: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onFormChange: (
    field: keyof ProfileFormValues,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PersonalSection: React.FC<PersonalSectionProps> = ({
  user,
  isEditing,
  profileForm,
  submitting,
  uploadingPicture,
  onStartEdit,
  onCancelEdit,
  onFormChange,
  onSubmit,
  onPhotoUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isOAuthUser = user?.provider === "google";

  const getUserInitials = () => {
    if (!user) return "?";
    return (
      `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() ||
      "U"
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          display="flex"
          sx={{ flexDirection: { xs: "column", sm: "row" } }}
          alignItems={{ xs: "center", sm: "flex-start" }}
          gap={4}
        >
          {/* Avatar Section */}
          <Box position="relative">
            <Avatar
              src={user?.profilePicture}
              variant="square"
              sx={{
                width: 120,
                height: 120,
                fontSize: "2.5rem",
                bgcolor: "primary.main",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {!user?.profilePicture && getUserInitials()}
            </Avatar>
            {uploadingPicture && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.4)",
                  borderRadius: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                <CircularProgress
                  size={32}
                  thickness={5}
                  sx={{ color: "white" }}
                />
              </Box>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={onPhotoUpload}
              accept="image/*"
              hidden
            />
            <IconButton
              size="medium"
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                bgcolor: "background.paper",
                color: "primary.main",
                boxShadow: 3,
                "&:hover": { bgcolor: "primary.main", color: "white" },
                zIndex: 2,
              }}
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "left" } }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: "center", sm: "flex-start" }}
              gap={1.5}
              mb={0.5}
            >
              <Typography variant="h4" fontWeight={800} color="text.primary">
                {user?.firstName} {user?.lastName}
              </Typography>
              {user?.isVerified && (
                <VerifiedUser
                  sx={{ color: "success.main", fontSize: 24 }}
                  titleAccess="Verified Account"
                />
              )}
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ opacity: 0.8, mb: 2 }}
            >
              {user?.email}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "center", sm: "flex-start" }}
            >
              {user?.isVerified && (
                <Chip
                  label="Verified Account"
                  size="small"
                  color="success"
                  sx={{
                    borderRadius: 0,
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.success.main, 1),
                  }}
                />
              )}
              {isOAuthUser && (
                <Chip
                  icon={<Google sx={{ fontSize: "14px !important" }} />}
                  label="Google Login"
                  size="small"
                  sx={{ borderRadius: 0, fontWeight: 600 }}
                />
              )}
              <Chip
                label={user?.role?.toUpperCase() || "USER"}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 0, fontWeight: 700, border: "1.5px solid" }}
              />
            </Stack>
          </Box>

          {!isEditing && (
            <Button
              variant="text"
              startIcon={<Edit />}
              onClick={onStartEdit}
              sx={{
                borderRadius: 0,
                whiteSpace: "nowrap",
                minWidth: "auto",
                fontWeight: 600,
                color: "text.secondary",
                "&:hover": { color: "primary.main", bgcolor: "transparent" },
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>

      {/* Details Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={3}>
          Account Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              value={profileForm.firstName}
              onChange={onFormChange("firstName")}
              disabled={!isEditing}
              fullWidth
              variant="outlined"
              InputProps={{ sx: { borderRadius: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              value={profileForm.lastName}
              onChange={onFormChange("lastName")}
              disabled={!isEditing}
              fullWidth
              variant="outlined"
              InputProps={{ sx: { borderRadius: 0 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email Address"
              value={user?.email || ""}
              disabled
              fullWidth
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 0, bgcolor: "action.hover" },
                startAdornment: (
                  <Email
                    sx={{ mr: 1, color: "text.secondary", opacity: 0.7 }}
                  />
                ),
              }}
            />
          </Grid>
        </Grid>

        {isEditing && (
          <Box display="flex" gap={2} mt={4}>
            <Button
              variant="contained"
              startIcon={
                submitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Save />
                )
              }
              onClick={onSubmit}
              disabled={submitting}
              sx={{ borderRadius: 0, px: 4 }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={onCancelEdit}
              sx={{ borderRadius: 0, px: 4 }}
            >
              Cancel
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 4, opacity: 0.6 }} />

        {/* Status Info */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 0,
                  color: "primary.main",
                }}
              >
                <AccessTime />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  display="block"
                >
                  LAST LOGIN
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user?.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : "N/A"}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  borderRadius: 0,
                  color: "secondary.main",
                }}
              >
                <LocationOn />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  display="block"
                >
                  IP ADDRESS
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user?.lastLoginIp || "N/A"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
