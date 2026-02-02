/**
 * @swagger
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 *       description: API key for organization authentication. Get your API key from the God Panel > Organizations > Edit > Security > API Key.
 *
 * tags:
 *   - name: Public API
 *     description: |
 *       Public API endpoints authenticated via API Key. These endpoints allow programmatic access to organization data without requiring individual user authentication.
 *
 *       **Authentication:**
 *       Include your API key in the request header:
 *       ```
 *       x-api-key: exy_your_api_key_here
 *       ```
 *
 *       **Getting an API Key:**
 *       API keys are automatically generated when an organization is created.
 *       You can view and regenerate API keys from: God Panel > Organizations > Edit Organization > Security > API Key
 */

/**
 * @swagger
 * /v1/api/public/organization:
 *   get:
 *     summary: Get organization details
 *     description: Retrieve the organization details associated with the API key. The organization is automatically identified by the API key.
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
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
 *                   example: Organization retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     orgName:
 *                       type: string
 *                       example: "Acme Corporation"
 *                     orgEmail:
 *                       type: string
 *                       example: "admin@acme.com"
 *                     orgSlug:
 *                       type: string
 *                       example: "acme-corp"
 *                     orgActiveStatus:
 *                       type: boolean
 *                       example: true
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
 */

/**
 * @swagger
 * /v1/api/public/users:
 *   get:
 *     summary: List organization users
 *     description: Retrieve a paginated list of users belonging to the organization identified by the API key.
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role slug
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 paginationData:
 *                   $ref: '#/components/schemas/PaginationData'
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
 */

/**
 * @swagger
 * /v1/api/public/users/{userId}:
 *   get:
 *     summary: Get user details
 *     description: Retrieve detailed information about a specific user in the organization identified by the API key.
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *                 status:
 *                   type: string
 *                   example: not_found
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 */

/**
 * @swagger
 * /v1/api/public/roles:
 *   get:
 *     summary: List organization roles
 *     description: Retrieve all roles defined for the organization identified by the API key.
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Roles retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Admin"
 *                       slug:
 *                         type: string
 *                         example: "admin"
 *                       description:
 *                         type: string
 *                         example: "Administrator role with full access"
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             resource:
 *                               type: string
 *                               example: "users"
 *                             action:
 *                               type: string
 *                               example: "create"
 *                             allowed:
 *                               type: boolean
 *                               example: true
 *                       isDefault:
 *                         type: boolean
 *                         example: false
 *                       isSystem:
 *                         type: boolean
 *                         example: false
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
 */

/**
 * @swagger
 * /v1/api/public/stats:
 *   get:
 *     summary: Get organization statistics
 *     description: Retrieve statistical data about the organization identified by the API key, including user counts and other metrics.
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 150
 *                     activeUsers:
 *                       type: integer
 *                       example: 120
 *                     verifiedUsers:
 *                       type: integer
 *                       example: 145
 *                     unverifiedUsers:
 *                       type: integer
 *                       example: 5
 *                     recentLogins:
 *                       type: integer
 *                       example: 45
 *                     todayRegistrations:
 *                       type: integer
 *                       example: 3
 *                     weekRegistrations:
 *                       type: integer
 *                       example: 15
 *                     monthRegistrations:
 *                       type: integer
 *                       example: 50
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
 */

export {};
