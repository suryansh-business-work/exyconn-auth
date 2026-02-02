import * as Yup from "yup";

export const VerifyOTPSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  otp: Yup.string().required("OTP is required"),
});

export interface VerifyOTPFormValues {
  email: string;
  otp: string;
}
