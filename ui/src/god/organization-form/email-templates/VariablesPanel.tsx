import React from "react";
import { Box, Typography, Chip, Paper, Tooltip } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { EmailTemplate, GLOBAL_VARIABLES } from "./constants";

interface VariablesPanelProps {
  selectedTemplate: EmailTemplate;
  onCopyVariable: (variable: string) => void;
  variableValues?: Record<string, string>;
}

const VariablesPanel: React.FC<VariablesPanelProps> = ({
  selectedTemplate,
  onCopyVariable,
  variableValues = {},
}) => {
  const getTooltipContent = (variable: string) => {
    const value = variableValues[variable];
    if (value) {
      const displayValue =
        value.length > 50 ? value.substring(0, 50) + "..." : value;
      return (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            {`{{${variable}}}`}
          </Typography>
          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 0.5, color: "grey.300" }}
          >
            Value: {displayValue || "(empty)"}
          </Typography>
          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 0.5, opacity: 0.7 }}
          >
            Click to copy
          </Typography>
        </Box>
      );
    }
    return `Copy {{${variable}}}`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 220,
        borderLeft: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2">Template Variables</Typography>
        <Typography variant="caption" color="text.secondary">
          Hover for value, click to copy
        </Typography>
      </Box>

      <Box sx={{ p: 1, overflow: "auto", flex: 1 }}>
        <Typography
          variant="caption"
          color="primary"
          fontWeight="medium"
          sx={{ mb: 0.5, display: "block" }}
        >
          {selectedTemplate.name}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
          {selectedTemplate.variables.map((v) => (
            <Tooltip
              key={v}
              title={getTooltipContent(v)}
              arrow
              placement="left"
            >
              <Chip
                label={v}
                size="small"
                onClick={() => onCopyVariable(`{{${v}}}`)}
                sx={{ cursor: "pointer", height: 22, fontSize: "0.7rem" }}
                icon={<ContentCopy sx={{ fontSize: 12 }} />}
              />
            </Tooltip>
          ))}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="medium"
          sx={{ mb: 0.5, display: "block" }}
        >
          Global Variables
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {GLOBAL_VARIABLES.map((v) => (
            <Tooltip
              key={v}
              title={getTooltipContent(v)}
              arrow
              placement="left"
            >
              <Chip
                label={v}
                size="small"
                variant="outlined"
                onClick={() => onCopyVariable(`{{${v}}}`)}
                sx={{
                  cursor: "pointer",
                  height: 22,
                  fontSize: "0.7rem",
                  borderColor: variableValues[v] ? "primary.main" : "divider",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default VariablesPanel;
