import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Switch,
  Tooltip,
  Typography,
  Box,
  Button,
  Skeleton,
  alpha,
  Snackbar,
} from "@mui/material";
import {
  Edit,
  Delete,
  People,
  Assessment,
  Add,
  Business,
  ContentCopy,
  Key,
} from "@mui/icons-material";
import type { GodOrganization } from "../../types/god";

interface OrganizationsTableProps {
  organizations: GodOrganization[];
  loading: boolean;
  updatingStatus: string | null;
  debouncedSearch: string;
  onEdit: (org: GodOrganization) => void;
  onDelete: (org: GodOrganization) => void;
  onViewUsers: (org: GodOrganization) => void;
  onViewDashboard: (org: GodOrganization) => void;
  onStatusToggle: (org: GodOrganization) => void;
  onCreateClick: () => void;
}

const OrganizationsTable: React.FC<OrganizationsTableProps> = ({
  organizations,
  loading,
  updatingStatus,
  debouncedSearch,
  onEdit,
  onDelete,
  onViewUsers,
  onViewDashboard,
  onStatusToggle,
  onCreateClick,
}) => {
  const [copiedApiKey, setCopiedApiKey] = useState<string | null>(null);

  // Copy API key to clipboard
  const handleCopyApiKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedApiKey(apiKey);
      setTimeout(() => setCopiedApiKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy API key:", err);
    }
  };

  return (
    <>
      <TableContainer sx={{ maxHeight: "70vh" }}>
        <Table sx={{ minWidth: 650 }} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
              >
                Slug
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
              >
                API Key
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
                align="center"
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
              >
                Business Type
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
                align="center"
              >
                Employees
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
              >
                Created
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
                align="center"
              >
                Quick Actions
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.50",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                  py: 2,
                }}
                align="right"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ py: 1.5 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Skeleton variant="text" width="90%" height={20} />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Skeleton variant="rounded" width={120} height={24} />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <Skeleton
                      variant="rectangular"
                      width={40}
                      height={24}
                      sx={{ mx: "auto" }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <Skeleton variant="text" width={40} sx={{ mx: "auto" }} />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <Box display="flex" gap={1} justifyContent="center">
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                  <Business
                    sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No organizations found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {debouncedSearch
                      ? `No results match "${debouncedSearch}". Try a different search term.`
                      : "Get started by creating your first organization."}
                  </Typography>
                  {!debouncedSearch && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={onCreateClick}
                      sx={{ mt: 3 }}
                    >
                      Add Organization
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow
                  key={org._id}
                  sx={{
                    "&:hover": {
                      bgcolor: alpha("#1976d2", 0.04),
                    },
                    transition: "background-color 0.15s ease",
                    "& .MuiTableCell-root": {
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderBottomColor: "divider",
                    },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="text.primary"
                    >
                      {org.orgName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={org.orgSlug || "N/A"}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        borderRadius: 1.5,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {org.orgEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {org.apiKey ? (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Tooltip title={org.apiKey}>
                          <Chip
                            icon={<Key sx={{ fontSize: 14 }} />}
                            label={`${org.apiKey.substring(0, 12)}...`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 500,
                              borderRadius: 1.5,
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              bgcolor: alpha("#4caf50", 0.05),
                              borderColor: alpha("#4caf50", 0.3),
                              "& .MuiChip-icon": {
                                color: "#4caf50",
                              },
                            }}
                          />
                        </Tooltip>
                        <Tooltip
                          title={
                            copiedApiKey === org.apiKey
                              ? "Copied!"
                              : "Copy API Key"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleCopyApiKey(org.apiKey!)}
                            sx={{
                              width: 24,
                              height: 24,
                              color:
                                copiedApiKey === org.apiKey
                                  ? "success.main"
                                  : "text.secondary",
                              "&:hover": {
                                bgcolor: alpha("#4caf50", 0.1),
                              },
                            }}
                          >
                            <ContentCopy sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.disabled"
                        sx={{ fontStyle: "italic" }}
                      >
                        No key
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip
                      title={
                        org.orgActiveStatus
                          ? "Active - Click to deactivate"
                          : "Inactive - Click to activate"
                      }
                    >
                      <Switch
                        checked={org.orgActiveStatus || false}
                        onChange={() => onStatusToggle(org)}
                        disabled={updatingStatus === org._id}
                        color="success"
                        size="small"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={org.orgBusinessType || "N/A"}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        borderRadius: 1.5,
                        bgcolor: alpha("#1976d2", 0.05),
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="text.primary"
                    >
                      {org.numberOfEmployees || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.85rem" }}
                    >
                      {new Date(org.createdAt).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <Tooltip title="View Users">
                        <IconButton
                          color="info"
                          onClick={() => onViewUsers(org)}
                          size="small"
                          sx={{
                            bgcolor: alpha("#2196f3", 0.1),
                            "&:hover": {
                              bgcolor: alpha("#2196f3", 0.2),
                              transform: "scale(1.05)",
                            },
                            transition: "all 0.15s ease",
                            width: 32,
                            height: 32,
                          }}
                        >
                          <People fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Dashboard">
                        <IconButton
                          color="secondary"
                          onClick={() => onViewDashboard(org)}
                          size="small"
                          sx={{
                            bgcolor: alpha("#9c27b0", 0.1),
                            "&:hover": {
                              bgcolor: alpha("#9c27b0", 0.2),
                              transform: "scale(1.05)",
                            },
                            transition: "all 0.15s ease",
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Assessment fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => onEdit(org)}
                          size="small"
                          sx={{
                            bgcolor: alpha("#1976d2", 0.1),
                            "&:hover": {
                              bgcolor: alpha("#1976d2", 0.2),
                              transform: "scale(1.05)",
                            },
                            transition: "all 0.15s ease",
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => onDelete(org)}
                          size="small"
                          sx={{
                            bgcolor: alpha("#d32f2f", 0.1),
                            "&:hover": {
                              bgcolor: alpha("#d32f2f", 0.2),
                              transform: "scale(1.05)",
                            },
                            transition: "all 0.15s ease",
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={!!copiedApiKey}
        autoHideDuration={2000}
        onClose={() => setCopiedApiKey(null)}
        message="API Key copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default OrganizationsTable;
