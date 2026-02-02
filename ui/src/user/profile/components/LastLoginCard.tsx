import React from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { AccessTime } from "@mui/icons-material";

interface LastLoginCardProps {
  lastLoginAt: string | Date | undefined;
  lastLoginIp?: string;
}

export const LastLoginCard: React.FC<LastLoginCardProps> = ({
  lastLoginAt,
  lastLoginIp,
}) => {
  const formatLastLogin = (date: string | Date | undefined) => {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          <AccessTime sx={{ mr: 1, verticalAlign: "middle" }} />
          Last Login
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Last Login Time
            </Typography>
            <Typography variant="body1">
              {formatLastLogin(lastLoginAt)}
            </Typography>
          </Grid>
          {lastLoginIp && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                IP Address
              </Typography>
              <Typography variant="body1">{lastLoginIp}</Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
