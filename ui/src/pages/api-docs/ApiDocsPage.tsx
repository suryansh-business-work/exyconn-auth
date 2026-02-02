import React from "react";
import ApiDocsViewer from "../../components/ApiDocsViewer";
import { authApiSpec } from "./apiSpecs";

/**
 * API Documentation Page
 *
 * Displays comprehensive API documentation for the Exyconn Auth API
 * using Swagger UI React.
 *
 * Features:
 * - Interactive API explorer
 * - Request/Response examples
 * - Authentication information
 * - All endpoints with detailed documentation
 */
const ApiDocsPage: React.FC = () => {
  return (
    <ApiDocsViewer
      spec={authApiSpec}
      title="Exyconn Auth API Documentation"
      showBackButton={true}
      backPath="/"
    />
  );
};

export default ApiDocsPage;
