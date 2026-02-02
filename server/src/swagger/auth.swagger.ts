/**
 * @swagger
 * /v1/api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password. Organization is identified via x-api-key header.
 *     tags: [Auth]
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /v1/api/auth/signup:
 *   post:
 *     summary: Signup user
 *     description: Register a new user. Organization is identified via x-api-key header.
 *     tags: [Auth]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: Optional, defaults to user
 *     responses:
 *       200:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /v1/api/auth/verify:
 *   post:
 *     summary: Verify account with OTP
 *     description: Verify user account using OTP. Organization is identified via x-api-key header.
 *     tags: [Auth]
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
 *     responses:
 *       200:
 *         description: Account verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid OTP
 */

/**
 * @swagger
 * /v1/api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Request password reset OTP. Organization is identified via x-api-key header.
 *     tags: [Auth]
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
 *         description: OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: User not found
 */

/**
 * @swagger
 * /v1/api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Reset password with OTP. Organization is identified via x-api-key header.
 *     tags: [Auth]
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
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid OTP
 */

/**
 * @swagger
 * /v1/api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update user profile. Requires x-api-key and Bearer token.
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */

/**
 * @swagger
 * /v1/api/auth/companies:
 *   get:
 *     summary: Get list of supported companies
 *     description: Get companies list. Requires x-api-key header.
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Companies list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * @swagger
 * /v1/api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Get user profile. Requires x-api-key and Bearer token.
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/profile/picture:
 *   put:
 *     summary: Update user profile picture
 *     description: Update profile picture. Requires x-api-key and Bearer token.
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 description: URL to the profile picture
 *     responses:
 *       200:
 *         description: Profile picture updated
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/password-change:
 *   post:
 *     summary: Change password (authenticated users)
 *     description: Change user password. Requires x-api-key and Bearer token.
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
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
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password incorrect
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/resend-verification-otp:
 *   post:
 *     summary: Resend email verification OTP
 *     description: Resend verification OTP. Organization is identified via x-api-key header.
 *     tags: [Auth]
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
 *         description: OTP sent successfully
 *       400:
 *         description: User not found or already verified
 */

/**
 * @swagger
 * /v1/api/auth/resend-password-otp:
 *   post:
 *     summary: Resend password reset OTP
 *     description: Resend password reset OTP. Organization is identified via x-api-key header.
 *     tags: [Auth]
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
 *         description: OTP sent successfully
 *       400:
 *         description: User not found
 */

/**
 * @swagger
 * /v1/api/auth/mfa/enable:
 *   post:
 *     summary: Enable MFA for user
 *     description: Enable MFA. Requires x-api-key and Bearer token.
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MFA setup initiated, returns QR code
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
 *                     secret:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/mfa/verify:
 *   post:
 *     summary: Verify and complete MFA setup
 *     description: Verify MFA setup. Requires x-api-key and Bearer token.
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
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
 *         description: MFA enabled successfully
 *       400:
 *         description: Invalid token
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/mfa/disable:
 *   post:
 *     summary: Disable MFA for user
 *     description: Disable MFA. Requires x-api-key and Bearer token.
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: MFA disabled successfully
 *       400:
 *         description: Invalid token
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/auth/mfa/login-verify:
 *   post:
 *     summary: Verify MFA token during login
 *     description: Verify MFA OTP during login. Organization is identified via x-api-key header.
 *     tags: [Auth]
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
 *                 description: User email
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP code sent via email
 *     responses:
 *       200:
 *         description: MFA verified, returns auth tokens
 *       400:
 *         description: Invalid MFA token
 */

/**
 * @swagger
 * /v1/api/auth/oauth-config:
 *   get:
 *     summary: Get OAuth configuration for organization
 *     description: Get OAuth config. Organization is identified via x-api-key header.
 *     tags: [Auth]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: OAuth configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 googleEnabled:
 *                   type: boolean
 *                 googleClientId:
 *                   type: string
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /v1/api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth flow
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent page
 *       400:
 *         description: Google OAuth not configured
 */

/**
 * @swagger
 * /v1/api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback handler
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to frontend with auth token
 *       400:
 *         description: OAuth error
 */

/**
 * @swagger
 * /v1/api/auth/organization-by-domain:
 *   get:
 *     summary: Get organization by domain
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization domain (e.g., example.com)
 *     responses:
 *       200:
 *         description: Organization found
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
 *                     _id:
 *                       type: string
 *                     orgName:
 *                       type: string
 *                     orgSlug:
 *                       type: string
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /v1/api/auth/organization/{orgId}:
 *   get:
 *     summary: Get public organization details for login page
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization public details (for login page)
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
 *                     orgName:
 *                       type: string
 *                     orgLogos:
 *                       type: array
 *                     theme:
 *                       type: object
 *                     oauthEnabled:
 *                       type: boolean
 *       404:
 *         description: Organization not found
 */
