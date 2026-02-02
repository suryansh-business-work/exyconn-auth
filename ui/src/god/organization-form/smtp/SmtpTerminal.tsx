import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Terminal as TerminalIcon,
  Clear as ClearIcon,
  PlayArrow as RunIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { API_BASE_URL } from "../../../apis";
import { postRequest, isSuccess, extractMessage } from "../../../lib/api";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "error" | "command";
  message: string;
}

interface SmtpTerminalProps {
  smtpConfig: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
  };
}

const SmtpTerminal: React.FC<SmtpTerminalProps> = ({ smtpConfig }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testEmail, setTestEmail] = useState("");
  const [running, setRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (type: LogEntry["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, { timestamp, type, message }]);
  };

  const clearLogs = () => setLogs([]);

  const isConfigured =
    smtpConfig.host && smtpConfig.port && smtpConfig.user && smtpConfig.pass;

  const testConnection = async () => {
    if (!isConfigured) {
      addLog(
        "error",
        "SMTP settings incomplete. Please fill all required fields.",
      );
      return;
    }

    setRunning(true);
    addLog(
      "command",
      `smtp-test connect --host ${smtpConfig.host} --port ${smtpConfig.port}`,
    );
    addLog("info", `Connecting to ${smtpConfig.host}:${smtpConfig.port}...`);

    try {
      const response = await postRequest(
        `${API_BASE_URL}/god/smtp/test-connection`,
        {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      );

      if (isSuccess(response)) {
        addLog("success", "✓ Connection established successfully");
        addLog("success", "✓ Authentication verified");
        addLog(
          "info",
          `Server: ${smtpConfig.host}:${smtpConfig.port} (${smtpConfig.secure ? "SSL/TLS" : "STARTTLS"})`,
        );
      } else {
        addLog("error", `✗ Connection failed: ${extractMessage(response)}`);
      }
    } catch (error: any) {
      addLog("error", `✗ Error: ${error.message || "Unknown error"}`);
    } finally {
      setRunning(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      addLog("error", "Please enter a recipient email address.");
      return;
    }
    if (!isConfigured) {
      addLog("error", "SMTP settings incomplete.");
      return;
    }

    setRunning(true);
    addLog("command", `smtp-test send --to ${testEmail}`);
    addLog("info", `Preparing test email to: ${testEmail}`);
    addLog("info", `From: ${smtpConfig.user}`);

    try {
      const response = await postRequest(
        `${API_BASE_URL}/god/smtp/send-test-email`,
        {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.user,
          pass: smtpConfig.pass,
          toEmail: testEmail,
        },
      );

      if (isSuccess(response)) {
        addLog("success", "✓ Email queued for delivery");
        addLog("success", "✓ Message accepted by server");
        addLog("info", `Check inbox of ${testEmail}`);
      } else {
        addLog("error", `✗ Send failed: ${extractMessage(response)}`);
      }
    } catch (error: any) {
      addLog("error", `✗ Error: ${error.message || "Unknown error"}`);
    } finally {
      setRunning(false);
    }
  };

  const copyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "#4caf50";
      case "error":
        return "#f44336";
      case "command":
        return "#2196f3";
      default:
        return "#b0bec5";
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: "#1e1e1e",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TerminalIcon sx={{ color: "#4caf50", fontSize: 18 }} />
        <Typography
          variant="body2"
          sx={{ color: "#fff", flex: 1, fontFamily: "monospace" }}
        >
          SMTP Test Terminal
        </Typography>
        <Tooltip title="Copy Logs">
          <IconButton size="small" onClick={copyLogs} sx={{ color: "#b0bec5" }}>
            <CopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear">
          <IconButton
            size="small"
            onClick={clearLogs}
            sx={{ color: "#b0bec5" }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Terminal Output */}
      <Box
        ref={terminalRef}
        sx={{
          bgcolor: "#1e1e1e",
          height: 180,
          overflow: "auto",
          p: 1.5,
          fontFamily: '"Fira Code", "Consolas", monospace',
          fontSize: "12px",
          lineHeight: 1.5,
        }}
      >
        {logs.length === 0 && (
          <Typography
            sx={{ color: "#616161", fontSize: "12px", fontFamily: "inherit" }}
          >
            $ Ready. Click "Test Connection" or "Send Test Email" to begin...
          </Typography>
        )}
        {logs.map((log, i) => (
          <Box key={i} sx={{ color: getLogColor(log.type) }}>
            <Typography
              component="span"
              sx={{ color: "#616161", fontSize: "11px", mr: 1 }}
            >
              [{log.timestamp}]
            </Typography>
            {log.type === "command" && (
              <Typography component="span" sx={{ color: "#ff9800", mr: 0.5 }}>
                $
              </Typography>
            )}
            <Typography
              component="span"
              sx={{ fontSize: "12px", fontFamily: "inherit" }}
            >
              {log.message}
            </Typography>
          </Box>
        ))}
        {running && (
          <Typography
            sx={{ color: "#2196f3", fontSize: "12px", fontFamily: "inherit" }}
          >
            ⠋ Processing...
          </Typography>
        )}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: "#252526",
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          placeholder="test@example.com"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              bgcolor: "#1e1e1e",
              color: "#fff",
              fontFamily: "monospace",
              fontSize: "13px",
            },
          }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={testConnection}
          disabled={running || !isConfigured}
          sx={{ color: "#4caf50", borderColor: "#4caf50" }}
        >
          Test Connection
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<RunIcon />}
          onClick={sendTestEmail}
          disabled={running || !testEmail || !isConfigured}
          sx={{ bgcolor: "#2196f3" }}
        >
          Send Test Email
        </Button>
      </Box>
    </Paper>
  );
};

export default SmtpTerminal;
