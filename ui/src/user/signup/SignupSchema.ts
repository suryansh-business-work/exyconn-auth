import * as Yup from "yup";

export interface PasswordPolicy {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  expiryDays?: number;
}

export const createPasswordSchema = (passwordPolicy?: PasswordPolicy) => {
  const minLength = passwordPolicy?.minLength || 8;
  const requireUppercase = passwordPolicy?.requireUppercase ?? true;
  const requireLowercase = passwordPolicy?.requireLowercase ?? true;
  const requireNumbers = passwordPolicy?.requireNumbers ?? true;
  const requireSpecialChars = passwordPolicy?.requireSpecialChars ?? false;

  let schema = Yup.string()
    .min(minLength, `Password must be at least ${minLength} characters`)
    .required("Password is required");

  if (requireUppercase) {
    schema = schema.matches(
      /[A-Z]/,
      "Password must contain at least one uppercase letter",
    );
  }
  if (requireLowercase) {
    schema = schema.matches(
      /[a-z]/,
      "Password must contain at least one lowercase letter",
    );
  }
  if (requireNumbers) {
    schema = schema.matches(
      /[0-9]/,
      "Password must contain at least one number",
    );
  }
  if (requireSpecialChars) {
    schema = schema.matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character",
    );
  }

  return schema;
};

export const createSignupSchema = (passwordPolicy?: PasswordPolicy) => {
  return Yup.object().shape({
    firstName: Yup.string()
      .min(2, "Too short")
      .required("First name is required"),
    lastName: Yup.string()
      .min(2, "Too short")
      .required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: createPasswordSchema(passwordPolicy),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Please confirm your password"),
  });
};

// Default schema for backward compatibility
export const SignupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "Too short")
    .required("First name is required"),
  lastName: Yup.string().min(2, "Too short").required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}
