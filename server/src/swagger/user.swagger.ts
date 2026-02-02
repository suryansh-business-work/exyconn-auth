/**
 * @swagger
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 *       description: |
 *         API key for organization authentication. All User/Auth/Public APIs require this key.
 *         The API key automatically identifies your organization - no need to pass organization ID separately.
 *         Get your API key from the God Panel > Organizations > Edit > Security > API Key.
 *     userBearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         User JWT token for authenticated endpoints (profile, MFA, etc.).
 *         Obtained after successful login.
 *
 * tags:
 *   - name: User API - Authentication
 *     description: |
 *       User authentication endpoints. All endpoints require x-api-key header for organization identification.
 *       The API key automatically determines which organization the request belongs to.
 *
 *       **Authentication:**
 *       ```
 *       x-api-key: exy_your_api_key_here
 *       ```
 *   - name: User API - Profile
 *     description: |
 *       User profile management endpoints. Requires x-api-key for organization and Bearer token for user authentication.
 *   - name: User API - MFA
 *     description: |
 *       Multi-Factor Authentication management endpoints.
 *   - name: Public API
 *     description: |
 *       Public API endpoints for programmatic access to organization data.
 */

/**
 * @swagger
 * /v1/api/auth/organization/{orgId}:
 *   get:
 *     summary: Get organization details for login page
 *     description: |
 *       Fetch public organization details needed for the login page UI.
 *       This endpoint is used by the authentication UI to load organization branding, settings, and configuration.
 *       Note: Organization ID is derived from the API key automatically for other endpoints.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID (can be obtained from organization-by-domain endpoint)
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     orgName:
 *                       type: string
 *                     orgEmail:
 *                       type: string
 *                     orgSlug:
 *                       type: string
 *                     orgLogos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                           size:
 *                             type: string
 *                     orgTheme:
 *                       type: object
 *                     loginPageDesign:
 *                       type: string
 *                     oauthSettings:
 *                       type: object
 *                     passwordPolicy:
 *                       type: object
 *                 status:
 *                   type: string
 *                   example: success
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /v1/api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email and password. Requires x-api-key for organization identification.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT access token
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 status:
 *                   type: string
 *                   example: success
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Missing required fields
 */

/**
 * @swagger
 * /v1/api/auth/signup:
 *   post:
 *     summary: User signup
 *     description: Register a new user account. Requires x-api-key for organization identification.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Role slug (optional, defaults to 'user')
 *     responses:
 *       200:
 *         description: Signup successful, verification email sent
 *       400:
 *         description: Validation error or user already exists
 */

/**
 * @swagger
 * /v1/api/auth/verify:
 *   post:
 *     summary: Verify account with OTP
 *     description: Verify user account using the OTP sent via email.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /v1/api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send a password reset OTP to the user's email.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /v1/api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     description: Reset password using the OTP sent via email.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /v1/api/auth/resend-verification-otp:
 *   post:
 *     summary: Resend verification OTP
 *     description: Resend account verification OTP to user's email.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: User already verified or not found
 */

/**
 * @swagger
 * /v1/api/auth/resend-password-otp:
 *   post:
 *     summary: Resend password reset OTP
 *     description: Resend password reset OTP to user's email.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /v1/api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Get the current authenticated user's profile.
 *     tags: [User API - Profile]
 *     security:
 *       - apiKeyAuth: []
 *       - userBearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 status:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update user profile
 *     description: Update the current user's profile information.
 *     tags: [User API - Profile]
 *     security:
 *       - apiKeyAuth: []
 *       - userBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/profile/picture:
 *   put:
 *     summary: Update profile picture
 *     description: Update the current user's profile picture.
 *     tags: [User API - Profile]
 *     security:
 *       - apiKeyAuth: []
 *       - userBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 description: URL of the profile picture
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/password-change:
 *   post:
 *     summary: Change password
 *     description: Change the current user's password (requires current password).
 *     tags: [User API - Profile]
 *     security:
 *       - apiKeyAuth: []
 *       - userBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password is incorrect
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/mfa/enable:
 *   post:
 *     summary: Enable MFA
 *     description: Enable Multi-Factor Authentication for the user account.
 *     tags: [User API - MFA]
 *     security:
 *       - apiKeyAuth: []
 *       - userBearerAuth: []
 *     responses:
 *       200:
 *         description: MFA setup initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCode:
 *                       type: string
 *                       description: QR code for authenticator app
 *                     secret:
 *                       type: string
 *                       description: Manual entry secret
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/mfa/verify:
 *   post:
 *     summary: Verify and activate MFA
 *     description: Verify MFA setup with a TOTP code to activate it.
 *     tags: [User API - MFA]
 *     security:
 *       - apiKeyAuth: []
 *       - userBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP code
 *     responses:
 *       200:
 *         description: MFA activated successfully
 *       400:
 *         description: Invalid TOTP code
 */

/**
 * @swagger
 * /v1/api/auth/mfa/disable:
 *   post:
 *     summary: Disable MFA
 *     description: Disable Multi-Factor Authentication for the user account.
 *     tags: [User API - MFA]
 *     security:
 *       - apiKeyAuth: []
 *       - userBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP code to confirm
 *     responses:
 *       200:
 *         description: MFA disabled successfully
 *       400:
 *         description: Invalid TOTP code
 */

/**
 * @swagger
 * /v1/api/auth/mfa/login-verify:
 *   post:
 *     summary: Verify MFA during login
 *     description: Verify MFA code during the login process.
 *     tags: [User API - MFA]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - mfaToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               mfaToken:
 *                 type: string
 *                 description: 6-digit TOTP code
 *     responses:
 *       200:
 *         description: MFA verified, login complete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid MFA code
 */

/**
 * @swagger
 * /v1/api/auth/oauth-config:
 *   get:
 *     summary: Get OAuth configuration
 *     description: Get OAuth provider configuration for the organization.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: OAuth configuration retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 google:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     clientId:
 *                       type: string
 */

/**
 * @swagger
 * /v1/api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth
 *     description: Start Google OAuth flow for authentication.
 *     tags: [User API - Authentication]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 */

/**
 * @swagger
 * /v1/api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handle Google OAuth callback after user authorization.
 *     tags: [User API - Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *     responses:
 *       302:
 *         description: Redirects to application with auth token
 */

/**
 * @swagger
 * /v1/api/auth/organization-by-domain:
 *   get:
 *     summary: Get organization by domain
 *     description: Find organization by its configured domain. Used for multi-tenant routing.
 *     tags: [User API - Authentication]
 *     parameters:
 *       - in: query
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain to lookup
 *     responses:
 *       200:
 *         description: Organization found
 *       404:
 *         description: No organization found for domain
 */

export {};
