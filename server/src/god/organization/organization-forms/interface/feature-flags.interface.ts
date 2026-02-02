/**
 * Feature Flags Interface
 * Used for feature toggles
 */
export interface IFeatureFlags {
  googleLogin?: boolean;
  emailVerification?: boolean;
  passwordReset?: boolean;
  mfaRequired?: boolean;
}
