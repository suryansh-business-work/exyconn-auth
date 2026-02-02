import {
  Email,
  Lock,
  Verified,
  Key,
  PersonAdd,
  Warning,
  Security,
  Notifications,
  CheckCircle,
} from "@mui/icons-material";

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  fileName: string;
  category: "verification" | "security" | "notification" | "system";
  isRequired: boolean;
  variables: string[];
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome-verify",
    name: "Welcome & Verify Email",
    description: "Email with verification code/link for new user signup",
    icon: <Verified />,
    fileName: "welcome-verify",
    category: "verification",
    isRequired: true,
    variables: [
      "firstName",
      "otp",
      "verificationLink",
      "companyName",
      "expiryMinutes",
    ],
  },
  {
    id: "welcome-email",
    name: "Welcome Email",
    description: "Welcome message sent after successful registration",
    icon: <PersonAdd />,
    fileName: "welcome-email",
    category: "notification",
    isRequired: false,
    variables: ["firstName", "companyName", "loginUrl"],
  },
  {
    id: "mfa-enable",
    name: "Enable MFA",
    description: "OTP code to enable multi-factor authentication",
    icon: <Security />,
    fileName: "mfa-enable",
    category: "security",
    isRequired: false,
    variables: ["firstName", "otp", "companyName", "expiryMinutes"],
  },
  {
    id: "password-reset",
    name: "Password Reset",
    description: "Password reset code/link email",
    icon: <Key />,
    fileName: "password-reset",
    category: "security",
    isRequired: true,
    variables: [
      "firstName",
      "otp",
      "resetLink",
      "companyName",
      "expiryMinutes",
    ],
  },
  {
    id: "mfa-login",
    name: "MFA Login Code",
    description: "OTP code for email-based MFA login",
    icon: <Security />,
    fileName: "mfa-login",
    category: "security",
    isRequired: true,
    variables: ["firstName", "otp", "companyName", "expiryMinutes"],
  },
  {
    id: "blocked-account",
    name: "Blocked Account",
    description: "Notification when account is blocked",
    icon: <Lock />,
    fileName: "blocked-account",
    category: "security",
    isRequired: false,
    variables: ["firstName", "companyName", "supportEmail", "reason"],
  },
  {
    id: "password-breach",
    name: "Password Breach Alert",
    description: "Alert when password appears in known breaches",
    icon: <Warning color="error" />,
    fileName: "password-breach",
    category: "security",
    isRequired: false,
    variables: ["firstName", "companyName", "resetLink"],
  },
  {
    id: "god-credentials",
    name: "User Invitation",
    description: "Invitation email for new users",
    icon: <Email />,
    fileName: "god-credentials",
    category: "notification",
    isRequired: false,
    variables: ["firstName", "email", "password", "companyName", "loginUrl"],
  },
  {
    id: "recentLogin",
    name: "Recent Login Alert",
    description: "Alert for new login from unknown device/location",
    icon: <Notifications />,
    fileName: "recentLogin",
    category: "security",
    isRequired: false,
    variables: ["firstName", "deviceInfo", "location", "time", "companyName"],
  },
  {
    id: "passwordResetSuccess",
    name: "Password Reset Success",
    description: "Confirmation after successful password change",
    icon: <CheckCircle color="success" />,
    fileName: "passwordResetSuccess",
    category: "notification",
    isRequired: false,
    variables: ["firstName", "companyName", "time"],
  },
];

export const GLOBAL_VARIABLES = [
  "companyName",
  "logoUrl",
  "logoWidth",
  "primaryColor",
  "backgroundColor",
  "year",
  "supportEmail",
  "supportUrl",
];

export const DEFAULT_MJML_TEMPLATE = `<mjml>
  <mj-head>
    <mj-title>{{subject}}</mj-title>
    <mj-attributes>
      <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" />
      <mj-text padding="10px 25px" line-height="24px" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="{{backgroundColor}}">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-image src="{{logoUrl}}" alt="{{companyName}}" width="{{logoWidth}}" align="center" />
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="{{primaryColor}}" font-weight="700" align="center">
          Hello, {{firstName}}!
        </mj-text>
        <mj-text font-size="16px" color="#555555" align="center">
          Your email content goes here.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="20px 25px">
      <mj-column>
        <mj-divider border-color="#e0e0e0" />
        <mj-text font-size="12px" color="#999999" align="center">
          © {{year}} {{companyName}}. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
