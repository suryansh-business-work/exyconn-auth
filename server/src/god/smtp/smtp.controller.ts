import { Response } from "express";
import nodemailer from "nodemailer";
import { successResponse, badRequestResponse, logger } from "../../common";
import { GodAuthRequest } from "../../middlewares/god.middleware";

// Error response helper for SMTP connection issues (returns 400 for user-correctable errors)
const smtpErrorResponse = (
  res: Response,
  message: string,
  details: string,
  code?: string,
) => {
  return badRequestResponse(res, `${message}: ${details}`, {
    message,
    details,
    code,
  });
};

interface SmtpTestRequest {
  host: string;
  port: number;
  secure?: boolean;
  user: string;
  pass: string;
}

interface SendTestEmailRequest extends SmtpTestRequest {
  toEmail: string;
}

/**
 * @desc    Test SMTP Connection
 * @route   POST /api/god/smtp/test-connection
 * @access  God only
 */
export const testSmtpConnection = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const { host, port, secure, user, pass } = req.body as SmtpTestRequest;

    // Validate required fields
    if (!host || !port || !user || !pass) {
      return badRequestResponse(
        res,
        "Missing required SMTP configuration fields",
      );
    }

    logger.info("Testing SMTP connection", {
      host,
      port,
      user: user.substring(0, 3) + "***",
    });

    // Auto-detect secure based on port: 465 = SSL, 587/25 = STARTTLS
    const portNum = Number(port);
    const isSecure = secure !== undefined ? secure : portNum === 465;

    // Create a test transporter
    const transporter = nodemailer.createTransport({
      host,
      port: portNum,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection
    await transporter.verify();

    logger.info("SMTP connection test successful", { host, port });

    return successResponse(
      res,
      {
        connected: true,
        host,
        port,
        secure: secure ?? false,
      },
      "SMTP connection successful",
    );
  } catch (error: any) {
    logger.error("SMTP connection test failed", {
      error: error.message,
      code: error.code,
    });

    let errorMessage = "Failed to connect to SMTP server";
    let errorDetails = error.message;

    // Provide more specific error messages
    if (error.code === "ECONNREFUSED") {
      errorMessage = "Connection refused";
      errorDetails =
        "The SMTP server refused the connection. Check the host and port.";
    } else if (error.code === "ETIMEDOUT") {
      errorMessage = "Connection timeout";
      errorDetails =
        "Could not reach the SMTP server. Check your network and server address.";
    } else if (error.code === "EAUTH") {
      errorMessage = "Authentication failed";
      errorDetails =
        "Invalid username or password. For Gmail, use an App Password.";
    } else if (error.code === "ESOCKET") {
      errorMessage = "Socket error";
      errorDetails = "Check if the port and SSL/TLS settings are correct.";
    } else if (error.responseCode === 535) {
      errorMessage = "Authentication failed";
      errorDetails =
        "Invalid credentials. For Gmail, enable 'Less secure app access' or use an App Password.";
    }

    return smtpErrorResponse(res, errorMessage, errorDetails, error.code);
  }
};

/**
 * @desc    Send Test Email
 * @route   POST /api/god/smtp/send-test-email
 * @access  God only
 */
export const sendTestEmail = async (req: GodAuthRequest, res: Response) => {
  try {
    const { host, port, secure, user, pass, toEmail } =
      req.body as SendTestEmailRequest;

    // Validate required fields
    if (!host || !port || !user || !pass || !toEmail) {
      return badRequestResponse(res, "Missing required fields for test email");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return badRequestResponse(res, "Invalid recipient email address");
    }

    logger.info("Sending test email", {
      host,
      port,
      to: toEmail,
      from: user.substring(0, 3) + "***",
    });

    // Auto-detect secure based on port: 465 = SSL, 587/25 = STARTTLS
    const portNum = Number(port);
    const isSecure = secure !== undefined ? secure : portNum === 465;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host,
      port: portNum,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Send test email
    const info = await transporter.sendMail({
      from: `"SMTP Test" <${user}>`,
      to: toEmail,
      subject: "✅ SMTP Test Email - Configuration Successful",
      text: `
Hello!

This is a test email to verify your SMTP configuration.

If you're receiving this email, it means your SMTP settings are working correctly!

SMTP Configuration Details:
- Host: ${host}
- Port: ${port}
- Secure: ${secure ? "Yes (SSL/TLS)" : "No"}
- Username: ${user}

Sent at: ${new Date().toLocaleString()}

This is an automated test email from your Auth System configuration.
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .success-badge { display: inline-block; background-color: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; }
    .details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2563eb; }
    .details p { margin: 8px 0; color: #374151; }
    .details strong { color: #1f2937; }
    .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ SMTP Test Email</h1>
    </div>
    <div class="content">
      <div class="success-badge">Configuration Successful</div>
      <h2 style="color: #1f2937; margin-top: 0;">Hello!</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        This is a test email to verify your SMTP configuration. If you're receiving this email, 
        it means your SMTP settings are working correctly!
      </p>
      
      <div class="details">
        <p><strong>SMTP Configuration Details:</strong></p>
        <p><strong>Host:</strong> ${host}</p>
        <p><strong>Port:</strong> ${port}</p>
        <p><strong>Secure:</strong> ${secure ? "Yes (SSL/TLS)" : "No"}</p>
        <p><strong>Username:</strong> ${user}</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated test email from your Auth System configuration.</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    logger.info("Test email sent successfully", {
      messageId: info.messageId,
      to: toEmail,
    });

    return successResponse(
      res,
      {
        sent: true,
        messageId: info.messageId,
        to: toEmail,
      },
      "Test email sent successfully",
    );
  } catch (error: any) {
    logger.error("Failed to send test email", {
      error: error.message,
      code: error.code,
    });

    let errorMessage = "Failed to send test email";
    let errorDetails = error.message;

    if (error.code === "EAUTH") {
      errorMessage = "Authentication failed";
      errorDetails =
        "Invalid credentials. Please check your SMTP username and password.";
    } else if (error.responseCode === 550) {
      errorMessage = "Recipient rejected";
      errorDetails = "The recipient email address was rejected by the server.";
    }

    return smtpErrorResponse(res, errorMessage, errorDetails, error.code);
  }
};
