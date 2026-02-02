import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Add as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  AccessType,
  ACCESS_TYPE_CONFIG,
  PermissionAction,
} from "../../../types/rbac";

export interface PermissionNodeData {
  id: string;
  action: PermissionAction;
  accessType: AccessType;
  groupColor: string;
  onAccessTypeChange?: (permissionId: string, accessType: AccessType) => void;
}

const PERMISSION_ICONS: Record<PermissionAction, React.ReactNode> = {
  view: <ViewIcon fontSize="small" />,
  create: <CreateIcon fontSize="small" />,
  update: <UpdateIcon fontSize="small" />,
  delete: <DeleteIcon fontSize="small" />,
};

const PERMISSION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
};

const PermissionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as PermissionNodeData;
  const accessConfig = ACCESS_TYPE_CONFIG[nodeData.accessType];

  return (
    <Box
      sx={{
        background: "#fff",
        border: `2px solid ${selected ? nodeData.groupColor : "#e0e0e0"}`,
        borderRadius: 2,
        minWidth: 160,
        boxShadow: selected
          ? `0 4px 16px ${nodeData.groupColor}40`
          : "0 2px 6px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: nodeData.groupColor,
          boxShadow: `0 4px 12px ${nodeData.groupColor}20`,
        },
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: nodeData.groupColor,
          width: 8,
          height: 8,
          border: "2px solid #fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />

      {/* Header */}
      <Box
        sx={{
          background: `${nodeData.groupColor}15`,
          px: 1.5,
          py: 0.75,
          borderRadius: "6px 6px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ color: nodeData.groupColor, display: "flex" }}>
          {PERMISSION_ICONS[nodeData.action]}
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: nodeData.groupColor,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {PERMISSION_LABELS[nodeData.action]}
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <FormControl fullWidth size="small">
          <Select
            value={nodeData.accessType}
            onChange={(e) => {
              nodeData.onAccessTypeChange?.(
                nodeData.id,
                e.target.value as AccessType,
              );
            }}
            sx={{
              fontSize: "0.75rem",
              height: 32,
              "& .MuiSelect-select": {
                py: 0.5,
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            {Object.entries(ACCESS_TYPE_CONFIG).map(([type, config]) => (
              <MenuItem key={type} value={type}>
                <Chip
                  label={config.label}
                  size="small"
                  sx={{
                    bgcolor: `${config.color}15`,
                    color: config.color,
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Current Access Type Indicator */}
      <Box
        sx={{
          height: 4,
          bgcolor: accessConfig.color,
          borderRadius: "0 0 6px 6px",
        }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: accessConfig.color,
          width: 8,
          height: 8,
          border: "2px solid #fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
    </Box>
  );
};

export default memo(PermissionNode);
