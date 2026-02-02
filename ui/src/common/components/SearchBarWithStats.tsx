import React from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";

interface SearchBarWithStatsProps {
  search: string;
  onSearchChange: (value: string) => void;
  totalCount?: number;
  loading?: boolean;
  placeholder?: string;
  searchResults?: string;
}

const SearchBarWithStats: React.FC<SearchBarWithStatsProps> = ({
  search,
  onSearchChange,
  totalCount,
  loading = false,
  placeholder = "Search...",
  searchResults,
}) => {
  return (
    <Card elevation={1} sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" gap={3} alignItems="center">
          <Box flex={1}>
            <TextField
              fullWidth
              variant="outlined"
              size="medium"
              placeholder={placeholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                },
              }}
            />
          </Box>
          {!loading && totalCount !== undefined && (
            <Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Total Items
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                align="center"
                color="primary"
              >
                {totalCount}
              </Typography>
            </Box>
          )}
        </Box>
        {searchResults && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              {searchResults}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchBarWithStats;
