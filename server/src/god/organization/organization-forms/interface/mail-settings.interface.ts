/**
 * Mail Settings Interface
 * Used for email feature toggles
 */
export interface IMailSettings {
  emailVerification?: boolean;
  otpMail?: boolean;
  passwordReset?: boolean;
  loginAlert?: boolean;
  twoFactorAuth?: boolean;
  emailChangeConfirmation?: boolean;
  accountRecovery?: boolean;
}
