/**
 * Organization Region Interface
 * Used for multinational organization regions
 */
import { IOrgAddress } from "./org-address.interface";

export interface IOrgRegion {
  country: string;
  timezone?: string;
  currency?: string;
  address?: IOrgAddress;
}
