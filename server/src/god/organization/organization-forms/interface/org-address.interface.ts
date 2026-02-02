/**
 * Organization Address Interface
 * Used for physical address details
 */
export interface IOrgAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}
