import React, { useState } from "react";
import { useFormikContext, FieldArray } from "formik";
import {
  Grid,
  Typography,
  Box,
  Fade,
  Button,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { Api, Add, VpnKey } from "@mui/icons-material";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { OrganizationFormData } from "./types";
import { useSnackbar } from "../../contexts/SnackbarContext";
import {
  ScopeSelectionDialog,
  TokenGeneratedDialog,
  TokenAccordion,
  ApiTokenFormValues,
  createDefaultToken,
  generateMockToken,
} from "./api-tokens";

const ApiTokensForm: React.FC = () => {
  const { values, setFieldValue, errors, touched } =
    useFormikContext<OrganizationFormData>();
  const { showSnackbar } = useSnackbar();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });
  const [showTokenDialog, setShowTokenDialog] = useState<{
    open: boolean;
    token: string;
    name: string;
  }>({ open: false, token: "", name: "" });
  const [visibleTokens, setVisibleTokens] = useState<Set<number>>(new Set());
  const [scopeDialog, setScopeDialog] = useState<{
    open: boolean;
    index: number;
  }>({ open: false, index: -1 });

  const hasTokenError = (index: number) => {
    const tokenErrors = errors.apiTokens as any;
    const tokenTouched = touched.apiTokens as any;
    if (!tokenErrors?.[index] || !tokenTouched?.[index]) return false;
    return Object.keys(tokenErrors[index] || {}).some(
      (key) => tokenTouched[index]?.[key],
    );
  };

  const getFieldError = (tokenIndex: number, fieldName: string) => {
    const tokenErrors = errors.apiTokens as any;
    const tokenTouched = touched.apiTokens as any;
    if (
      !tokenErrors?.[tokenIndex]?.[fieldName] ||
      !tokenTouched?.[tokenIndex]?.[fieldName]
    )
      return undefined;
    return tokenErrors[tokenIndex][fieldName];
  };

  const toggleTokenVisibility = (index: number) => {
    setVisibleTokens((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    showSnackbar("Token copied to clipboard", "success");
  };

  const regenerateToken = (index: number) => {
    const newToken = generateMockToken();
    setFieldValue(`apiTokens.${index}.token`, newToken);
    setShowTokenDialog({
      open: true,
      token: newToken,
      name:
        (values.apiTokens?.[index] as ApiTokenFormValues)?.name || "New Token",
    });
  };

  const tokens = (values.apiTokens as ApiTokenFormValues[] | undefined) || [];

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Api color="primary" />
            <Typography variant="h6">API Token Management</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Create and manage API tokens for programmatic access to your
            organization's resources.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" icon={<VpnKey />}>
            <Typography variant="body2">
              <strong>API Documentation:</strong> Access your organization's API
              documentation at{" "}
              <code
                style={{
                  background: "#f5f5f5",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                /api-docs/{values.orgSlug || ":orgId"}
              </code>
            </Typography>
          </Alert>
        </Grid>

        <Grid item xs={12}>
          <FieldArray name="apiTokens">
            {({ push, remove }) => (
              <Box>
                {tokens.map((token, index) => (
                  <TokenAccordion
                    key={index}
                    token={token}
                    index={index}
                    roles={values.roles || []}
                    hasError={hasTokenError(index)}
                    isVisible={visibleTokens.has(index)}
                    onDelete={() => setDeleteDialog({ open: true, index })}
                    onFieldChange={(field, value) =>
                      setFieldValue(`apiTokens.${index}.${field}`, value)
                    }
                    onToggleVisibility={() => toggleTokenVisibility(index)}
                    onCopyToken={() => copyToken(token.token || "")}
                    onRegenerateToken={() => regenerateToken(index)}
                    onOpenScopeDialog={() =>
                      setScopeDialog({ open: true, index })
                    }
                    getFieldError={(field) => getFieldError(index, field)}
                  />
                ))}

                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() => push(createDefaultToken())}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Create New API Token
                </Button>

                <ConfirmationDialog
                  open={deleteDialog.open}
                  title="Revoke API Token"
                  message="Are you sure you want to revoke this API token? Any applications using this token will lose access immediately."
                  confirmText="Revoke"
                  cancelText="Cancel"
                  severity="error"
                  onConfirm={() => {
                    if (deleteDialog.index !== null) remove(deleteDialog.index);
                    setDeleteDialog({ open: false, index: null });
                  }}
                  onCancel={() => setDeleteDialog({ open: false, index: null })}
                />

                <ScopeSelectionDialog
                  open={scopeDialog.open}
                  onClose={() => setScopeDialog({ open: false, index: -1 })}
                  selectedScopes={
                    (
                      values.apiTokens?.[
                        scopeDialog.index
                      ] as ApiTokenFormValues
                    )?.scopes || []
                  }
                  onChange={(scopes) =>
                    setFieldValue(
                      `apiTokens.${scopeDialog.index}.scopes`,
                      scopes,
                    )
                  }
                />
              </Box>
            )}
          </FieldArray>
        </Grid>

        {tokens.length === 0 && (
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                textAlign: "center",
                p: 4,
              }}
            >
              <CardContent>
                <Api sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No API Tokens Created Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create API tokens for programmatic access to your
                  organization's resources.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        <TokenGeneratedDialog
          open={showTokenDialog.open}
          token={showTokenDialog.token}
          name={showTokenDialog.name}
          onClose={() =>
            setShowTokenDialog({ open: false, token: "", name: "" })
          }
          onCopy={copyToken}
        />
      </Grid>
    </Fade>
  );
};

export default ApiTokensForm;
