/**
 * SMTP Settings Interface
 * Used for email server configuration
 */
export interface ISmtpSettings {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}
