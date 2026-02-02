import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";

interface UsersFilterBarProps {
  search: string;
  roleFilter: string;
  verifiedFilter: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleFilterChange: (value: string) => void;
  onVerifiedFilterChange: (value: string) => void;
}

const UsersFilterBar: React.FC<UsersFilterBarProps> = ({
  search,
  roleFilter,
  verifiedFilter,
  onSearchChange,
  onRoleFilterChange,
  onVerifiedFilterChange,
}) => {
  return (
    <Grid container spacing={2} mb={3}>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={search}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={6} sm={3} md={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => onRoleFilterChange(e.target.value)}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} sm={3} md={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={verifiedFilter}
            label="Status"
            onChange={(e) => onVerifiedFilterChange(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Verified</MenuItem>
            <MenuItem value="false">Unverified</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default UsersFilterBar;
