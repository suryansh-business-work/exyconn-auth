import React from "react";
import { Button, CircularProgress } from "@mui/material";

interface SubmitButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading = false,
  loadingText = "Processing...",
  children,
  fullWidth = true,
}) => {
  return (
    <Button
      type="submit"
      variant="contained"
      fullWidth={fullWidth}
      size="large"
      disabled={loading}
      sx={{
        mt: 2,
        py: 1.5,
        textTransform: "none",
        fontSize: "1rem",
        fontWeight: 600,
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default SubmitButton;
