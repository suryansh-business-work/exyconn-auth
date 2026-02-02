import * as Yup from "yup";

export const redirectionUrlSchema = Yup.object().shape({
  url: Yup.string()
    .required("URL is required")
    .matches(
      /^(https?:\/\/)?[\w.-]+(:\d+)?(\/[\w.-]*)*\/?$/,
      "Please enter a valid URL",
    ),
  isDefault: Yup.boolean().required(),
});

export const redirectionSettingSchema = Yup.object().shape({
  env: Yup.string()
    .oneOf(["development", "staging", "production"], "Invalid environment")
    .required("Environment is required"),
  description: Yup.string().optional(),
  authPageUrl: Yup.string()
    .required("Auth Page URL is required")
    .matches(
      /^(https?:\/\/)?[\w.-]+(:\d+)?(\/[\w.-]*)*\/?$/,
      "Please enter a valid URL",
    ),
  roleSlug: Yup.string().required("Role is required"),
  redirectionUrls: Yup.array()
    .of(redirectionUrlSchema)
    .min(1, "At least one redirection URL is required")
    .test("single-default", "Only one default URL is allowed", (urls) => {
      if (!urls) return true;
      const defaultCount = urls.filter((u) => u?.isDefault).length;
      return defaultCount <= 1;
    }),
});

export const redirectionSettingsFormSchema = Yup.object().shape({
  orgRedirectionSettings: Yup.array().of(redirectionSettingSchema),
});
