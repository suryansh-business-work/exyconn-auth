/**
 * @swagger
 * tags:
 *   - name: God - Management
 *     description: God authentication and management
 *   - name: God - Organizations
 *     description: God panel organization management
 *   - name: God - Users
 *     description: God panel user management
 *   - name: God - Statistics
 *     description: God panel statistics
 *   - name: God - SMTP
 *     description: God panel SMTP testing
 *   - name: God - Templates
 *     description: Email template management
 */

/**
 * @swagger
 * /v1/api/god-management/login:
 *   post:
 *     summary: God user login
 *     description: Authenticate as a god user (system administrator)
 *     tags: [God - Management]
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
 *                 example: god@exyconn.com
 *               password:
 *                 type: string
 *                 format: password
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /v1/api/god-management/send-credentials:
 *   get:
 *     summary: Send god credentials via email
 *     description: Send god login credentials to the configured email
 *     tags: [God - Management]
 *     responses:
 *       200:
 *         description: Credentials sent successfully
 *       500:
 *         description: Failed to send credentials
 */

/**
 * @swagger
 * /v1/api/god/organizations:
 *   get:
 *     summary: Get all organizations (paginated)
 *     tags: [God - Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, slug, or email
 *     responses:
 *       200:
 *         description: Paginated list of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Organization'
 *                 paginationData:
 *                   $ref: '#/components/schemas/PaginationData'
 *       401:
 *         description: Unauthorized - God access required
 *   post:
 *     summary: Create a new organization
 *     tags: [God - Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationInput'
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Bulk delete organizations
 *     tags: [God - Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Organizations deleted successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/god/organizations/stats:
 *   get:
 *     summary: Get organization statistics summary
 *     tags: [God - Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrganizations:
 *                   type: number
 *                 activeOrganizations:
 *                   type: number
 *                 totalUsers:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/god/organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [God - Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 *   put:
 *     summary: Update organization
 *     tags: [God - Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationInput'
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       404:
 *         description: Organization not found
 *   delete:
 *     summary: Delete organization
 *     tags: [God - Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /v1/api/god/organizations/{id}/regenerate-jwt-secret:
 *   post:
 *     summary: Regenerate JWT secret for organization
 *     tags: [God - Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: JWT secret regenerated
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /v1/api/god/users:
 *   get:
 *     summary: Get all users across organizations (paginated)
 *     tags: [God - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/god/users/statistics:
 *   get:
 *     summary: Get user statistics for an organization
 *     tags: [God - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 verified:
 *                   type: number
 *                 unverified:
 *                   type: number
 *                 byRole:
 *                   type: object
 *                 byProvider:
 *                   type: object
 *                 recentUsers:
 *                   type: array
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/god/users/{userId}:
 *   get:
 *     summary: Get user by ID (god)
 *     tags: [God - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update user (god)
 *     tags: [God - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *               role:
 *                 type: string
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete user (god)
 *     tags: [God - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /v1/api/god/statistics:
 *   get:
 *     summary: Get global platform statistics
 *     tags: [God - Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrganizations:
 *                   type: number
 *                 totalUsers:
 *                   type: number
 *                 activeOrganizations:
 *                   type: number
 *                 recentActivity:
 *                   type: array
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/god/smtp/test-connection:
 *   post:
 *     summary: Test SMTP server connection
 *     tags: [God - SMTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - host
 *               - port
 *               - user
 *               - pass
 *             properties:
 *               host:
 *                 type: string
 *                 description: SMTP server hostname
 *                 example: smtp.gmail.com
 *               port:
 *                 type: number
 *                 description: SMTP port
 *                 example: 587
 *               secure:
 *                 type: boolean
 *                 description: Use SSL/TLS
 *                 default: false
 *               user:
 *                 type: string
 *                 description: SMTP username
 *               pass:
 *                 type: string
 *                 description: SMTP password
 *     responses:
 *       200:
 *         description: Connection successful
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
 *                     connected:
 *                       type: boolean
 *                     host:
 *                       type: string
 *                     port:
 *                       type: number
 *                     secure:
 *                       type: boolean
 *       400:
 *         description: Connection failed or invalid settings
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/god/smtp/send-test-email:
 *   post:
 *     summary: Send a test email
 *     tags: [God - SMTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - host
 *               - port
 *               - user
 *               - pass
 *               - toEmail
 *             properties:
 *               host:
 *                 type: string
 *               port:
 *                 type: number
 *               secure:
 *                 type: boolean
 *               user:
 *                 type: string
 *               pass:
 *                 type: string
 *               toEmail:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *     responses:
 *       200:
 *         description: Test email sent successfully
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
 *                     sent:
 *                       type: boolean
 *                     messageId:
 *                       type: string
 *                     to:
 *                       type: string
 *       400:
 *         description: Failed to send email
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/god/organizations/{id}/regenerate-api-key:
 *   post:
 *     summary: Regenerate API key for organization
 *     tags: [God - Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key regenerated
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
 *                     apiKey:
 *                       type: string
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /v1/api/god/templates:
 *   get:
 *     summary: Get list of all email templates
 *     tags: [God - Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       path:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/god/templates/{templateName}:
 *   get:
 *     summary: Get template content
 *     tags: [God - Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the template file
 *     responses:
 *       200:
 *         description: Template content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Template not found
 *   put:
 *     summary: Save/update template
 *     tags: [God - Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: MJML template content
 *     responses:
 *       200:
 *         description: Template saved successfully
 *       400:
 *         description: Invalid template content
 */

/**
 * @swagger
 * /v1/api/god/templates/compile:
 *   post:
 *     summary: Compile MJML to HTML
 *     tags: [God - Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mjml
 *             properties:
 *               mjml:
 *                 type: string
 *                 description: MJML content to compile
 *     responses:
 *       200:
 *         description: Compiled HTML
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     html:
 *                       type: string
 *       400:
 *         description: MJML compilation error
 */

/**
 * @swagger
 * /v1/api/god/templates/format:
 *   post:
 *     summary: Format MJML content
 *     tags: [God - Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mjml
 *             properties:
 *               mjml:
 *                 type: string
 *                 description: MJML content to format
 *     responses:
 *       200:
 *         description: Formatted MJML
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     formatted:
 *                       type: string
 *       400:
 *         description: Format error
 */

/**
 * @swagger
 * /v1/api/god/statistics/global:
 *   get:
 *     summary: Get global platform statistics
 *     tags: [God - Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizations:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         inactive:
 *                           type: number
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         verified:
 *                           type: number
 *                         unverified:
 *                           type: number
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/god/statistics/organization/{organizationId}:
 *   get:
 *     summary: Get statistics for specific organization
 *     tags: [God - Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     verifiedUsers:
 *                       type: number
 *                     unverifiedUsers:
 *                       type: number
 *                     usersByRole:
 *                       type: object
 *                     recentUsers:
 *                       type: array
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /v1/api/imagekit/upload:
 *   post:
 *     summary: Upload file via ImageKit
 *     description: Upload a file to ImageKit storage
 *     tags: [File Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               fileName:
 *                 type: string
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     fileId:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Upload failed
 */
