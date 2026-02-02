import React from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Security } from "@mui/icons-material";

interface MfaSectionProps {
  user: {
    mfaEnabled?: boolean;
    orgOptions?: {
      mfaEnabled?: boolean;
      mfaRequired?: boolean;
    };
    provider?: string;
  } | null;
  mfaLoading: boolean;
  onEnableMfa: () => void;
  onOpenDisableDialog: () => void;
}

export const MfaSection: React.FC<MfaSectionProps> = ({
  user,
  mfaLoading,
  onEnableMfa,
  onOpenDisableDialog,
}) => {
  // Don't render if MFA is not enabled for org
  if (!user?.orgOptions?.mfaEnabled) {
    return null;
  }

  const handleToggle = () => {
    if (user?.mfaEnabled) {
      // For disabling, show password dialog
      onOpenDisableDialog();
    } else {
      onEnableMfa();
    }
  };

  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            <Security sx={{ mr: 1, verticalAlign: "middle" }} />
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Add an extra layer of security. You'll receive a verification code
            via email each time you log in.
          </Typography>
        </Box>

        {/* MFA Switch - Disabled if org requires MFA */}
        {user?.orgOptions?.mfaRequired ? (
          <FormControlLabel
            control={<Switch checked={true} disabled color="primary" />}
            label={<Chip label="Required" size="small" color="primary" />}
            labelPlacement="start"
          />
        ) : (
          <FormControlLabel
            control={
              <Switch
                checked={user?.mfaEnabled || false}
                onChange={handleToggle}
                disabled={mfaLoading}
                color="primary"
              />
            }
            label={
              mfaLoading ? (
                <CircularProgress size={16} />
              ) : user?.mfaEnabled ? (
                "Enabled"
              ) : (
                "Disabled"
              )
            }
            labelPlacement="start"
          />
        )}
      </Box>

      {/* Status Alert */}
      {user?.orgOptions?.mfaRequired && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Two-factor authentication is required by your organization.
        </Alert>
      )}
      {user?.mfaEnabled && !user?.orgOptions?.mfaRequired && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Two-factor authentication is enabled on your account.
        </Alert>
      )}
    </>
  );
};
