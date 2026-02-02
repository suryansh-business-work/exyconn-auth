import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  CircularProgress,
  Avatar,
  Tooltip,
  Typography,
  Box,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Google as GoogleIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
} from "@mui/icons-material";

import type { GodUser } from "../../types/god";

interface UsersTableProps {
  users: GodUser[];
  loading: boolean;
  totalUsers: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (_event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onView: (user: GodUser) => void;
  onEdit: (user: GodUser) => void;
  onDelete: (user: GodUser) => void;
}

const getRoleColor = (
  role: string,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (role.toLowerCase()) {
    case "admin":
      return "error";
    case "user":
      return "primary";
    default:
      return "default";
  }
};

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  totalUsers,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const getProviderIcon = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case "google":
        return <GoogleIcon fontSize="small" color="action" />;
      case "email":
        return <EmailIcon fontSize="small" color="action" />;
      default:
        return <HelpIcon fontSize="small" color="disabled" />;
    }
  };

  return (
    <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 2 }}>
              User
            </TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 2 }}>
              Role
            </TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 2 }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 2 }}>
              Last Login
            </TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 2 }}>
              Joined
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontWeight: 600, bgcolor: "grey.50", py: 2 }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 8, border: 0 }}>
                <CircularProgress size={32} />
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 8, border: 0 }}>
                <Typography variant="body1" color="text.secondary">
                  No users found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user._id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": {
                    bgcolor: alpha("#1976d2", 0.04),
                  },
                  transition: "background-color 0.15s ease",
                }}
              >
                <TableCell sx={{ py: 1.5 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={user.profilePicture}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "primary.main",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Tooltip
                          title={`Provider: ${user.provider || "Unknown"}`}
                        >
                          {getProviderIcon(user.provider)}
                        </Tooltip>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      textTransform: "capitalize",
                      height: 24,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={user.isVerified ? "Verified" : "Unverified"}
                      color={user.isVerified ? "success" : "warning"}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 500, fontSize: "0.7rem", height: 24 }}
                    />
                    {user.mfaEnabled && (
                      <Chip
                        icon={<SecurityIcon style={{ fontSize: "0.9rem" }} />}
                        label="MFA"
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 500, fontSize: "0.7rem", height: 24 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  {user.lastLoginAt ? (
                    <Box>
                      <Typography variant="body2" fontSize="0.85rem">
                        {new Date(user.lastLoginAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(user.lastLoginAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                      {user.lastLoginIp && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          fontSize="0.7rem"
                        >
                          IP: {user.lastLoginIp}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Typography
                    variant="body2"
                    fontSize="0.85rem"
                    color="text.primary"
                  >
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1.5 }}>
                  <Box display="flex" justifyContent="center" gap={0.5}>
                    <Tooltip title="View Details" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onView(user)}
                        sx={{
                          width: 32,
                          height: 32,
                          "&:hover": {
                            bgcolor: alpha("#1976d2", 0.1),
                            transform: "scale(1.05)",
                          },
                          transition: "all 0.15s ease",
                        }}
                      >
                        <VisibilityIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit User" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(user)}
                        sx={{
                          width: 32,
                          height: 32,
                          "&:hover": {
                            bgcolor: alpha("#1976d2", 0.1),
                            transform: "scale(1.05)",
                          },
                          transition: "all 0.15s ease",
                        }}
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(user)}
                        sx={{
                          width: 32,
                          height: 32,
                          "&:hover": {
                            bgcolor: alpha("#d32f2f", 0.1),
                            transform: "scale(1.05)",
                          },
                          transition: "all 0.15s ease",
                        }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{ borderTop: "1px solid", borderColor: "divider" }}
      />
    </TableContainer>
  );
};

export default UsersTable;
