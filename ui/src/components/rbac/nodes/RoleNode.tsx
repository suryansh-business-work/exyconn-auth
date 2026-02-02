import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

export interface RoleNodeData {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault?: boolean;
  isSystem?: boolean;
  accessGroupCount: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const RoleNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as RoleNodeData;

  return (
    <Box
      sx={{
        background: "#fff",
        border: `2px solid ${selected ? nodeData.color : "#e0e0e0"}`,
        borderRadius: 2,
        minWidth: 220,
        boxShadow: selected
          ? `0 4px 20px ${nodeData.color}40`
          : "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: nodeData.color,
          boxShadow: `0 4px 16px ${nodeData.color}30`,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: nodeData.color,
          px: 2,
          py: 1.5,
          borderRadius: "6px 6px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <PersonIcon sx={{ color: "#fff", fontSize: 20 }} />
        <Typography
          variant="subtitle2"
          sx={{
            color: "#fff",
            fontWeight: 600,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {nodeData.name || "New Role"}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {nodeData.isDefault && (
            <Tooltip title="Default Role">
              <StarIcon sx={{ color: "#fff", fontSize: 16 }} />
            </Tooltip>
          )}
          {nodeData.isSystem && (
            <Tooltip title="System Role">
              <LockIcon sx={{ color: "#fff", fontSize: 16 }} />
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ px: 2, py: 1.5 }}>
        {nodeData.description && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              mb: 1,
              lineHeight: 1.4,
            }}
          >
            {nodeData.description}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Chip
            label={`${nodeData.accessGroupCount} Access Groups`}
            size="small"
            sx={{
              fontSize: "0.7rem",
              height: 22,
              bgcolor: `${nodeData.color}15`,
              color: nodeData.color,
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Actions */}
        {!nodeData.isSystem && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 0.5,
              borderTop: "1px solid #f0f0f0",
              pt: 1,
              mt: 1,
            }}
          >
            {nodeData.onEdit && (
              <Tooltip title="Edit Role">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    nodeData.onEdit?.(nodeData.id);
                  }}
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: nodeData.color },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {nodeData.onDelete && (
              <Tooltip title="Delete Role">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    nodeData.onDelete?.(nodeData.id);
                  }}
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: "#f44336" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: nodeData.color,
          width: 12,
          height: 12,
          border: "2px solid #fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      />
    </Box>
  );
};

export default memo(RoleNode);
