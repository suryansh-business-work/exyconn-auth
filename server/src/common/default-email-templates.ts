/**
 * Default embedded email templates
 * These are used as fallback when no custom template is defined
 */

// Base template wrapper with consistent styling
const wrapTemplate = (content: string) => `<mjml>
  <mj-head>
    <mj-title>{{subject}}</mj-title>
    <mj-preview>{{previewText}}</mj-preview>
    <mj-attributes>
      <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" />
      <mj-text padding="10px 25px" line-height="24px" />
      <mj-section padding="20px 0" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="{{backgroundColor}}">
    <!-- Header with Logo -->
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-image src="{{logoUrl}}" alt="{{companyName}}" width="{{logoWidth}}" align="center" />
      </mj-column>
    </mj-section>

    ${content}

    <!-- Footer -->
    <mj-section background-color="#ffffff" padding="20px 25px">
      <mj-column>
        <mj-divider border-color="#e0e0e0" />
        <mj-text font-size="12px" color="#999999" align="center">
          © {{year}} {{companyName}}. All rights reserved.<br/>
          Need help? Contact us at <a href="mailto:{{supportEmail}}" style="color: {{primaryColor}};">{{supportEmail}}</a>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

// Welcome & Verify Email (OTP verification after signup)
export const welcomeVerify = wrapTemplate(`
    <!-- Main Content -->
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="{{primaryColor}}" font-weight="700" align="center" padding-bottom="10px">
          Welcome to {{companyName}}! 🎉
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, thank you for signing up. Please verify your email address to get started.
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- OTP Box -->
    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-text align="center" padding-bottom="10px">
          <span style="font-size: 14px; color: #64748b;">Your verification code is:</span>
        </mj-text>
        <mj-text align="center">
          <span style="display: inline-block; background-color: #f0f9ff; border: 2px dashed {{primaryColor}}; padding: 16px 32px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: {{primaryColor}}; border-radius: 8px;">{{otp}}</span>
        </mj-text>
        <mj-text font-size="13px" color="#ef4444" align="center" padding-top="15px">
          ⏰ This code expires in {{expiryMinutes}} minutes
        </mj-text>
      </mj-column>
    </mj-section>
`);

// Welcome Email (after verification)
export const welcomeEmail = wrapTemplate(`
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="28px" color="{{primaryColor}}" font-weight="700" align="center" padding-bottom="10px">
          Welcome to {{companyName}}! 🎉
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, your account has been verified successfully. We're excited to have you on board!
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-button background-color="{{primaryColor}}" color="#ffffff" border-radius="6px" font-size="16px" font-weight="600" href="{{loginUrl}}" padding="20px 40px">
          Go to Dashboard
        </mj-button>
      </mj-column>
    </mj-section>
`);

// MFA Enable (OTP to enable MFA)
export const mfaEnable = wrapTemplate(`
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="{{primaryColor}}" font-weight="700" align="center" padding-bottom="10px">
          🔐 Enable Two-Factor Authentication
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, use the code below to enable two-factor authentication on your account.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-text align="center" padding-bottom="10px">
          <span style="font-size: 14px; color: #64748b;">Your verification code:</span>
        </mj-text>
        <mj-text align="center">
          <span style="display: inline-block; background-color: #f0f9ff; border: 2px dashed {{primaryColor}}; padding: 16px 32px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: {{primaryColor}}; border-radius: 8px;">{{otp}}</span>
        </mj-text>
        <mj-text font-size="13px" color="#ef4444" align="center" padding-top="15px">
          ⏰ This code expires in {{expiryMinutes}} minutes
        </mj-text>
      </mj-column>
    </mj-section>
`);

// MFA Login Code
export const mfaLogin = wrapTemplate(`
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="{{primaryColor}}" font-weight="700" align="center" padding-bottom="10px">
          🔐 Login Verification Code
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, someone is trying to sign in to your account. Use the code below to complete the login.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-text align="center" padding-bottom="10px">
          <span style="font-size: 14px; color: #64748b;">Your login code:</span>
        </mj-text>
        <mj-text align="center">
          <span style="display: inline-block; background-color: #f0f9ff; border: 2px dashed {{primaryColor}}; padding: 16px 32px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: {{primaryColor}}; border-radius: 8px;">{{otp}}</span>
        </mj-text>
        <mj-text font-size="13px" color="#ef4444" align="center" padding-top="15px">
          ⏰ This code expires in {{expiryMinutes}} minutes
        </mj-text>
        <mj-text font-size="13px" color="#64748b" align="center" padding-top="10px">
          If you didn't try to log in, please secure your account immediately.
        </mj-text>
      </mj-column>
    </mj-section>
`);

// Password Reset (OTP for password reset)
export const passwordReset = wrapTemplate(`
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="{{primaryColor}}" font-weight="700" align="center" padding-bottom="10px">
          🔑 Reset Your Password
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, we received a request to reset your password. Use the code below to proceed.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-text align="center" padding-bottom="10px">
          <span style="font-size: 14px; color: #64748b;">Your reset code:</span>
        </mj-text>
        <mj-text align="center">
          <span style="display: inline-block; background-color: #f0f9ff; border: 2px dashed {{primaryColor}}; padding: 16px 32px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: {{primaryColor}}; border-radius: 8px;">{{otp}}</span>
        </mj-text>
        <mj-text font-size="13px" color="#ef4444" align="center" padding-top="15px">
          ⏰ This code expires in {{expiryMinutes}} minutes
        </mj-text>
        <mj-text font-size="13px" color="#64748b" align="center" padding-top="10px">
          If you didn't request this, please ignore this email or contact support.
        </mj-text>
      </mj-column>
    </mj-section>
`);

// Password Reset Success
export const passwordResetSuccess = wrapTemplate(`
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="#22c55e" font-weight="700" align="center" padding-bottom="10px">
          ✅ Password Changed Successfully
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, your password has been changed successfully. You can now log in with your new password.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-text font-size="13px" color="#64748b" align="center" background-color="#fef3c7" padding="15px" border-radius="8px">
          ⚠️ If you didn't make this change, please contact support immediately at {{supportEmail}}
        </mj-text>
      </mj-column>
    </mj-section>
`);

// Recent Login Alert
export const recentLogin = wrapTemplate(`
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="{{primaryColor}}" font-weight="700" align="center" padding-bottom="10px">
          🔔 New Login Detected
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, a new login was detected on your account.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-text font-size="14px" color="#1e293b" line-height="28px" background-color="#f8fafc" padding="20px" border-radius="8px">
          <strong>📍 Location:</strong> {{location}}<br/>
          <strong>💻 Device:</strong> {{deviceInfo}}<br/>
          <strong>🕐 Time:</strong> {{time}}
        </mj-text>
        <mj-text font-size="13px" color="#64748b" align="center" padding-top="15px">
          If this was you, no action is needed. If not, please secure your account immediately.
        </mj-text>
      </mj-column>
    </mj-section>
`);

// Blocked Account
export const blockedAccount = wrapTemplate(`
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="#dc2626" font-weight="700" align="center" padding-bottom="10px">
          🚫 Account Blocked
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, your account has been temporarily blocked due to security concerns.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-text font-size="14px" color="#1e293b" line-height="24px" background-color="#fef2f2" padding="20px" border-radius="8px">
          <strong>Reason:</strong> {{reason}}
        </mj-text>
        <mj-text font-size="13px" color="#64748b" align="center" padding-top="15px">
          Please contact support at {{supportEmail}} to resolve this issue.
        </mj-text>
      </mj-column>
    </mj-section>
`);

// Password Breach Alert
export const passwordBreach = wrapTemplate(`
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="#dc2626" font-weight="700" align="center" padding-bottom="10px">
          ⚠️ Security Alert
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, your password may have been compromised in a data breach. We recommend changing it immediately.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-button background-color="#dc2626" color="#ffffff" border-radius="6px" font-size="16px" font-weight="600" href="{{resetLink}}" padding="20px 40px">
          Reset Password Now
        </mj-button>
      </mj-column>
    </mj-section>
`);

// User Invitation / God Credentials
export const godCredentials = wrapTemplate(`
    <mj-section background-color="#ffffff" padding="40px 25px">
      <mj-column>
        <mj-text font-size="24px" color="{{primaryColor}}" font-weight="700" align="center" padding-bottom="10px">
          🎉 You've Been Invited!
        </mj-text>
        <mj-text font-size="16px" color="#555555" line-height="24px" align="center" padding-bottom="20px">
          Hello {{firstName}}, you've been invited to join {{companyName}}. Here are your login credentials.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-text font-size="14px" color="#1e293b" line-height="28px" background-color="#f8fafc" padding="20px" border-radius="8px">
          <strong>📧 Email:</strong> {{email}}<br/>
          <strong>🔑 Temporary Password:</strong> {{password}}
        </mj-text>
        <mj-text font-size="13px" color="#ef4444" align="center" padding-top="15px">
          ⚠️ Please change your password after first login
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="0 25px 30px">
      <mj-column>
        <mj-button background-color="{{primaryColor}}" color="#ffffff" border-radius="6px" font-size="16px" font-weight="600" href="{{loginUrl}}" padding="20px 40px">
          Login Now
        </mj-button>
      </mj-column>
    </mj-section>
`);

// Template name to template mapping
export const DEFAULT_TEMPLATES: Record<string, string> = {
  "welcome-verify": welcomeVerify,
  "welcome-email": welcomeEmail,
  "mfa-enable": mfaEnable,
  "mfa-login": mfaLogin,
  "password-reset": passwordReset,
  passwordResetSuccess: passwordResetSuccess,
  recentLogin: recentLogin,
  "blocked-account": blockedAccount,
  "password-breach": passwordBreach,
  "god-credentials": godCredentials,
};
