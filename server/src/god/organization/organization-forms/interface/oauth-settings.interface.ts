/**
 * OAuth Settings Interface
 * Used for OAuth provider configuration
 */
import { IOAuthProvider } from "./oauth-provider.interface";

export interface IOAuthSettings {
  google?: IOAuthProvider;
  microsoft?: IOAuthProvider;
  apple?: IOAuthProvider;
  github?: IOAuthProvider;
}
