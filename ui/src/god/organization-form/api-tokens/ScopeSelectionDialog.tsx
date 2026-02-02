import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Tooltip,
} from "@mui/material";
import { Security, Close, Lock } from "@mui/icons-material";
import { AVAILABLE_SCOPES } from "./constants";

interface ScopeDialogProps {
  open: boolean;
  onClose: () => void;
  selectedScopes: string[];
  onChange: (scopes: string[]) => void;
  roleScopes?: string[];
}

export const ScopeSelectionDialog: React.FC<ScopeDialogProps> = ({
  open,
  onClose,
  selectedScopes,
  onChange,
  roleScopes = [],
}) => {
  const [tempSelected, setTempSelected] =
    React.useState<string[]>(selectedScopes);

  React.useEffect(() => {
    setTempSelected(selectedScopes);
  }, [selectedScopes, open]);

  const handleToggle = (scopeId: string) => {
    setTempSelected((prev) =>
      prev.includes(scopeId)
        ? prev.filter((s) => s !== scopeId)
        : [...prev, scopeId],
    );
  };

  const handleSave = () => {
    onChange(tempSelected);
    onClose();
  };

  const groupedScopes = AVAILABLE_SCOPES.reduce(
    (acc, scope) => {
      if (!acc[scope.category]) acc[scope.category] = [];
      acc[scope.category].push(scope);
      return acc;
    },
    {} as Record<string, typeof AVAILABLE_SCOPES>,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Security color="primary" />
          <Typography variant="h6">Select API Scopes</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            size="small"
            onClick={() => setTempSelected(AVAILABLE_SCOPES.map((s) => s.id))}
          >
            Select All
          </Button>
          <Button size="small" onClick={() => setTempSelected([])}>
            Clear All
          </Button>
        </Box>

        {Object.entries(groupedScopes).map(([category, scopes]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {category}
            </Typography>
            <List dense sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
              {scopes.map((scope) => {
                const isLimitedByRole =
                  roleScopes.length > 0 && !roleScopes.includes(scope.id);
                return (
                  <ListItemButton
                    key={scope.id}
                    onClick={() => !isLimitedByRole && handleToggle(scope.id)}
                    disabled={isLimitedByRole}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={tempSelected.includes(scope.id)}
                        disabled={isLimitedByRole}
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={scope.label}
                      secondary={scope.description}
                    />
                    {isLimitedByRole && (
                      <Tooltip title="Not available with selected role">
                        <Lock fontSize="small" color="disabled" />
                      </Tooltip>
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Apply ({tempSelected.length} scopes)
        </Button>
      </DialogActions>
    </Dialog>
  );
};
