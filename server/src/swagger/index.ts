/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         companyId:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin, god]
 *         isVerified:
 *           type: boolean
 *         provider:
 *           type: string
 *           enum: [local, google]
 *         profilePicture:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Organization:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         companyId:
 *           type: string
 *         name:
 *           type: string
 *         domain:
 *           type: string
 *         logo:
 *           type: string
 *         theme:
 *           type: object
 *           properties:
 *             primary:
 *               type: string
 *             secondary:
 *               type: string
 *             fontFamily:
 *               type: string
 *         settings:
 *           type: object
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SuccessResponse:
 *       type: object
 *       required:
 *         - message
 *         - data
 *         - status
 *         - statusCode
 *       properties:
 *         message:
 *           type: string
 *           example: Operation successful
 *         data:
 *           type: object
 *           nullable: true
 *         status:
 *           type: string
 *           example: success
 *         statusCode:
 *           type: integer
 *           example: 200
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - message
 *         - data
 *         - status
 *         - statusCode
 *       properties:
 *         message:
 *           type: string
 *           example: Something went wrong
 *         data:
 *           type: object
 *           nullable: true
 *         status:
 *           type: string
 *           example: error
 *         statusCode:
 *           type: integer
 *           example: 500
 *     BadRequestResponse:
 *       type: object
 *       required:
 *         - message
 *         - data
 *         - status
 *         - statusCode
 *       properties:
 *         message:
 *           type: string
 *           example: Bad request
 *         data:
 *           type: object
 *           nullable: true
 *         status:
 *           type: string
 *           example: bad_request
 *         statusCode:
 *           type: integer
 *           example: 400
 *     UnauthorizedResponse:
 *       type: object
 *       required:
 *         - message
 *         - data
 *         - status
 *         - statusCode
 *       properties:
 *         message:
 *           type: string
 *           example: Unauthorized
 *         data:
 *           type: object
 *           nullable: true
 *         status:
 *           type: string
 *           example: unauthorized
 *         statusCode:
 *           type: integer
 *           example: 401
 *     PaginatedResponse:
 *       type: object
 *       required:
 *         - message
 *         - data
 *         - status
 *         - statusCode
 *       properties:
 *         message:
 *           type: string
 *           example: Operation successful
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         paginationData:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 100
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             totalPages:
 *               type: integer
 *               example: 10
 *         status:
 *           type: string
 *           example: success
 *         statusCode:
 *           type: integer
 *           example: 200
 *     PaginationData:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 10
 *     OrganizationInput:
 *       type: object
 *       required:
 *         - orgName
 *         - orgEmail
 *       properties:
 *         orgName:
 *           type: string
 *           description: Organization name
 *         orgSlug:
 *           type: string
 *           description: URL-friendly identifier
 *         orgEmail:
 *           type: string
 *           format: email
 *         orgPhone:
 *           type: string
 *         orgDomain:
 *           type: string
 *         orgActiveStatus:
 *           type: boolean
 *           default: true
 *         orgBusinessType:
 *           type: string
 *         numberOfEmployees:
 *           type: string
 *         smtpSettings:
 *           type: object
 *           properties:
 *             host:
 *               type: string
 *             port:
 *               type: number
 *             user:
 *               type: string
 *             pass:
 *               type: string
 *             secure:
 *               type: boolean
 *         jwtSettings:
 *           type: object
 *           properties:
 *             secret:
 *               type: string
 *             accessExpiry:
 *               type: string
 *             refreshExpiry:
 *               type: string
 *         oauthSettings:
 *           type: object
 *           properties:
 *             googleClientId:
 *               type: string
 *             googleClientSecret:
 *               type: string
 *             googleRedirectUri:
 *               type: string
 *             googleEnabled:
 *               type: boolean
 *         roles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     resource:
 *                       type: string
 *                     action:
 *                       type: string
 *                     allowed:
 *                       type: boolean
 *               isDefault:
 *                 type: boolean
 *               isSystem:
 *                 type: boolean
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and profile endpoints
 *   - name: God Management
 *     description: God-level system control and authentication
 *   - name: God - Organizations
 *     description: God-level organization management (CRUD operations)
 *   - name: God - Users
 *     description: God-level user management across all organizations
 *   - name: God - Statistics
 *     description: God-level system-wide statistics
 *   - name: Admin Management
 *     description: Admin-level organization management
 *   - name: Admin - Users
 *     description: Admin user management (organization scope)
 *   - name: Admin - Statistics
 *     description: Admin statistics (organization scope)
 *   - name: File Upload
 *     description: File upload endpoints (ImageKit integration)
 */

export {};
