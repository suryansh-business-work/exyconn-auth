import React, { useState } from "react";
import {
  Box,
  Popover,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import { ColorLens as ColorIcon } from "@mui/icons-material";

const PRESET_COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#607d8b",
  "#9e9e9e",
  "#000000",
];

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  size?: "small" | "medium";
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label = "Color",
  value,
  onChange,
  size = "small",
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size={size}
        sx={{ minWidth: 120 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                onClick={handleClick}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  bgcolor: value,
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
                  },
                }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Box
                component="span"
                onClick={handleClick}
                sx={{ cursor: "pointer", display: "flex" }}
              >
                <ColorIcon fontSize="small" sx={{ color: "action.active" }} />
              </Box>
            </InputAdornment>
          ),
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, width: 200 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            Preset Colors
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 0.5,
            }}
          >
            {PRESET_COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: color,
                  cursor: "pointer",
                  border: value === color ? "2px solid #000" : "1px solid #ccc",
                  transition: "transform 0.1s",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: 2,
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default ColorPicker;
