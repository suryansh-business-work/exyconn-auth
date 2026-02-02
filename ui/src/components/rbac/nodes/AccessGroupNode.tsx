import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Box, Typography, Chip, Badge } from "@mui/material";
import {
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

export interface AccessGroupNodeData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  enabled: boolean;
  permissionCount: number;
  activePermissions: number;
  onClick?: (id: string) => void;
}

const AccessGroupNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as AccessGroupNodeData;

  return (
    <Box
      sx={{
        background: "#fff",
        border: `2px solid ${selected ? nodeData.color : nodeData.enabled ? "#e0e0e0" : "#f0f0f0"}`,
        borderRadius: 2,
        minWidth: 180,
        opacity: nodeData.enabled ? 1 : 0.6,
        boxShadow: selected
          ? `0 4px 20px ${nodeData.color}40`
          : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          borderColor: nodeData.color,
          boxShadow: `0 4px 12px ${nodeData.color}25`,
          transform: "translateY(-1px)",
        },
      }}
      onClick={() => nodeData.onClick?.(nodeData.id)}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: nodeData.color,
          width: 10,
          height: 10,
          border: "2px solid #fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        }}
      />

      {/* Header */}
      <Box
        sx={{
          background: nodeData.enabled ? nodeData.color : "#9e9e9e",
          px: 1.5,
          py: 1,
          borderRadius: "6px 6px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <FolderIcon sx={{ color: "#fff", fontSize: 18 }} />
        <Typography
          variant="body2"
          sx={{
            color: "#fff",
            fontWeight: 600,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {nodeData.name}
        </Typography>
        {nodeData.enabled ? (
          <CheckCircleIcon sx={{ color: "#fff", fontSize: 16 }} />
        ) : (
          <CancelIcon sx={{ color: "#fff", fontSize: 16 }} />
        )}
      </Box>

      {/* Body */}
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            mb: 1,
            fontSize: "0.7rem",
          }}
        >
          {nodeData.slug}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Badge
            badgeContent={nodeData.activePermissions}
            color="primary"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: nodeData.enabled ? nodeData.color : "#9e9e9e",
                fontSize: "0.65rem",
              },
            }}
          >
            <Chip
              label="Permissions"
              size="small"
              sx={{
                fontSize: "0.65rem",
                height: 20,
                bgcolor: "#f5f5f5",
                color: "text.secondary",
              }}
            />
          </Badge>
        </Box>
      </Box>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: nodeData.color,
          width: 10,
          height: 10,
          border: "2px solid #fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        }}
      />
    </Box>
  );
};

export default memo(AccessGroupNode);
