import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
} from "@mui/material";
import { Email } from "@mui/icons-material";
import { EmailTemplate } from "./constants";

interface TemplateListProps {
  templates: EmailTemplate[];
  selectedTemplate: EmailTemplate;
  onSelectTemplate: (template: EmailTemplate) => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "verification":
      return "primary";
    case "security":
      return "error";
    case "notification":
      return "success";
    case "system":
      return "warning";
    default:
      return "default";
  }
};

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography
          variant="subtitle1"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Email color="primary" fontSize="small" />
          Email Templates
        </Typography>
      </Box>

      <List dense sx={{ overflow: "auto", flex: 1, py: 0 }}>
        {templates.map((template) => (
          <ListItem key={template.id} disablePadding>
            <ListItemButton
              selected={selectedTemplate.id === template.id}
              onClick={() => onSelectTemplate(template)}
              sx={{
                py: 0.75,
                borderLeft: selectedTemplate.id === template.id ? 3 : 0,
                borderColor: "primary.main",
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>{template.icon}</ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {template.name}
                    </Typography>
                    {template.isRequired && (
                      <Chip
                        label="Req"
                        size="small"
                        color="error"
                        sx={{ height: 16, fontSize: "0.6rem" }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Chip
                    label={template.category}
                    size="small"
                    color={getCategoryColor(template.category) as any}
                    variant="outlined"
                    sx={{ height: 16, fontSize: "0.55rem", mt: 0.25 }}
                  />
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TemplateList;
