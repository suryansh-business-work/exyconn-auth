import * as Yup from "yup";
import { PasswordPolicy, createPasswordSchema } from "../signup/SignupSchema";

export const createResetPasswordSchema = (passwordPolicy?: PasswordPolicy) => {
  return Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .when("hasStoredEmail", {
        is: false,
        then: (schema) => schema.required("Email is required"),
        otherwise: (schema) => schema,
      }),
    otp: Yup.string().required("OTP is required"),
    newPassword: createPasswordSchema(passwordPolicy),
  });
};

// Default schema for backward compatibility
export const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .when("hasStoredEmail", {
      is: false,
      then: (schema) => schema.required("Email is required"),
      otherwise: (schema) => schema,
    }),
  otp: Yup.string().required("OTP is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("New password is required"),
});

export interface ResetPasswordFormValues {
  email: string;
  otp: string;
  newPassword: string;
  hasStoredEmail: boolean;
}
