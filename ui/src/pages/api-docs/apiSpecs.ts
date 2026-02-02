/**
 * API Documentation Specifications
 * Complete OpenAPI 3.0 specification for Auth APIs
 */

export const authApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Exyconn Auth API",
    version: "1.0.0",
    description: "Authentication and User Management API for Exyconn Platform",
    contact: {
      name: "Exyconn Support",
      email: "support@exyconn.com",
    },
  },
  servers: [
    {
      url: "http://localhost:4002/v1/api",
      description: "Local Development Server",
    },
    {
      url: "https://exyconn-auth-server.exyconn.com/v1/api",
      description: "Production Server",
    },
  ],
  tags: [
    { name: "Authentication", description: "User authentication endpoints" },
    { name: "MFA", description: "Multi-Factor Authentication endpoints" },
    { name: "Profile", description: "User profile management endpoints" },
    { name: "Organization", description: "Organization related endpoints" },
    { name: "OAuth", description: "OAuth configuration and callbacks" },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User Login",
        description:
          "Authenticate user with email and password. Organization is identified via x-api-key header. If MFA is enabled, returns mfaRequired: true and sends OTP to email.",
        operationId: "login",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "suryansh@exyconn.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "YourSecurePassword123!",
                  },
                },
              },
              examples: {
                loginRequest: {
                  summary: "Sample Login Request",
                  value: {
                    email: "suryansh@exyconn.com",
                    password: "F*(ES..q[|&2SZxE",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful or MFA required",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/LoginSuccessResponse" },
                    { $ref: "#/components/schemas/MfaRequiredResponse" },
                  ],
                },
                examples: {
                  mfaRequired: {
                    summary: "MFA Required Response",
                    value: {
                      message:
                        "MFA verification required. Check your email for the code.",
                      data: {
                        mfaRequired: true,
                        email: "suryansh@exyconn.com",
                        organizationId: "695ffba863ba4f7cec3095ee",
                      },
                      status: "success",
                      statusCode: 200,
                    },
                  },
                  loginSuccess: {
                    summary: "Login Success Response (No MFA)",
                    value: {
                      message: "Login successful",
                      data: {
                        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        user: {
                          id: "695ffc8b30dbeb837168e3e",
                          email: "suryansh@exyconn.com",
                          firstName: "Suryansh",
                          lastName: "Srivastava",
                          role: "admin",
                          organizationId: "695ffba863ba4f7cec3095ee",
                          isVerified: true,
                          mfaEnabled: true,
                          lastLoginAt: "2026-01-12T10:30:00.000Z",
                        },
                        orgRedirectionSettings: [],
                      },
                      status: "success",
                      statusCode: 200,
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Bad Request - Validation failed or Organization not found",
            content: {
              "application/json": {
                example: {
                  message: "Organization not found",
                  status: "error",
                  statusCode: 400,
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - Invalid credentials",
            content: {
              "application/json": {
                example: {
                  message: "Invalid credentials",
                  status: "error",
                  statusCode: 401,
                },
              },
            },
          },
        },
      },
    },
    "/auth/mfa/login-verify": {
      post: {
        tags: ["MFA"],
        summary: "Verify MFA Login OTP",
        description:
          "Verify the OTP sent to user's email during login. Organization is identified via x-api-key header.",
        operationId: "verifyMfaLogin",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "suryansh@exyconn.com",
                  },
                  otp: {
                    type: "string",
                    minLength: 6,
                    maxLength: 6,
                    example: "642468",
                  },
                },
              },
              examples: {
                mfaVerifyRequest: {
                  summary: "Sample MFA Verify Request",
                  value: {
                    email: "suryansh@exyconn.com",
                    otp: "642468",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "MFA verification successful",
            content: {
              "application/json": {
                example: {
                  message: "MFA verification successful",
                  data: {
                    token:
                      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTVmZmM4YjMwZGJlYjgzNzExNjhlM2UiLCJ1c2VyTmFtZSI6IlN1cnlhbnNoIFNyaXZhc3RhdmEiLCJlbWFpbCI6InN1cnlhbnNoQGV4eWNvbm4uY29tIiwib3JnYW5pemF0aW9uSWQiOiI2OTVmZmJhODYzYmE0ZjdjZWMzMDk1ZWUiLCJpYXQiOjE3NjgxODgyMzB9.A5y0M8uinjoFG4lgEMYV1Y9BSI6MF5A-zyeAnyIhPl0",
                    user: {
                      id: "695ffc8b30dbeb837168e3e",
                      email: "suryansh@exyconn.com",
                      firstName: "Suryansh",
                      lastName: "Srivastava",
                      role: "admin",
                      organizationId: "695ffba863ba4f7cec3095ee",
                      isVerified: true,
                      mfaEnabled: true,
                      lastLoginAt: "2026-01-12T10:30:00.000Z",
                    },
                    orgRedirectionSettings: [],
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Invalid or expired OTP",
            content: {
              "application/json": {
                example: {
                  message: "Invalid or expired OTP",
                  status: "error",
                  statusCode: 400,
                },
              },
            },
          },
        },
      },
    },
    "/auth/mfa/enable": {
      post: {
        tags: ["MFA"],
        summary: "Enable MFA",
        description:
          "Enable Multi-Factor Authentication for the authenticated user. Sends an OTP to user's email for verification.",
        operationId: "enableMfa",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "MFA enable OTP sent",
            content: {
              "application/json": {
                example: {
                  message: "MFA enable OTP sent to your email",
                  data: {
                    email: "suryansh@exyconn.com",
                    otpSent: true,
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - Invalid or missing token",
            content: {
              "application/json": {
                example: {
                  message: "Unauthorized",
                  status: "error",
                  statusCode: 401,
                },
              },
            },
          },
        },
      },
    },
    "/auth/mfa/verify": {
      post: {
        tags: ["MFA"],
        summary: "Verify MFA Enable OTP",
        description: "Verify the OTP to complete MFA enablement process.",
        operationId: "verifyMfa",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["otp"],
                properties: {
                  otp: {
                    type: "string",
                    minLength: 6,
                    maxLength: 6,
                    example: "123456",
                  },
                },
              },
              examples: {
                verifyMfaRequest: {
                  summary: "Sample Verify MFA Request",
                  value: {
                    otp: "123456",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "MFA enabled successfully",
            content: {
              "application/json": {
                example: {
                  message: "MFA enabled successfully",
                  data: {
                    mfaEnabled: true,
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Invalid or expired OTP",
            content: {
              "application/json": {
                example: {
                  message: "Invalid or expired OTP",
                  status: "error",
                  statusCode: 400,
                },
              },
            },
          },
        },
      },
    },
    "/auth/mfa/disable": {
      post: {
        tags: ["MFA"],
        summary: "Disable MFA",
        description:
          "Disable Multi-Factor Authentication for the authenticated user.",
        operationId: "disableMfa",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: {
                  password: {
                    type: "string",
                    format: "password",
                    description: "Current password for verification",
                  },
                },
              },
              examples: {
                disableMfaRequest: {
                  summary: "Sample Disable MFA Request",
                  value: {
                    password: "YourCurrentPassword123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "MFA disabled successfully",
            content: {
              "application/json": {
                example: {
                  message: "MFA disabled successfully",
                  data: {
                    mfaEnabled: false,
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Invalid password",
            content: {
              "application/json": {
                example: {
                  message: "Invalid password",
                  status: "error",
                  statusCode: 400,
                },
              },
            },
          },
        },
      },
    },
    "/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "User Signup",
        description:
          "Register a new user account. Organization is identified via x-api-key header. Sends verification OTP to the provided email.",
        operationId: "signup",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "firstName", "lastName"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "newuser@exyconn.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    minLength: 8,
                    example: "SecurePassword123!",
                  },
                  firstName: {
                    type: "string",
                    example: "John",
                  },
                  lastName: {
                    type: "string",
                    example: "Doe",
                  },
                  role: {
                    type: "string",
                    enum: ["user", "admin"],
                    default: "user",
                    example: "user",
                  },
                },
              },
              examples: {
                signupRequest: {
                  summary: "Sample Signup Request",
                  value: {
                    email: "newuser@exyconn.com",
                    password: "SecurePassword123!",
                    firstName: "John",
                    lastName: "Doe",
                    role: "user",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signup successful - Verification OTP sent",
            content: {
              "application/json": {
                example: {
                  message: "Signup successful. Please verify your email.",
                  data: {
                    email: "newuser@exyconn.com",
                    userId: "696ffba863ba4f7cec3095ff",
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "400": {
            description:
              "Bad Request - User already exists or validation failed",
            content: {
              "application/json": {
                example: {
                  message:
                    "An account with this email already exists in your organization. Please login or use a different email.",
                  status: "error",
                  statusCode: 400,
                },
              },
            },
          },
        },
      },
    },
    "/auth/verify": {
      post: {
        tags: ["Authentication"],
        summary: "Verify Account",
        description:
          "Verify user account with OTP sent to email during signup. Organization is identified via x-api-key header.",
        operationId: "verifyAccount",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "newuser@exyconn.com",
                  },
                  otp: {
                    type: "string",
                    minLength: 6,
                    maxLength: 6,
                    example: "123456",
                  },
                },
              },
              examples: {
                verifyRequest: {
                  summary: "Sample Verify Request",
                  value: {
                    email: "newuser@exyconn.com",
                    otp: "123456",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Account verified successfully",
            content: {
              "application/json": {
                example: {
                  message: "Account verified successfully",
                  data: {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    user: {
                      id: "696ffba863ba4f7cec3095ff",
                      email: "newuser@exyconn.com",
                      firstName: "John",
                      lastName: "Doe",
                      role: "user",
                      isVerified: true,
                    },
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Invalid or expired OTP",
            content: {
              "application/json": {
                example: {
                  message: "Invalid or expired OTP",
                  status: "error",
                  statusCode: 400,
                },
              },
            },
          },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Forgot Password",
        description:
          "Request password reset OTP. Organization is identified via x-api-key header. Sends OTP to the user's registered email.",
        operationId: "forgotPassword",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "suryansh@exyconn.com",
                  },
                },
              },
              examples: {
                forgotPasswordRequest: {
                  summary: "Sample Forgot Password Request",
                  value: {
                    email: "suryansh@exyconn.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset OTP sent",
            content: {
              "application/json": {
                example: {
                  message: "Password reset OTP sent to your email",
                  data: {
                    email: "suryansh@exyconn.com",
                    otpSent: true,
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "400": {
            description: "Bad Request - User not found",
            content: {
              "application/json": {
                example: {
                  message: "No account found with this email",
                  status: "error",
                  statusCode: 400,
                },
              },
            },
          },
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Reset Password",
        description:
          "Reset user password using OTP received via email. Organization is identified via x-api-key header.",
        operationId: "resetPassword",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp", "newPassword"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "suryansh@exyconn.com",
                  },
                  otp: {
                    type: "string",
                    minLength: 6,
                    maxLength: 6,
                    example: "123456",
                  },
                  newPassword: {
                    type: "string",
                    format: "password",
                    minLength: 8,
                    example: "NewSecurePassword123!",
                  },
                },
              },
              examples: {
                resetPasswordRequest: {
                  summary: "Sample Reset Password Request",
                  value: {
                    email: "suryansh@exyconn.com",
                    otp: "123456",
                    newPassword: "NewSecurePassword123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successful",
            content: {
              "application/json": {
                example: {
                  message:
                    "Password reset successful. Please login with your new password.",
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Invalid or expired OTP",
            content: {
              "application/json": {
                example: {
                  message: "Invalid or expired OTP",
                  status: "error",
                  statusCode: 400,
                },
              },
            },
          },
        },
      },
    },
    "/auth/resend-verification-otp": {
      post: {
        tags: ["Authentication"],
        summary: "Resend Verification OTP",
        description:
          "Resend account verification OTP to user's email. Organization is identified via x-api-key header.",
        operationId: "resendVerificationOtp",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "newuser@exyconn.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Verification OTP resent",
            content: {
              "application/json": {
                example: {
                  message: "Verification OTP resent to your email",
                  data: {
                    email: "newuser@exyconn.com",
                    otpSent: true,
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
        },
      },
    },
    "/auth/resend-password-otp": {
      post: {
        tags: ["Authentication"],
        summary: "Resend Password Reset OTP",
        description:
          "Resend password reset OTP to user's email. Organization is identified via x-api-key header.",
        operationId: "resendPasswordOtp",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "suryansh@exyconn.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset OTP resent",
            content: {
              "application/json": {
                example: {
                  message: "Password reset OTP resent to your email",
                  data: {
                    email: "suryansh@exyconn.com",
                    otpSent: true,
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
        },
      },
    },
    "/auth/profile": {
      get: {
        tags: ["Profile"],
        summary: "Get User Profile",
        description:
          "Get the authenticated user's profile information. Organization is identified via x-api-key header.",
        operationId: "getProfile",
        security: [{ apiKeyAuth: [] }, { bearerAuth: [] }],
        responses: {
          "200": {
            description: "Profile retrieved successfully",
            content: {
              "application/json": {
                example: {
                  message: "Profile retrieved successfully",
                  data: {
                    id: "695ffc8b30dbeb837168e3e",
                    email: "suryansh@exyconn.com",
                    firstName: "Suryansh",
                    lastName: "Srivastava",
                    role: "admin",
                    organizationId: "695ffba863ba4f7cec3095ee",
                    isVerified: true,
                    mfaEnabled: true,
                    profilePicture:
                      "https://ik.imagekit.io/exyconn/profile/user.jpg",
                    createdAt: "2026-01-01T00:00:00.000Z",
                    lastLoginAt: "2026-01-12T10:30:00.000Z",
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - Invalid or missing token",
            content: {
              "application/json": {
                example: {
                  message: "Unauthorized",
                  status: "error",
                  statusCode: 401,
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Profile"],
        summary: "Update User Profile",
        description: "Update the authenticated user's profile information.",
        operationId: "updateProfile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string", example: "Suryansh" },
                  lastName: { type: "string", example: "Srivastava" },
                  phone: { type: "string", example: "+91-9876543210" },
                },
              },
              examples: {
                updateProfileRequest: {
                  summary: "Sample Update Profile Request",
                  value: {
                    firstName: "Suryansh",
                    lastName: "Srivastava",
                    phone: "+91-9876543210",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                example: {
                  message: "Profile updated successfully",
                  data: {
                    id: "695ffc8b30dbeb837168e3e",
                    email: "suryansh@exyconn.com",
                    firstName: "Suryansh",
                    lastName: "Srivastava",
                    phone: "+91-9876543210",
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
        },
      },
    },
    "/auth/profile/picture": {
      put: {
        tags: ["Profile"],
        summary: "Update Profile Picture",
        description: "Update the authenticated user's profile picture URL.",
        operationId: "updateProfilePicture",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["profilePicture"],
                properties: {
                  profilePicture: {
                    type: "string",
                    format: "uri",
                    example: "https://ik.imagekit.io/exyconn/profile/user.jpg",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile picture updated successfully",
            content: {
              "application/json": {
                example: {
                  message: "Profile picture updated successfully",
                  data: {
                    profilePicture:
                      "https://ik.imagekit.io/exyconn/profile/user.jpg",
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
        },
      },
    },
    "/auth/password-change": {
      post: {
        tags: ["Profile"],
        summary: "Change Password",
        description: "Change the authenticated user's password.",
        operationId: "changePassword",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: {
                    type: "string",
                    format: "password",
                    example: "CurrentPassword123!",
                  },
                  newPassword: {
                    type: "string",
                    format: "password",
                    minLength: 8,
                    example: "NewSecurePassword123!",
                  },
                },
              },
              examples: {
                changePasswordRequest: {
                  summary: "Sample Change Password Request",
                  value: {
                    currentPassword: "CurrentPassword123!",
                    newPassword: "NewSecurePassword123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password changed successfully",
            content: {
              "application/json": {
                example: {
                  message: "Password changed successfully",
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Current password is incorrect",
            content: {
              "application/json": {
                example: {
                  message: "Current password is incorrect",
                  status: "error",
                  statusCode: 400,
                },
              },
            },
          },
        },
      },
    },
    "/auth/apikey-by-domain": {
      get: {
        tags: ["Organization"],
        summary: "Step 1: Get API key by domain",
        description:
          "Public endpoint to resolve an organization's API key based on the current domain (hostname). Used in production for automatic organization detection.",
        operationId: "getApiKeyByDomain",
        parameters: [
          {
            name: "domain",
            in: "query",
            required: false,
            schema: { type: "string" },
            example: "auth.exyconn.com",
            description:
              "Domain to search for (optional, uses host header if not provided)",
          },
        ],
        responses: {
          "200": {
            description: "API Key resolved successfully",
            content: {
              "application/json": {
                example: {
                  message: "API Key fetched successfully",
                  data: {
                    apiKey: "exy_Bis0aIuvukA6vP8A8ZXhuxakqUdmr2GY",
                    orgName: "Exyconn",
                    matched: true,
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
        },
      },
    },
    "/auth/apikey-to-organization": {
      get: {
        tags: ["Organization"],
        summary: "Step 2: Get Organization Details by API Key",
        description:
          "Fetch full public organization details using the x-api-key header. Works for both local and production environments.",
        operationId: "getOrganizationByApiKey",
        security: [{ apiKeyAuth: [] }],
        responses: {
          "200": {
            description: "Organization details retrieved successfully",
            content: {
              "application/json": {
                example: {
                  message: "Organization details retrieved successfully",
                  data: {
                    orgId: "695ffba863ba4f7cec3095ee",
                    _id: "695ffba863ba4f7cec3095ee",
                    orgName: "Exyconn",
                    orgEmail: "info@exyconn.com",
                    orgWebsite: "https://exyconn.com",
                    orgSlug: "exyconn",
                    orgLogos: [
                      {
                        url: "https://ik.imagekit.io/exyconn/logos/exyconn.png",
                        size: "256x256",
                      },
                    ],
                    orgFavIcon:
                      "https://ik.imagekit.io/exyconn/favicons/exyconn.ico",
                    orgTheme: {
                      primaryColor: "#1976d2",
                      secondaryColor: "#dc004e",
                    },
                    featureFlags: {
                      signupEnabled: true,
                      mfaRequired: true,
                    },
                    passwordPolicy: {
                      minLength: 8,
                      requireUppercase: true,
                    },
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - Invalid or missing API key",
            content: {
              "application/json": {
                example: {
                  message: "Invalid or inactive API key",
                  status: "error",
                  statusCode: 401,
                },
              },
            },
          },
        },
      },
    },
    "/auth/companies": {
      get: {
        tags: ["Organization"],
        summary: "Get Companies List",
        description: "Get list of available companies/organizations.",
        operationId: "getCompanies",
        responses: {
          "200": {
            description: "Companies list retrieved",
            content: {
              "application/json": {
                example: {
                  message: "Companies retrieved successfully",
                  data: [
                    {
                      _id: "695ffba863ba4f7cec3095ee",
                      orgName: "Exyconn",
                      orgSlug: "exyconn",
                    },
                  ],
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
        },
      },
    },
    "/auth/oauth-config": {
      get: {
        tags: ["OAuth"],
        summary: "Get OAuth Configuration",
        description: "Get OAuth providers configuration for the organization.",
        operationId: "getOAuthConfig",
        parameters: [
          {
            name: "organizationId",
            in: "query",
            required: true,
            schema: { type: "string" },
            example: "695ffba863ba4f7cec3095ee",
          },
        ],
        responses: {
          "200": {
            description: "OAuth configuration retrieved",
            content: {
              "application/json": {
                example: {
                  message: "OAuth configuration retrieved",
                  data: {
                    googleOAuth: {
                      enabled: true,
                      clientId: "xxx.apps.googleusercontent.com",
                    },
                  },
                  status: "success",
                  statusCode: 200,
                },
              },
            },
          },
        },
      },
    },
    "/auth/google": {
      get: {
        tags: ["OAuth"],
        summary: "Initiate Google OAuth",
        description: "Initiate Google OAuth flow for the organization.",
        operationId: "initiateGoogleOAuth",
        parameters: [
          {
            name: "organizationId",
            in: "query",
            required: true,
            schema: { type: "string" },
            example: "695ffba863ba4f7cec3095ee",
          },
        ],
        responses: {
          "302": {
            description: "Redirect to Google OAuth consent screen",
          },
        },
      },
    },
    "/auth/google/callback": {
      get: {
        tags: ["OAuth"],
        summary: "Google OAuth Callback",
        description: "Handle Google OAuth callback after user authorization.",
        operationId: "handleGoogleCallback",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Authorization code from Google",
          },
          {
            name: "state",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "State parameter containing organization info",
          },
        ],
        responses: {
          "302": {
            description: "Redirect to frontend with token",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from login or MFA verification",
      },
    },
    schemas: {
      LoginSuccessResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Login successful" },
          data: {
            type: "object",
            properties: {
              token: { type: "string" },
              user: { $ref: "#/components/schemas/User" },
              orgRedirectionSettings: {
                type: "array",
                items: { type: "object" },
              },
            },
          },
          status: { type: "string", example: "success" },
          statusCode: { type: "number", example: 200 },
        },
      },
      MfaRequiredResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example:
              "MFA verification required. Check your email for the code.",
          },
          data: {
            type: "object",
            properties: {
              mfaRequired: { type: "boolean", example: true },
              email: { type: "string", example: "suryansh@exyconn.com" },
              organizationId: {
                type: "string",
                example: "695ffba863ba4f7cec3095ee",
              },
            },
          },
          status: { type: "string", example: "success" },
          statusCode: { type: "number", example: 200 },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
          organizationId: { type: "string" },
          isVerified: { type: "boolean" },
          mfaEnabled: { type: "boolean" },
          lastLoginAt: { type: "string", format: "date-time" },
        },
      },
      Organization: {
        type: "object",
        properties: {
          _id: { type: "string" },
          orgName: { type: "string" },
          orgSlug: { type: "string" },
          orgDescription: { type: "string" },
          orgLogos: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                url: { type: "string", format: "uri" },
                isDefault: { type: "boolean" },
              },
            },
          },
          orgColors: {
            type: "object",
            properties: {
              primary: { type: "string" },
              secondary: { type: "string" },
              background: { type: "string" },
            },
          },
          featureFlags: {
            type: "object",
            properties: {
              signupEnabled: { type: "boolean" },
              googleOAuthEnabled: { type: "boolean" },
              mfaRequired: { type: "boolean" },
              passwordResetEnabled: { type: "boolean" },
            },
          },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          status: { type: "string", example: "error" },
          statusCode: { type: "number" },
        },
      },
    },
  },
};

export default authApiSpec;
