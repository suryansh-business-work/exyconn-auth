import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { MoreVert, Google } from "@mui/icons-material";
import { AdminUser } from "../useAdminLogic";

interface UsersTableProps {
  users: AdminUser[];
  loading: boolean;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, user: AdminUser) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  onMenuOpen,
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={120} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={180} />
                </TableCell>
                <TableCell>
                  <Skeleton
                    variant="rectangular"
                    width={60}
                    height={24}
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={24}
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={40} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="circular" width={24} height={24} />
                </TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No users found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={user.profilePicture}
                      sx={{ bgcolor: "primary.main" }}
                    >
                      {getInitials(user.firstName, user.lastName)}
                    </Avatar>
                    <Typography fontWeight={500}>
                      {user.firstName} {user.lastName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    }
                    size="small"
                    color={user.role === "admin" ? "secondary" : "default"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isVerified ? "Verified" : "Unverified"}
                    size="small"
                    color={user.isVerified ? "success" : "warning"}
                  />
                </TableCell>
                <TableCell>
                  {user.provider === "google" ? (
                    <Tooltip title="Google OAuth">
                      <Google fontSize="small" color="action" />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => onMenuOpen(e, user)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable;
