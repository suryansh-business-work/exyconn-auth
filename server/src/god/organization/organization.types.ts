export {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "./organization-forms/validators/merged-organization.validator";

export * from "./organization-forms";

export class OrgPolicyDto {
  policyName!: string;
  policyLink!: string;
}
