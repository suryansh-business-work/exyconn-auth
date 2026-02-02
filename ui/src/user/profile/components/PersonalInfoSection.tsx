import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Edit, Save, Cancel, Person, Email } from "@mui/icons-material";
import { ProfileFormValues } from "../useProfileLogic";

interface PersonalInfoSectionProps {
  isEditing: boolean;
  profileForm: ProfileFormValues;
  userEmail: string;
  submitting: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onFormChange: (
    field: keyof ProfileFormValues,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  isEditing,
  profileForm,
  userEmail,
  submitting,
  onStartEdit,
  onCancelEdit,
  onFormChange,
  onSubmit,
}) => (
  <>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Typography variant="h6" fontWeight={600}>
        <Person sx={{ mr: 1, verticalAlign: "middle" }} />
        Personal Information
      </Typography>
      {!isEditing && (
        <Button startIcon={<Edit />} onClick={onStartEdit} size="small">
          Edit
        </Button>
      )}
    </Box>

    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="First Name"
          value={profileForm.firstName}
          onChange={onFormChange("firstName")}
          disabled={!isEditing}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Last Name"
          value={profileForm.lastName}
          onChange={onFormChange("lastName")}
          disabled={!isEditing}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Email"
          value={userEmail}
          disabled
          fullWidth
          size="small"
          InputProps={{
            startAdornment: <Email sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Grid>
    </Grid>

    {isEditing && (
      <Box display="flex" gap={2} mt={2}>
        <Button
          variant="contained"
          startIcon={submitting ? <CircularProgress size={16} /> : <Save />}
          onClick={onSubmit}
          disabled={submitting}
        >
          Save Changes
        </Button>
        <Button
          variant="outlined"
          startIcon={<Cancel />}
          onClick={onCancelEdit}
        >
          Cancel
        </Button>
      </Box>
    )}
  </>
);
