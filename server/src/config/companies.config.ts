// Company Configuration Types
export interface Theme {
  palette?: {
    primary?: { main: string };
    secondary?: { main: string };
  };
  typography?: {
    fontFamily?: string;
  };
}

export interface RoleDetail {
  role: string;
  access: string[];
}

export interface Policy {
  data: string;
  privacy: string;
  terms: string;
}

export interface CompanyConfig {
  name: string;
  logo: string;
  companyId: string;
  tokenSignKey: string;
  companyDomain: string;
  redirectUrl: string;
  roleDetails: RoleDetail[];
  policies: Policy[];
  appTheme: string;
  smtpSettings?: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  featureFlags?: {
    googleLogin: boolean;
    emailVerification: boolean;
    passwordReset: boolean;
  };
  customSettings?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  database?: {
    uri: string;
    name: string;
  };
}

export interface ThemeConfig {
  [companyName: string]: Theme;
}

// Company Configurations
const exyconn: CompanyConfig = {
  name: "exyconn",
  logo: "kasda.png",
  companyId: "uuid1",
  tokenSignKey: "secret1",
  companyDomain: "exyconn.com",
  redirectUrl: "app.exyconn.com",
  roleDetails: [
    { role: "admin", access: ["app.user.create", "app.user.delete"] },
    { role: "user", access: ["app.user.read"] },
  ],
  policies: [{ data: "url", privacy: "", terms: "link" }],
  appTheme: "exyconn",
  smtpSettings: {
    host: "smtp.gmail.com",
    port: 587,
    user: "noreply@exyconn.com",
    pass: "password",
  },
  featureFlags: {
    googleLogin: true,
    emailVerification: true,
    passwordReset: true,
  },
  customSettings: {
    primaryColor: "#1976d2",
    secondaryColor: "#dc004e",
    fontFamily: "Roboto, sans-serif",
  },
  database: {
    uri: "mongodb://localhost:27017",
    name: "exyconn_auth",
  },
};

const spentiva: CompanyConfig = {
  name: "spentiva",
  logo: "kasda.png",
  companyId: "uuid2",
  tokenSignKey: "secret2",
  companyDomain: "spentiva.com",
  redirectUrl: "app.spentiva.com",
  roleDetails: [
    { role: "admin", access: ["app.user.create", "app.user.delete"] },
    { role: "user", access: ["app.user.read"] },
  ],
  policies: [{ data: "url", privacy: "", terms: "link" }],
  appTheme: "spentiva",
  smtpSettings: {
    host: "smtp.gmail.com",
    port: 587,
    user: "noreply@spentiva.com",
    pass: "password",
  },
  featureFlags: {
    googleLogin: true,
    emailVerification: true,
    passwordReset: true,
  },
  customSettings: {
    primaryColor: "#4caf50",
    secondaryColor: "#ff9800",
    fontFamily: "Arial, sans-serif",
  },
  database: {
    uri: "mongodb://localhost:27017",
    name: "spentiva_auth",
  },
};

const botify: CompanyConfig = {
  name: "botify",
  logo: "botify.png",
  companyId: "uuid3",
  tokenSignKey: "secret3",
  companyDomain: "botify.life",
  redirectUrl: "app.botify.life",
  roleDetails: [
    { role: "admin", access: ["app.user.create", "app.user.delete"] },
    { role: "user", access: ["app.user.read"] },
  ],
  policies: [{ data: "url", privacy: "", terms: "link" }],
  appTheme: "botify",
  smtpSettings: {
    host: "smtp.gmail.com",
    port: 587,
    user: "noreply@botify.life",
    pass: "password",
  },
  featureFlags: {
    googleLogin: true,
    emailVerification: true,
    passwordReset: true,
  },
  customSettings: {
    primaryColor: "#2196f3",
    secondaryColor: "#ff5722",
    fontFamily: "Roboto, sans-serif",
  },
  database: {
    uri: "mongodb://localhost:27017",
    name: "botify_auth",
  },
};

const partywings: CompanyConfig = {
  name: "partywings",
  logo: "kasda.png",
  companyId: "uuid4",
  tokenSignKey: "secret4",
  companyDomain: "partywings.com",
  redirectUrl: "app.partywings.com",
  roleDetails: [
    { role: "admin", access: ["app.user.create", "app.user.delete"] },
    { role: "user", access: ["app.user.read"] },
  ],
  policies: [{ data: "url", privacy: "", terms: "link" }],
  appTheme: "partywings",
  smtpSettings: {
    host: "smtp.gmail.com",
    port: 587,
    user: "noreply@partywings.com",
    pass: "password",
  },
  featureFlags: {
    googleLogin: false,
    emailVerification: true,
    passwordReset: true,
  },
  customSettings: {
    primaryColor: "#9c27b0",
    secondaryColor: "#e91e63",
    fontFamily: "Comic Sans MS, cursive",
  },
  database: {
    uri: "mongodb://localhost:27017",
    name: "partywings_auth",
  },
};

const sibera: CompanyConfig = {
  name: "sibera",
  logo: "kasda.png",
  companyId: "uuid5",
  tokenSignKey: "secret5",
  companyDomain: "sibera.com",
  redirectUrl: "app.sibera.com",
  roleDetails: [
    { role: "admin", access: ["app.user.create", "app.user.delete"] },
    { role: "user", access: ["app.user.read"] },
  ],
  policies: [{ data: "url", privacy: "", terms: "link" }],
  appTheme: "sibera",
  smtpSettings: {
    host: "smtp.gmail.com",
    port: 587,
    user: "noreply@sibera.com",
    pass: "password",
  },
  featureFlags: {
    googleLogin: true,
    emailVerification: false,
    passwordReset: true,
  },
  customSettings: {
    primaryColor: "#607d8b",
    secondaryColor: "#795548",
    fontFamily: "Georgia, serif",
  },
  database: {
    uri: "mongodb://localhost:27017",
    name: "sibera_auth",
  },
};

// Export all companies
export const companies: CompanyConfig[] = [
  exyconn,
  spentiva,
  botify,
  partywings,
  sibera,
];

// Helper functions
export const getCompanyById = (
  companyId: string,
): CompanyConfig | undefined => {
  return companies.find((c) => c.companyId === companyId);
};

export const getCompanyByDomain = (
  domain: string,
): CompanyConfig | undefined => {
  return companies.find((c) => c.companyDomain === domain);
};

export const getCompanyByName = (name: string): CompanyConfig | undefined => {
  return companies.find((c) => c.name.toLowerCase() === name.toLowerCase());
};

export const getTokenSignKey = (companyId: string): string => {
  const company = getCompanyById(companyId);
  return company?.tokenSignKey || process.env.JWT_SECRET || "default-secret";
};
