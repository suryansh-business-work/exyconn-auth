import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Typography,
  Divider,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Tooltip,
  Collapse,
  Skeleton,
  LinearProgress,
  Chip,
  Popover,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Business,
  Save,
  Info,
  Phone,
  BusinessCenter,
  LocationOn,
  Description,
  Receipt,
  Image,
  Palette,
  Security,
  Email,
  SwapHoriz,
  Warning,
  VpnKey,
  Login,
  Code,
  Search,
  NavigateNext,
  InfoOutlined,
  ExpandLess,
  ExpandMore,
  Sms,
  WhatsApp,
  Html,
  Javascript,
  SettingsApplications,
  TextFields,
  Brush,
  AdminPanelSettings,
  Policy,
  Key,
} from "@mui/icons-material";
import { useSnackbar } from "../contexts/SnackbarContext";
import { API_ENDPOINTS } from "../apis";
import {
  getRequest,
  postRequest,
  putRequest,
  extractData,
  extractMessage,
  isSuccess,
  parseError,
} from "../lib/api";
import { OrganizationFormData } from "./organization-form/types";
import { clientLogger } from "@exyconn/common/client/logger";
import { usePageTitle } from "@exyconn/common/client/hooks";

// Import all form components
import BasicInfoForm from "./organization-form/BasicInfoForm";
import ContactForm from "./organization-form/ContactForm";
import BusinessDetailsForm from "./organization-form/BusinessDetailsForm";
import AddressForm from "./organization-form/AddressForm";
import CompanyRegistrationsForm from "./organization-form/CompanyRegistrationsForm";
import TaxForm from "./organization-form/TaxForm";
import BrandingForm from "./organization-form/BrandingForm";
import ThemeForm from "./organization-form/ThemeForm";
import SecurityForm from "./organization-form/SecurityForm";
import SMTPForm from "./organization-form/SMTPFormNew";
import RedirectionSettingsForm from "./organization-form/redirection-settings/RedirectionSettingsFormNew";
import JwtSettingsForm from "./organization-form/JwtSettingsForm";
import ApiKeySettingsForm from "./organization-form/ApiKeySettingsForm";
import OAuthSettingsForm from "./organization-form/OAuthSettingsForm";
import CustomCssForm from "./organization-form/CustomCssForm";
import CustomTextForm from "./organization-form/CustomTextForm";
import LoginDesignForm from "./organization-form/LoginDesignForm";
import EmailTemplatesForm from "./organization-form/EmailTemplatesForm";
import InjectHtmlForm from "./organization-form/InjectHtmlForm";
import InjectJsForm from "./organization-form/InjectJsForm";
import RoleManagementForm from "./organization-form/RoleManagementFormNew";
import PolicySettingsForm from "./organization-form/PolicySettingsForm";

interface Organization extends OrganizationFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// Nested menu structure
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  fields?: string[];
  description?: string;
  children?: MenuItem[];
  comingSoon?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: "basic",
    label: "Basic",
    icon: <Info />,
    children: [
      {
        id: "basic-info",
        label: "Info",
        icon: <Info />,
        fields: [
          "orgName",
          "orgEmail",
          "orgWebsite",
          "authServerUrl",
          "orgSlug",
          "orgActiveStatus",
        ],
        description:
          "Configure basic organization information including name, email, website URL, auth server URL (for auto-selecting organization), unique slug identifier, and activation status. This is the core identity of your organization.",
      },
      {
        id: "contact",
        label: "Contact",
        icon: <Phone />,
        fields: ["orgPhone"],
        description:
          "Add contact information for your organization including phone numbers and other communication channels. This helps users reach out for support or inquiries.",
      },
      {
        id: "business",
        label: "Business Details",
        icon: <BusinessCenter />,
        fields: [
          "orgBusinessType",
          "ownershipType",
          "orgScaleType",
          "numberOfEmployees",
        ],
        description:
          "Define your business characteristics including industry type, ownership structure, company scale, and employee count. This information helps in categorizing and understanding your organization.",
      },
      {
        id: "address",
        label: "Address",
        icon: <LocationOn />,
        fields: ["orgAddress"],
        description:
          "Enter the complete physical address of your organization including street, city, state, postal code, and country. This is used for official correspondence and legal documentation.",
      },
      {
        id: "registration",
        label: "Company Registration",
        icon: <Description />,
        fields: ["orgRegistrationNumber"],
        description:
          "Provide official company registration details and numbers issued by government authorities. This validates your organization's legal status and authenticity.",
      },
      {
        id: "tax",
        label: "Tax Information",
        icon: <Receipt />,
        fields: ["orgTaxType", "orgTaxNumber"],
        description:
          "Configure tax-related information including tax type (GST, VAT, etc.) and official tax identification numbers. Required for compliance and financial operations.",
      },
    ],
  },
  {
    id: "branding",
    label: "Branding",
    icon: <Image />,
    children: [
      {
        id: "branding-logos",
        label: "Logos & Assets",
        icon: <Image />,
        fields: ["orgLogos", "orgFavIcon", "loginBgImages"],
        description:
          "Upload and manage your organization's visual identity including logos in multiple sizes (PNG, JPG, SVG), favicon for browser tabs, and login background images.",
      },
      {
        id: "login-design",
        label: "Login Design",
        icon: <Brush />,
        fields: ["loginPageDesign"],
        description:
          "Select and customize your login page design from multiple responsive templates. Choose from Classic, Split Screen, or Minimal layouts that adapt to all devices.",
      },
      {
        id: "custom-text",
        label: "Custom Text",
        icon: <TextFields />,
        fields: ["customTextSections"],
        description:
          "Manage custom text sections for your branding pages including titles, descriptions, slogans, and other textual content with various typography styles.",
      },
      {
        id: "theme",
        label: "Theme",
        icon: <Palette />,
        fields: ["orgTheme"],
        description:
          "Customize the visual appearance with color schemes (primary, secondary, tertiary, custom colors), Google Fonts integration, and UI elements. Create a branded authentication experience that matches your organization's identity.",
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: <Security />,
    children: [
      {
        id: "jwt",
        label: "JWT Settings",
        icon: <VpnKey />,
        fields: ["jwtSettings"],
        description:
          "Configure JSON Web Token settings including secret keys, expiration times, and refresh token behavior. Critical for secure session management and API authentication.",
      },
      {
        id: "api-key",
        label: "API Key",
        icon: <Key />,
        fields: ["apiKey", "apiKeyCreatedAt"],
        description:
          "Manage API keys for programmatic access to the authentication API. API keys identify the organization and can be used instead of passing organizationId in requests.",
      },
      {
        id: "oauth",
        label: "OAuth Settings",
        icon: <Login />,
        fields: ["oauthSettings"],
        description:
          "Set up OAuth 2.0 providers (Google, GitHub, etc.) for social login integration. Configure client IDs, secrets, and callback URLs for each provider.",
      },
      {
        id: "security-options",
        label: "Security Options",
        icon: <Security />,
        fields: ["orgOptions"],
        description:
          "Configure advanced security options including two-factor authentication, password policies, session management, and account verification requirements.",
      },
      {
        id: "policies",
        label: "Policies",
        icon: <Policy />,
        fields: ["orgPoliciesLink"],
        description:
          "Configure links to Terms & Conditions, Privacy Policy, and Data Policy pages. These will be displayed on the login page.",
      },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: <Email />,
    children: [
      {
        id: "smtp",
        label: "SMTP",
        icon: <Email />,
        fields: ["smtpSettings"],
        description:
          "Configure email server settings for sending transactional emails like verification, password reset, and notifications. Enter SMTP host, port, credentials, and sender information.",
      },
      {
        id: "sms",
        label: "SMS",
        icon: <Sms />,
        comingSoon: true,
        description:
          "SMS notification settings will be available soon. Configure SMS providers and templates for OTP and alerts.",
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        icon: <WhatsApp />,
        comingSoon: true,
        description:
          "WhatsApp integration coming soon. Send authentication notifications through WhatsApp Business API.",
      },
    ],
  },
  {
    id: "code",
    label: "Code",
    icon: <Code />,
    children: [
      {
        id: "custom-css",
        label: "Custom CSS",
        icon: <Code />,
        fields: ["customCss"],
        description:
          "Add custom CSS code to further personalize the authentication pages. Override default styles or add new styling rules for advanced customization.",
      },
      {
        id: "inject-html",
        label: "Inject HTML",
        icon: <Html />,
        fields: ["customHtml"],
        description:
          "Inject custom HTML blocks into authentication pages for advanced customization. Add tracking pixels, custom elements, or third-party widgets.",
      },
      {
        id: "inject-js",
        label: "Inject JS",
        icon: <Javascript />,
        fields: ["customJs"],
        description:
          "Add custom JavaScript code for analytics, tracking, or custom behaviors. Enhance authentication pages with dynamic functionality.",
      },
    ],
  },
  {
    id: "core-settings",
    label: "Core Settings",
    icon: <SettingsApplications />,
    children: [
      {
        id: "redirections",
        label: "Redirections",
        icon: <SwapHoriz />,
        fields: ["orgRedirectionSettings"],
        description:
          "Set up custom URL redirections after authentication events. Configure where users should be redirected after successful login, logout, signup, email verification, and password reset operations.",
      },
      {
        id: "email-templates",
        label: "Email Templates",
        icon: <Email />,
        fields: ["emailTemplates"],
        description:
          "Customize MJML email templates for authentication emails. Edit verification emails, password reset, MFA codes, and other notification templates with live preview.",
      },
    ],
  },
  {
    id: "role-management",
    label: "Role Management",
    icon: <AdminPanelSettings />,
    children: [
      {
        id: "roles",
        label: "Role Management",
        icon: <Security />,
        fields: ["roles"],
        description:
          "Define user roles and their associated permissions. Create custom roles with specific access levels using permission chips for different resources and actions.",
      },
    ],
  },
];

// Flatten menu items to get all pages
const getAllPages = (items: MenuItem[]): MenuItem[] => {
  return items.reduce((acc: MenuItem[], item) => {
    if (item.children) {
      return [...acc, ...item.children];
    }
    return acc;
  }, []);
};

const pages = getAllPages(menuItems);

const drawerWidth = 280;

// Helper function to generate a UUID-like string
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Validation Schema
const OrganizationSchema = Yup.object().shape({
  orgName: Yup.string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be less than 100 characters")
    .required("Organization name is required"),
  orgEmail: Yup.string()
    .email("Invalid email address")
    .required("Organization email is required"),
  orgWebsite: Yup.string()
    .url("Invalid website URL")
    .required("Website is required"),
  authServerUrl: Yup.string()
    .url("Invalid auth server URL")
    .required("Auth server URL is required")
    .test(
      "valid-url",
      "Auth server URL must start with http:// or https://",
      function (value) {
        if (!value) return true;
        return /^https?:\/\//.test(value);
      },
    ),
  orgActiveStatus: Yup.boolean(),
  orgPhone: Yup.object().shape({
    countryCode: Yup.string(),
    phoneNumber: Yup.string().matches(
      /^[0-9]{10,15}$/,
      "Phone number must be 10-15 digits",
    ),
  }),
  orgAddress: Yup.object().shape({
    addressLine1: Yup.string(),
    addressLine2: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    country: Yup.string(),
    zipCode: Yup.string(),
  }),
  numberOfEmployees: Yup.number()
    .min(1, "Number of employees must be at least 1")
    .nullable(),
  orgOptions: Yup.object().shape({
    passwordPolicy: Yup.object().shape({
      minLength: Yup.number().min(4).max(128),
      expiryDays: Yup.number().min(1).max(365),
    }),
    sessionTimeout: Yup.number().min(300).max(86400),
  }),
  smtpSettings: Yup.object().shape({
    port: Yup.number().min(1).max(65535),
  }),
  orgRedirectionSettings: Yup.array()
    .of(
      Yup.object().shape({
        env: Yup.string().oneOf(["development", "staging", "production"]),
        description: Yup.string(),
        authPageUrl: Yup.string().test(
          "no-trailing-slash",
          "URL should not end with a slash (/)",
          function (value) {
            if (!value) return true;
            return !value.endsWith("/");
          },
        ),
        roleSlug: Yup.string(),
        redirectionUrls: Yup.array().of(
          Yup.object().shape({
            url: Yup.string().test(
              "no-trailing-slash",
              "URL should not end with a slash (/)",
              function (value) {
                if (!value) return true;
                return !value.endsWith("/");
              },
            ),
            isDefault: Yup.boolean(),
          }),
        ),
      }),
    )
    .test(
      "required-on-create",
      "At least one redirection setting is required",
      function (value) {
        // Only validate on creation
        if (this.parent._id) {
          // Existing organization - not required
          return true;
        }
        // New organization - require at least one
        return value && value.length > 0;
      },
    ),
  customTextSections: Yup.array().of(
    Yup.object().shape({
      name: Yup.string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
      slug: Yup.string().required("Slug is required"),
      text: Yup.string()
        .required("Text content is required")
        .min(1, "Text content cannot be empty"),
      type: Yup.string()
        .oneOf(["heading", "paragraph"], "Invalid type")
        .required("Type is required"),
      variant: Yup.string().required("Variant is required"),
    }),
  ),
  orgTheme: Yup.object().shape({
    customColors: Yup.array().of(
      Yup.object().shape({
        slug: Yup.string().required("Slug is required"),
        title: Yup.string()
          .required("Title is required")
          .min(2, "Title must be at least 2 characters"),
        description: Yup.string()
          .required("Description is required")
          .min(3, "Description must be at least 3 characters"),
        color: Yup.string()
          .required("Color is required")
          .matches(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
      }),
    ),
  }),
  roles: Yup.array().of(
    Yup.object().shape({
      name: Yup.string()
        .required("Role name is required")
        .min(2, "Role name must be at least 2 characters")
        .max(50, "Role name must be less than 50 characters"),
      slug: Yup.string()
        .required("Role slug is required")
        .matches(
          /^[a-z][a-zA-Z0-9]*$/,
          "Slug must start with lowercase letter and contain only alphanumeric characters",
        ),
      description: Yup.string()
        .optional()
        .max(200, "Description must be less than 200 characters"),
      permissions: Yup.array()
        .of(
          Yup.object().shape({
            resource: Yup.string()
              .required("Resource is required")
              .min(2, "Resource must be at least 2 characters")
              .matches(
                /^[a-z][a-zA-Z0-9]*$/,
                "Resource must be in camelCase format (e.g., user, userProfile)",
              ),
            action: Yup.string()
              .required("Action is required")
              .min(2, "Action must be at least 2 characters")
              .matches(
                /^[a-z][a-zA-Z0-9]*$/,
                "Action must be in camelCase format (e.g., create, update, delete)",
              ),
            allowed: Yup.boolean().required("Permission status is required"),
          }),
        )
        .min(1, "At least one permission is required"),
      isDefault: Yup.boolean(),
      isSystem: Yup.boolean(),
    }),
  ),
  customCss: Yup.string().test(
    "css-validation",
    "Invalid CSS syntax detected",
    function (value) {
      if (!value || value.trim().length === 0) return true;
      // Basic CSS validation - check for unmatched braces
      const openBraces = (value.match(/\{/g) || []).length;
      const closeBraces = (value.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        return this.createError({
          message: "Unmatched braces in CSS. Check for missing { or }",
        });
      }
      return true;
    },
  ),
  customHtml: Yup.string().test(
    "html-validation",
    "Invalid HTML structure detected",
    function (value) {
      if (!value || value.trim().length === 0) return true;
      // Basic HTML validation - check for basic structure
      const openTags = value.match(/<[^/][^>]*>/g) || [];
      const closeTags = value.match(/<\/[^>]+>/g) || [];
      // Simple check - if there are opening tags, there should be roughly similar closing tags
      if (
        openTags.length > 0 &&
        closeTags.length === 0 &&
        !value.includes("/>")
      ) {
        return this.createError({
          message: "Missing closing tags in HTML. Check for unclosed elements",
        });
      }
      return true;
    },
  ),
  customJs: Yup.string().test(
    "js-validation",
    "Invalid JavaScript syntax detected",
    function (value) {
      if (!value || value.trim().length === 0) return true;
      try {
        // Basic syntax check using Function constructor
        new Function(value);
        return true;
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "Unknown syntax error";
        return this.createError({
          message: `JavaScript syntax error: ${errorMessage}`,
        });
      }
    },
  ),
  oauthSettings: Yup.object()
    .shape({
      google: Yup.object().shape({
        enabled: Yup.boolean(),
        clientId: Yup.string().when("enabled", {
          is: true,
          then: (schema) =>
            schema.required("Google Client ID is required when enabled"),
          otherwise: (schema) => schema.nullable(),
        }),
        clientSecret: Yup.string().when("enabled", {
          is: true,
          then: (schema) =>
            schema.required("Google Client Secret is required when enabled"),
          otherwise: (schema) => schema.nullable(),
        }),
      }),
      microsoft: Yup.object().shape({
        enabled: Yup.boolean(),
        clientId: Yup.string().when("enabled", {
          is: true,
          then: (schema) =>
            schema.required("Microsoft Client ID is required when enabled"),
          otherwise: (schema) => schema.nullable(),
        }),
        clientSecret: Yup.string().when("enabled", {
          is: true,
          then: (schema) =>
            schema.required("Microsoft Client Secret is required when enabled"),
          otherwise: (schema) => schema.nullable(),
        }),
      }),
      apple: Yup.object().shape({
        enabled: Yup.boolean(),
        clientId: Yup.string().when("enabled", {
          is: true,
          then: (schema) =>
            schema.required("Apple Client ID is required when enabled"),
          otherwise: (schema) => schema.nullable(),
        }),
        clientSecret: Yup.string().when("enabled", {
          is: true,
          then: (schema) =>
            schema.required("Apple Client Secret is required when enabled"),
          otherwise: (schema) => schema.nullable(),
        }),
      }),
      github: Yup.object().shape({
        enabled: Yup.boolean(),
        clientId: Yup.string().when("enabled", {
          is: true,
          then: (schema) =>
            schema.required("GitHub Client ID is required when enabled"),
          otherwise: (schema) => schema.nullable(),
        }),
        clientSecret: Yup.string().when("enabled", {
          is: true,
          then: (schema) =>
            schema.required("GitHub Client Secret is required when enabled"),
          otherwise: (schema) => schema.nullable(),
        }),
      }),
    })
    .nullable(),
});

const OrganizationForm: React.FC = () => {
  const { orgId, pageId } = useParams<{ orgId: string; pageId: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCreateMode = !orgId;
  usePageTitle(
    isCreateMode
      ? "Create Organization | God Panel"
      : "Edit Organization | God Panel",
  );

  // Get current page from URL params or default to basic-info
  const currentPageId =
    pageId && pages.find((p) => p.id === pageId) ? pageId : "basic-info";
  const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];

  // Initialize open menus based on current page
  useEffect(() => {
    const parentMenu = menuItems.find((menu) =>
      menu.children?.some((child) => child.id === currentPageId),
    );
    if (parentMenu) {
      setOpenMenus((prev) => ({ ...prev, [parentMenu.id]: true }));
    }
  }, [currentPageId]);

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Filter menu items based on debounced search
  const filteredMenuItems = menuItems
    .map((menu) => ({
      ...menu,
      children: menu.children?.filter((page) =>
        page.label.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    }))
    .filter(
      (menu) => (menu.children && menu.children.length > 0) || !menu.children,
    );

  // Helper function to check if a page has errors
  const getPageErrors = (pageId: string, errors: any, touched: any) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page || !page.fields) return false;

    return page.fields.some((field: string) => {
      const fieldError = errors[field];
      const fieldTouched = touched[field];

      // Handle array fields
      if (Array.isArray(fieldError) && Array.isArray(fieldTouched)) {
        return fieldError.some((err, idx) => err && fieldTouched[idx]);
      }

      // Handle object fields (like orgAddress)
      if (
        typeof fieldError === "object" &&
        fieldError !== null &&
        typeof fieldTouched === "object" &&
        fieldTouched !== null
      ) {
        return Object.keys(fieldError).some(
          (key) => fieldTouched[key] && fieldError[key],
        );
      }

      return fieldError && fieldTouched;
    });
  };

  // Check if any child in a parent menu has errors
  const getParentMenuErrors = (
    menuItem: MenuItem,
    errors: any,
    touched: any,
  ) => {
    if (!menuItem.children) return false;
    return menuItem.children.some((child) =>
      getPageErrors(child.id, errors, touched),
    );
  };

  const getDefaultValues = (): OrganizationFormData => ({
    orgName: "",
    orgEmail: "",
    orgSlug: "",
    orgActiveStatus: true,
    orgWebsite: "",
    orgPhone: { countryCode: "+91", phoneNumber: "" },
    orgBusinessType: "Product",
    ownershipType: "Private",
    orgScaleType: "National",
    numberOfEmployees: undefined,
    orgAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    orgRegistrationNumber: "",
    orgTaxType: "GST",
    orgTaxNumber: "",
    orgLogos: [],
    orgFavIcon: "",
    loginBgImages: [],
    loginPageDesign: "split",
    customTextSections: [
      {
        name: "Title",
        slug: "title",
        text: "Welcome to Our Platform",
        type: "heading",
        variant: "h1",
      },
      {
        name: "Description",
        slug: "description",
        text: "Sign in to access your account and explore our services",
        type: "paragraph",
        variant: "body1",
      },
      {
        name: "Slogan",
        slug: "slogan",
        text: "Your Journey Starts Here",
        type: "heading",
        variant: "h3",
      },
    ],
    orgTheme: {
      primaryColor: "#1976d2",
      secondaryColor: "#dc004e",
      tertiaryColor: "#ff9800",
      fontFamily: undefined,
      customColors: [],
    },
    orgOptions: {
      mfaEnabled: false,
      lastLoginDetails: true,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        expiryDays: 90,
      },
      sessionTimeout: 3600,
      allowedDomains: [],
    },
    smtpSettings: {
      host: "",
      port: 587,
      secure: false,
      user: "",
      pass: "",
    },
    featureFlags: {
      googleLogin: false,
      emailVerification: true,
      passwordReset: true,
      mfaRequired: false,
    },
    mailSettings: {
      emailVerification: true,
      otpMail: true,
      passwordReset: false,
      loginAlert: true,
      twoFactorAuth: true,
      emailChangeConfirmation: true,
      accountRecovery: true,
    },
    orgRedirectionSettings: [
      {
        env: "development",
        description:
          "Local development environment redirection for testing authentication flow",
        authPageUrl: "http://localhost:4001",
        roleSlug: "any",
        redirectionUrls: [
          { url: "http://localhost:4001/profile", isDefault: true },
        ],
      },
    ],
    jwtSettings: {
      algorithm: "HS256",
      payloadFields: ["userId", "userName", "email"],
      tokenSignKey: generateUUID(),
    },
    oauthSettings: {
      google: {
        enabled: false,
        clientId: "",
        clientSecret: "",
      },
      microsoft: {
        enabled: false,
        clientId: "",
        clientSecret: "",
      },
      apple: {
        enabled: false,
        clientId: "",
        clientSecret: "",
      },
      github: {
        enabled: false,
        clientId: "",
        clientSecret: "",
      },
    },
    customCss: "",
    customHtml: "",
    customJs: "",
    roles: [
      {
        name: "Admin",
        slug: "admin",
        description: "Full administrative access to all resources",
        permissions: [
          { resource: "users", action: "create", allowed: true },
          { resource: "users", action: "read", allowed: true },
          { resource: "users", action: "update", allowed: true },
          { resource: "users", action: "delete", allowed: true },
          { resource: "settings", action: "read", allowed: true },
          { resource: "settings", action: "update", allowed: true },
        ],
        isDefault: false,
        isSystem: true,
      },
      {
        name: "User",
        slug: "user",
        description: "Standard user with basic access",
        permissions: [
          { resource: "profile", action: "read", allowed: true },
          { resource: "profile", action: "update", allowed: true },
        ],
        isDefault: true,
        isSystem: true,
      },
    ],
  });

  useEffect(() => {
    if (orgId) {
      fetchOrganization();
    }
  }, [orgId]);

  const fetchOrganization = async () => {
    if (!orgId) return;

    setLoading(true);
    try {
      const response = await getRequest(
        `${API_ENDPOINTS.GOD.ORGANIZATIONS}/${orgId}`,
      );

      if (isSuccess(response)) {
        const organization = extractData<Organization>(response);
        if (organization) {
          setOrganization(organization);
        }
      } else {
        const message = extractMessage(response);
        showSnackbar(message || "Failed to fetch organization", "error");
        navigate("/god/organizations");
      }
    } catch (error) {
      clientLogger.error("Failed to fetch organization:", { error });
      const parsedError = parseError(error);
      showSnackbar(
        parsedError.message || "Failed to fetch organization",
        "error",
      );
      navigate("/god/organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    values: OrganizationFormData,
    { setSubmitting }: any,
  ) => {
    try {
      // Debug: Log what's being sent
      console.log("=== SUBMITTING ORGANIZATION ===");
      console.log(
        "OAuth Settings:",
        JSON.stringify(values.oauthSettings, null, 2),
      );
      console.log(
        "Redirection Settings:",
        JSON.stringify(values.orgRedirectionSettings, null, 2),
      );

      let response;
      if (isCreateMode) {
        response = await postRequest(API_ENDPOINTS.GOD.ORGANIZATIONS, values);
      } else {
        response = await putRequest(
          `${API_ENDPOINTS.GOD.ORGANIZATIONS}/${orgId}`,
          values,
        );
      }

      // Debug: Log full response
      console.log("Response:", response);

      if (isSuccess(response)) {
        showSnackbar(
          `Organization ${isCreateMode ? "created" : "updated"} successfully`,
          "success",
        );

        if (isCreateMode) {
          navigate("/god/organizations");
        } else {
          // Refetch organization data after successful update
          await fetchOrganization();
        }
      } else {
        const message = extractMessage(response);
        console.log("Error message:", message);
        console.log("Full error response:", JSON.stringify(response, null, 2));
        showSnackbar(message || "An error occurred", "error");
      }
    } catch (error: any) {
      clientLogger.error(error);
      console.error("Submit error:", error);
      showSnackbar(error?.message || "An error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToPage = (pageId: string, hasErrors: boolean) => {
    if (hasErrors) return; // Disable navigation if there are errors

    const basePath = isCreateMode
      ? "/god/organization/create"
      : `/god/organization/update/${orgId}`;
    navigate(`${basePath}/${pageId}`);
  };

  const renderPageContent = () => {
    const content = (() => {
      switch (currentPageId) {
        case "basic-info":
          return <BasicInfoForm />;
        case "redirections":
          return <RedirectionSettingsForm />;
        case "contact":
          return <ContactForm />;
        case "business":
          return <BusinessDetailsForm />;
        case "address":
          return <AddressForm />;
        case "registration":
          return <CompanyRegistrationsForm />;
        case "tax":
          return <TaxForm />;
        case "branding-logos":
          return <BrandingForm />;
        case "login-design":
          return <LoginDesignForm />;
        case "custom-text":
          return <CustomTextForm />;
        case "theme":
          return <ThemeForm />;
        case "jwt":
          return <JwtSettingsForm orgId={orgId} />;
        case "api-key":
          return <ApiKeySettingsForm orgId={orgId} />;
        case "oauth":
          return <OAuthSettingsForm />;
        case "security-options":
          return <SecurityForm />;
        case "policies":
          return <PolicySettingsForm />;
        case "smtp":
          return <SMTPForm />;
        case "custom-css":
          return <CustomCssForm />;
        case "email-templates":
          return (
            <div style={{ margin: "-24px" }}>
              <EmailTemplatesForm />
            </div>
          );
        case "inject-html":
          return <InjectHtmlForm />;
        case "inject-js":
          return <InjectJsForm />;
        case "roles":
          return <RoleManagementForm />;
        case "sms":
        case "whatsapp":
          return (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h5" gutterBottom color="text.secondary">
                Coming Soon
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This feature is under development and will be available soon.
              </Typography>
            </Box>
          );
        default:
          return <BasicInfoForm />;
      }
    })();

    return <Box id={`section-${currentPageId}`}>{content}</Box>;
  };

  const initialValues = useMemo(() => {
    if (!organization) {
      return getDefaultValues();
    }

    // Merge organization with defaults
    const merged = {
      ...getDefaultValues(),
      ...organization,
    };

    // Auto-add auth server redirection if authServerUrl is set and no matching redirection exists
    if (merged.authServerUrl) {
      const existingRedirections = merged.orgRedirectionSettings || [];
      let authDomain = merged.authServerUrl;

      // Normalize the auth server URL
      try {
        const authUrl = new URL(
          authDomain.startsWith("http") ? authDomain : `https://${authDomain}`,
        );
        authDomain = authUrl.origin;
      } catch (e) {
        // Keep as-is if parsing fails
      }

      // Check if a redirection for auth server already exists
      const hasAuthServerRedirection = existingRedirections.some((r: any) => {
        const authUrl = r.authPageUrl || "";
        return authUrl.includes(authDomain) || authDomain.includes(authUrl);
      });

      // Add default auth server → /profile redirection if not exists
      if (!hasAuthServerRedirection) {
        merged.orgRedirectionSettings = [
          ...existingRedirections,
          {
            env: "production",
            description:
              "Auth server default - redirects to profile page after login",
            authPageUrl: authDomain,
            roleSlug: "any",
            redirectionUrls: [
              { url: `${authDomain}/profile`, isDefault: true },
            ],
          },
        ];
      }
    }

    return merged;
  }, [organization]); // Reinitialize when ANY organization data changes

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Formik
        initialValues={initialValues}
        validationSchema={OrganizationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isSubmitting, dirty, errors, touched, values }) => {
          // Calculate completion progress based on important fields
          const calculateProgress = () => {
            const importantFields = [
              // Basic Info
              { key: "orgName", weight: 10 },
              { key: "orgEmail", weight: 10 },
              { key: "orgWebsite", weight: 8 },
              { key: "authServerUrl", weight: 8 },
              { key: "orgSlug", weight: 5 },

              // Branding
              { key: "orgLogos", weight: 8, isArray: true },
              { key: "loginPageDesign", weight: 7 },

              // Theme
              { key: "orgTheme.primaryColor", weight: 5, nested: true },
              { key: "orgTheme.secondaryColor", weight: 3, nested: true },

              // Security
              { key: "tokenSignKey", weight: 10 },

              // SMTP
              { key: "smtpSettings.host", weight: 5, nested: true },
              { key: "smtpSettings.port", weight: 3, nested: true },
              { key: "smtpSettings.user", weight: 3, nested: true },

              // Redirections (at least one)
              {
                key: "orgRedirectionSettings",
                weight: 8,
                isArray: true,
                requireNonEmpty: true,
              },
            ];

            let totalWeight = 0;
            let completedWeight = 0;

            importantFields.forEach((field) => {
              totalWeight += field.weight;

              let fieldValue: any;
              if (field.nested) {
                const keys = field.key.split(".");
                fieldValue = keys.reduce((obj: any, key) => obj?.[key], values);
              } else {
                fieldValue = (values as any)[field.key];
              }

              // Check if field is filled
              let isFilled = false;
              if (field.isArray && Array.isArray(fieldValue)) {
                isFilled = field.requireNonEmpty ? fieldValue.length > 0 : true;
              } else if (typeof fieldValue === "string") {
                isFilled = fieldValue.trim() !== "";
              } else if (typeof fieldValue === "number") {
                isFilled = true;
              } else if (fieldValue !== null && fieldValue !== undefined) {
                isFilled = true;
              }

              if (isFilled) {
                completedWeight += field.weight;
              }
            });

            return Math.round((completedWeight / totalWeight) * 100);
          };

          const completionProgress = calculateProgress();

          // Track incomplete fields for popover
          const openPopover = Boolean(anchorEl);

          const getAllFields = () => {
            const importantFields = [
              {
                key: "orgName",
                label: "Organization Name",
                section: "basic-info",
                weight: 10,
                tooltip: "The official legal name of your organization",
              },
              {
                key: "orgEmail",
                label: "Organization Email",
                section: "basic-info",
                weight: 10,
                tooltip: "Primary contact email for communications",
              },
              {
                key: "orgWebsite",
                label: "Website",
                section: "basic-info",
                weight: 8,
                tooltip: "Official website URL of your organization",
              },
              {
                key: "authServerUrl",
                label: "Auth Server URL",
                section: "basic-info",
                weight: 8,
                tooltip: "Domain used for automatic organization detection",
              },
              {
                key: "orgSlug",
                label: "Organization Slug",
                section: "basic-info",
                weight: 5,
                tooltip: "Unique URL-friendly identifier",
              },
              {
                key: "orgLogos",
                label: "Organization Logos",
                section: "branding-logos",
                weight: 8,
                isArray: true,
                tooltip: "Company logos in various sizes for branding",
              },
              {
                key: "loginPageDesign",
                label: "Login Page Design",
                section: "login-design",
                weight: 7,
                tooltip: "Custom login page layout and design",
              },
              {
                key: "orgTheme.primaryColor",
                label: "Primary Color",
                section: "theme",
                weight: 5,
                nested: true,
                tooltip: "Main brand color for UI elements",
              },
              {
                key: "orgTheme.secondaryColor",
                label: "Secondary Color",
                section: "theme",
                weight: 3,
                nested: true,
                tooltip: "Secondary brand color for accents",
              },
              {
                key: "tokenSignKey",
                label: "JWT Token Sign Key",
                section: "jwt-settings",
                weight: 10,
                tooltip: "Secret key for signing authentication tokens",
              },
              {
                key: "smtpSettings.host",
                label: "SMTP Host",
                section: "smtp",
                weight: 5,
                nested: true,
                tooltip: "Email server hostname for sending emails",
              },
              {
                key: "smtpSettings.port",
                label: "SMTP Port",
                section: "smtp",
                weight: 3,
                nested: true,
                tooltip: "Email server port (usually 587 or 465)",
              },
              {
                key: "smtpSettings.user",
                label: "SMTP User",
                section: "smtp",
                weight: 3,
                nested: true,
                tooltip: "Username for email server authentication",
              },
              {
                key: "orgRedirectionSettings",
                label: "Redirection Settings",
                section: "redirection-settings",
                weight: 8,
                isArray: true,
                requireNonEmpty: true,
                tooltip: "Post-login redirect URLs (at least 1 required)",
              },
            ];

            const allFieldsWithStatus: Array<{
              label: string;
              section: string;
              sectionId: string;
              weight: number;
              isFilled: boolean;
              tooltip: string;
            }> = [];

            importantFields.forEach((field) => {
              let fieldValue: any;
              if (field.nested) {
                const keys = field.key.split(".");
                fieldValue = keys.reduce((obj: any, key) => obj?.[key], values);
              } else {
                fieldValue = (values as any)[field.key];
              }

              let isFilled = false;
              if (field.isArray && Array.isArray(fieldValue)) {
                isFilled = field.requireNonEmpty ? fieldValue.length > 0 : true;
              } else if (typeof fieldValue === "string") {
                isFilled = fieldValue.trim() !== "";
              } else if (typeof fieldValue === "number") {
                isFilled = true;
              } else if (fieldValue !== null && fieldValue !== undefined) {
                isFilled = true;
              }

              allFieldsWithStatus.push({
                label: field.label,
                section: field.section,
                sectionId: field.section,
                weight: field.weight,
                isFilled,
                tooltip: field.tooltip,
              });
            });

            return allFieldsWithStatus.sort((a, b) => b.weight - a.weight);
          };

          const allFields = getAllFields();
          const incompleteFields = allFields.filter((f) => !f.isFilled);

          const handlePopoverOpen = (
            event: React.MouseEvent<HTMLButtonElement>,
          ) => {
            setAnchorEl(event.currentTarget);
          };

          const handlePopoverClose = () => {
            setAnchorEl(null);
          };

          const handleJumpToField = (sectionId: string) => {
            handlePopoverClose();
            const basePath = isCreateMode
              ? "/god/organization/create"
              : `/god/organization/update/${orgId}`;
            navigate(`${basePath}/${sectionId}`, { replace: false });
            setTimeout(() => {
              const pageContent = document.querySelector("[data-page-content]");
              if (pageContent) {
                pageContent.scrollTop = 0;
              }
            }, 100);
          };

          // Get all validation errors for display
          const getAllValidationErrors = () => {
            const allErrors: Array<{
              field: string;
              message: string;
              section: string;
            }> = [];

            // Check each section for errors
            menuItems.forEach((menu) => {
              menu.children?.forEach((page) => {
                if (page.fields) {
                  page.fields.forEach((field) => {
                    const fieldErrors = errors[field as keyof typeof errors];
                    const fieldTouched = touched[field as keyof typeof touched];
                    const fieldValue = values[field as keyof typeof values];

                    if (fieldErrors) {
                      // Handle array fields (like roles, orgRedirectionSettings)
                      if (
                        Array.isArray(fieldErrors) &&
                        Array.isArray(fieldTouched)
                      ) {
                        fieldErrors.forEach((itemError, index) => {
                          if (itemError && typeof itemError === "object") {
                            Object.entries(itemError).forEach(
                              ([key, value]) => {
                                // Show error if field is touched OR has a value
                                const isTouched =
                                  (fieldTouched[index] as any) &&
                                  (fieldTouched[index] as any)[key];
                                const hasValue =
                                  (fieldValue as any) &&
                                  (fieldValue as any)[index] &&
                                  (fieldValue as any)[index][key];
                                if (value && (isTouched || hasValue)) {
                                  // Handle nested objects in arrays (e.g., array of objects with object properties)
                                  if (
                                    typeof value === "object" &&
                                    value !== null &&
                                    !Array.isArray(value)
                                  ) {
                                    Object.entries(value).forEach(
                                      ([nestedKey, nestedValue]) => {
                                        if (
                                          nestedValue &&
                                          typeof nestedValue === "string"
                                        ) {
                                          allErrors.push({
                                            field: `${field}[${index}].${key}.${nestedKey}`,
                                            message: nestedValue,
                                            section: page.label,
                                          });
                                        }
                                      },
                                    );
                                  } else if (typeof value === "string") {
                                    allErrors.push({
                                      field: `${field}[${index}].${key}`,
                                      message: value,
                                      section: page.label,
                                    });
                                  }
                                }
                              },
                            );
                          }
                        });
                      } else if (
                        typeof fieldErrors === "object" &&
                        !Array.isArray(fieldErrors)
                      ) {
                        // Handle object fields - recursively process nested objects
                        const processObjectErrors = (
                          obj: any,
                          path: string,
                          touched: any,
                          value: any,
                        ) => {
                          Object.entries(obj).forEach(([key, error]) => {
                            const isTouched = touched && touched[key];
                            const hasValue = value && value[key];

                            if (error && (isTouched || hasValue)) {
                              if (
                                typeof error === "object" &&
                                error !== null &&
                                !Array.isArray(error)
                              ) {
                                // Recursively process nested objects
                                processObjectErrors(
                                  error,
                                  `${path}.${key}`,
                                  isTouched,
                                  hasValue,
                                );
                              } else if (typeof error === "string") {
                                // Only add string errors
                                allErrors.push({
                                  field: `${path}.${key}`,
                                  message: error,
                                  section: page.label,
                                });
                              }
                            }
                          });
                        };

                        processObjectErrors(
                          fieldErrors,
                          field,
                          fieldTouched,
                          fieldValue,
                        );
                      } else if (typeof fieldErrors === "string") {
                        // Handle string fields - show if touched OR has value
                        if (fieldTouched || fieldValue) {
                          allErrors.push({
                            field,
                            message: fieldErrors,
                            section: page.label,
                          });
                        }
                      }
                    }
                  });
                }
              });
            });

            return allErrors;
          };

          const validationErrors = getAllValidationErrors();
          const hasValidationErrors = validationErrors.length > 0;

          // Function to scroll to a section and get error field info
          const getErrorFieldPath = (errorField: string) => {
            // Extract section ID from error field (e.g., 'roles[0].name' -> 'roles')
            const match = errorField.match(/^([a-zA-Z]+)/);
            return match ? match[1] : null;
          };

          // Function to scroll to a section
          const scrollToSection = (sectionId: string) => {
            // Change currentPageId without changing URL to keep warnings visible
            // The page content will update based on currentPageId
            const basePath = isCreateMode
              ? "/god/organization/create"
              : `/god/organization/update/${orgId}`;
            navigate(`${basePath}/${sectionId}`, { replace: false });

            // Then scroll after a brief delay to ensure the page content is rendered
            setTimeout(() => {
              const pageContent = document.querySelector("[data-page-content]");
              if (pageContent) {
                pageContent.scrollTop = 0;
              }
            }, 100);
          };

          return (
            <Form>
              <Box sx={{ display: "flex", height: "calc(100vh - 48px)" }}>
                {/* Drawer */}
                <Drawer
                  variant="permanent"
                  sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                      width: drawerWidth,
                      boxSizing: "border-box",
                      position: "relative",
                      height: "100%",
                      borderRight: 1,
                      borderColor: "divider",
                    },
                  }}
                >
                  <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search Settings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search
                              sx={{ fontSize: 18, color: "text.secondary" }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "grey.50",
                          "&:hover": {
                            bgcolor: "grey.100",
                          },
                          "&.Mui-focused": {
                            bgcolor: "background.paper",
                          },
                        },
                      }}
                    />
                  </Box>
                  <List sx={{ flex: 1, overflow: "auto", py: 1 }}>
                    {filteredMenuItems.map((menuItem) => {
                      const parentHasErrors = getParentMenuErrors(
                        menuItem,
                        errors,
                        touched,
                      );
                      const isOpen = openMenus[menuItem.id] || false;

                      return (
                        <React.Fragment key={menuItem.id}>
                          <ListItem disablePadding>
                            <ListItemButton
                              onClick={() => toggleMenu(menuItem.id)}
                              disabled={isSubmitting}
                              sx={{
                                py: 1,
                                mx: 1,
                                mb: 0.5,
                                borderRadius: 1,
                                bgcolor: parentHasErrors
                                  ? "#fff3e0"
                                  : undefined,
                                "&:hover": {
                                  bgcolor: parentHasErrors
                                    ? "#ffe0b2"
                                    : "action.hover",
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  color: parentHasErrors
                                    ? "#f57c00"
                                    : "text.secondary",
                                  minWidth: 32,
                                }}
                              >
                                {parentHasErrors ? (
                                  <Warning sx={{ fontSize: 18 }} />
                                ) : (
                                  React.cloneElement(
                                    menuItem.icon as React.ReactElement<{
                                      fontSize?: string;
                                    }>,
                                    {
                                      fontSize: "small",
                                    },
                                  )
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={menuItem.label}
                                primaryTypographyProps={{
                                  fontWeight: 600,
                                  fontSize: "0.813rem",
                                  color: parentHasErrors
                                    ? "#f57c00"
                                    : "text.primary",
                                }}
                              />
                              {isOpen ? (
                                <ExpandLess sx={{ fontSize: 18 }} />
                              ) : (
                                <ExpandMore sx={{ fontSize: 18 }} />
                              )}
                            </ListItemButton>
                          </ListItem>

                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {menuItem.children?.map((page) => {
                                const pageHasErrors = getPageErrors(
                                  page.id,
                                  errors,
                                  touched,
                                );
                                return (
                                  <ListItem key={page.id} disablePadding>
                                    <ListItemButton
                                      selected={currentPageId === page.id}
                                      onClick={() =>
                                        !page.comingSoon &&
                                        navigateToPage(page.id, false)
                                      }
                                      disabled={page.comingSoon || isSubmitting}
                                      sx={{
                                        py: 0.75,
                                        pl: 4.5,
                                        mx: 1,
                                        mb: 0.5,
                                        borderRadius: 1,
                                        bgcolor: pageHasErrors
                                          ? "#fff3e0"
                                          : undefined,
                                        "&.Mui-selected": {
                                          bgcolor: "primary.lighter",
                                          color: "primary.dark",
                                          borderLeft: "3px solid",
                                          borderColor: "primary.main",
                                          "& .MuiListItemIcon-root": {
                                            color: "primary.dark",
                                          },
                                          "&:hover": {
                                            bgcolor: "primary.light",
                                          },
                                        },
                                        "&:hover": {
                                          bgcolor: pageHasErrors
                                            ? "#ffe0b2"
                                            : "action.hover",
                                        },
                                        "&.Mui-disabled": {
                                          opacity: 0.5,
                                        },
                                      }}
                                    >
                                      <ListItemIcon
                                        sx={{
                                          color: pageHasErrors
                                            ? "#f57c00"
                                            : "text.secondary",
                                          minWidth: 30,
                                        }}
                                      >
                                        {pageHasErrors ? (
                                          <Warning sx={{ fontSize: 16 }} />
                                        ) : (
                                          React.cloneElement(
                                            page.icon as React.ReactElement<{
                                              sx?: object;
                                            }>,
                                            {
                                              sx: { fontSize: 16 },
                                            },
                                          )
                                        )}
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={page.label}
                                        primaryTypographyProps={{
                                          fontWeight:
                                            currentPageId === page.id
                                              ? 600
                                              : 400,
                                          fontSize: "0.75rem",
                                          color:
                                            currentPageId === page.id
                                              ? "primary.dark"
                                              : "text.primary",
                                        }}
                                      />
                                      {page.comingSoon && (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "text.disabled",
                                            fontSize: "0.65rem",
                                          }}
                                        >
                                          Soon
                                        </Typography>
                                      )}
                                    </ListItemButton>
                                  </ListItem>
                                );
                              })}
                            </List>
                          </Collapse>
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Drawer>

                {/* Main Content */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {/* Breadcrumb Section */}
                  <Box
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Breadcrumbs
                      separator={
                        <NavigateNext
                          fontSize="small"
                          sx={{ color: "text.disabled" }}
                        />
                      }
                    >
                      <MuiLink
                        component="button"
                        variant="body2"
                        onClick={() => navigate("/god/organizations")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          textDecoration: "none",
                          color: "text.secondary",
                          fontSize: "0.813rem",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      >
                        <Business sx={{ mr: 0.5, fontSize: "1rem" }} />
                        Organizations
                      </MuiLink>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: "0.813rem" }}
                      >
                        {isCreateMode
                          ? "Create Organization"
                          : organization?.orgName || "Update Organization"}
                      </Typography>
                      <Typography
                        color="text.primary"
                        sx={{ fontSize: "0.813rem", fontWeight: 500 }}
                      >
                        {currentPage.label}
                      </Typography>
                    </Breadcrumbs>
                  </Box>

                  {/* Header */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1,
                      bgcolor: "background.paper",
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      {/* Left: Back + Logo + Organization Name */}
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {!isCreateMode && organization?.orgName && (
                          <Tooltip title="Back to Organizations">
                            <IconButton
                              size="small"
                              onClick={() => navigate("/god/organizations")}
                              sx={{
                                color: "text.secondary",
                                "&:hover": {
                                  color: "primary.main",
                                  bgcolor: "primary.lighter",
                                },
                              }}
                            >
                              <NavigateNext
                                sx={{
                                  transform: "rotate(180deg)",
                                  fontSize: 18,
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Go to Organizations List">
                          <IconButton
                            size="small"
                            onClick={() => navigate("/god/organizations")}
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              cursor: "pointer",
                              "&:hover": {
                                bgcolor: "primary.dark",
                              },
                            }}
                          >
                            <Business sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {!isCreateMode && organization?.orgName && (
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.938rem" }}
                          >
                            {organization.orgName}
                          </Typography>
                        )}
                        {isCreateMode && (
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, fontSize: "0.938rem" }}
                          >
                            Create New Organization
                          </Typography>
                        )}
                      </Box>

                      {/* Center: Progress Indicator */}
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{
                          flex: 1,
                          justifyContent: "center",
                          px: 1.5,
                          maxWidth: 350,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem", minWidth: 60 }}
                        >
                          Progress:
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Box display="flex" alignItems="center" gap={0.75}>
                            <LinearProgress
                              variant="determinate"
                              value={completionProgress}
                              sx={{
                                flex: 1,
                                height: 5,
                                borderRadius: 1,
                                bgcolor: "grey.200",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor:
                                    completionProgress === 100
                                      ? "success.main"
                                      : completionProgress >= 70
                                        ? "info.main"
                                        : completionProgress >= 40
                                          ? "warning.main"
                                          : "error.main",
                                  borderRadius: 1,
                                },
                              }}
                            />
                            <Chip
                              label={`${completionProgress}%`}
                              size="small"
                              color={
                                completionProgress === 100
                                  ? "success"
                                  : completionProgress >= 70
                                    ? "info"
                                    : completionProgress >= 40
                                      ? "warning"
                                      : "error"
                              }
                              sx={{
                                minWidth: 48,
                                height: 22,
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                            {incompleteFields.length > 0 && (
                              <>
                                <Tooltip
                                  title="View all important fields status"
                                  disableInteractive
                                >
                                  <IconButton
                                    size="small"
                                    onClick={handlePopoverOpen}
                                    sx={{
                                      color:
                                        completionProgress >= 70
                                          ? "info.main"
                                          : "warning.main",
                                      width: 28,
                                      height: 28,
                                    }}
                                  >
                                    <InfoOutlined sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Popover
                                  open={openPopover}
                                  anchorEl={anchorEl}
                                  onClose={handlePopoverClose}
                                  anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "center",
                                  }}
                                  transformOrigin={{
                                    vertical: "top",
                                    horizontal: "center",
                                  }}
                                  disableScrollLock
                                  slotProps={{
                                    paper: {
                                      sx: {
                                        mt: 1,
                                        boxShadow: 3,
                                      },
                                    },
                                  }}
                                >
                                  <Paper sx={{ p: 2.5, width: 520 }}>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="space-between"
                                      mb={1.5}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        sx={{
                                          fontWeight: 600,
                                          fontSize: "0.938rem",
                                        }}
                                      >
                                        Important Fields Status
                                      </Typography>
                                      <Chip
                                        label={`${allFields.filter((f) => f.isFilled).length}/${allFields.length} Complete`}
                                        size="small"
                                        color={
                                          completionProgress === 100
                                            ? "success"
                                            : "warning"
                                        }
                                        sx={{
                                          fontWeight: 600,
                                          fontSize: "0.7rem",
                                        }}
                                      />
                                    </Box>
                                    <Divider sx={{ mb: 1.5 }} />
                                    <Box
                                      sx={{
                                        maxHeight: 420,
                                        overflowY: "auto",
                                        pr: 0.5,
                                      }}
                                    >
                                      {allFields.map((field, index) => (
                                        <Box
                                          key={index}
                                          onClick={() =>
                                            handleJumpToField(field.sectionId)
                                          }
                                          title={field.tooltip}
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            p: 1.25,
                                            mb: 0.75,
                                            borderRadius: 1,
                                            bgcolor: field.isFilled
                                              ? "success.lighter"
                                              : "error.lighter",
                                            border: "1px solid",
                                            borderColor: field.isFilled
                                              ? "success.light"
                                              : "error.light",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            "&:hover": {
                                              bgcolor: field.isFilled
                                                ? "success.light"
                                                : "error.light",
                                              transform: "translateX(4px)",
                                              boxShadow: 1,
                                            },
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 18,
                                              height: 18,
                                              borderRadius: "50%",
                                              bgcolor: field.isFilled
                                                ? "success.main"
                                                : "error.main",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              color: "white",
                                              fontSize: "0.7rem",
                                              fontWeight: 700,
                                              flexShrink: 0,
                                            }}
                                          >
                                            {field.isFilled ? "✓" : "✕"}
                                          </Box>
                                          <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontWeight: 600,
                                                color: field.isFilled
                                                  ? "success.dark"
                                                  : "error.dark",
                                                fontSize: "0.813rem",
                                                lineHeight: 1.3,
                                              }}
                                            >
                                              {field.label}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: field.isFilled
                                                  ? "success.main"
                                                  : "error.main",
                                                fontSize: "0.7rem",
                                                display: "block",
                                                mt: 0.25,
                                              }}
                                            >
                                              Priority: {field.weight}/10{" "}
                                              {field.isFilled
                                                ? "• ✓ Complete"
                                                : "• ✕ Incomplete"}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      ))}
                                    </Box>
                                    <Box
                                      sx={{
                                        mt: 1.5,
                                        p: 1.5,
                                        bgcolor: "grey.50",
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="flex"
                                        alignItems="center"
                                        gap={0.5}
                                        sx={{ fontSize: "0.7rem" }}
                                      >
                                        <InfoOutlined sx={{ fontSize: 12 }} />
                                        Click any field to jump to its section
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </Popover>
                              </>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Right: Save Button */}
                      <Box display="flex" alignItems="center" gap={1}>
                        {!isCreateMode && !dirty && !hasValidationErrors && (
                          <Tooltip title="No changes detected. Make changes to enable saving.">
                            <InfoOutlined color="info" sx={{ fontSize: 18 }} />
                          </Tooltip>
                        )}
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={
                            isSubmitting ||
                            (!isCreateMode && !dirty && !hasValidationErrors)
                          }
                          startIcon={
                            isSubmitting ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Save sx={{ fontSize: 18 }} />
                            )
                          }
                          size="small"
                          sx={{ py: 0.75 }}
                        >
                          {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                      </Box>
                    </Box>

                    {hasValidationErrors && (
                      <Alert
                        severity="error"
                        sx={{ mt: 2, position: "sticky", top: 0, zIndex: 10 }}
                        icon={<Warning />}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Validation Issues Found:
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                          {validationErrors.map((error, index) => {
                            // Find the page ID for this error
                            const fieldKey = getErrorFieldPath(error.field);
                            const page = pages.find(
                              (p) =>
                                p.id === fieldKey || p.label === error.section,
                            );

                            return (
                              <Box
                                key={index}
                                component="li"
                                sx={{
                                  cursor: "pointer",
                                  "&:hover": {
                                    textDecoration: "underline",
                                    color: "error.dark",
                                  },
                                  mb: 0.5,
                                  transition: "color 0.2s",
                                }}
                                onClick={() => {
                                  if (page) {
                                    scrollToSection(page.id);
                                  }
                                }}
                              >
                                <Typography variant="body2">
                                  <strong>{error.section}:</strong>{" "}
                                  {error.message}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, fontStyle: "italic" }}
                        >
                          Click on any error to jump to that section
                        </Typography>
                      </Alert>
                    )}
                  </Box>

                  {/* Page Content */}
                  <Box
                    sx={{
                      flex: 1,
                      overflow: "auto",
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    data-page-content
                  >
                    <Box sx={{ flex: 1 }}>
                      {loading ? (
                        <Box>
                          <Skeleton
                            variant="rectangular"
                            height={60}
                            sx={{ mb: 2, borderRadius: 1 }}
                          />
                          <Skeleton
                            variant="rectangular"
                            height={400}
                            sx={{ mb: 2, borderRadius: 1 }}
                          />
                          <Skeleton
                            variant="rectangular"
                            height={60}
                            sx={{ borderRadius: 1 }}
                          />
                        </Box>
                      ) : (
                        renderPageContent()
                      )}
                    </Box>

                    {/* Page Description at Bottom */}
                    {currentPage.description && !currentPage.comingSoon && (
                      <Alert severity="info" sx={{ mt: 3 }} icon={<Info />}>
                        {currentPage.description}
                      </Alert>
                    )}
                  </Box>
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default OrganizationForm;
