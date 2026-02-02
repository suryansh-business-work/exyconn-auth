import React, { useState, useEffect } from "react";
import { useFormikContext, Field, FieldProps, FieldArray } from "formik";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Fade,
  Button,
  IconButton,
  Autocomplete,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Palette,
  Add,
  Delete,
  ExpandMore,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { clientLogger } from "@exyconn/common/client/logger";
import SlugField from "../../components/SlugField";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { OrganizationFormData } from "./types";
import { generateSlug } from "../../utils/slug";

interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>;
  category: string;
  kind: string;
  menu: string;
}

const ThemeForm: React.FC = () => {
  const { values, setFieldValue, errors, touched } =
    useFormikContext<OrganizationFormData>();
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [loadingFonts, setLoadingFonts] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });

  useEffect(() => {
    fetchGoogleFonts();
  }, []);

  const fetchGoogleFonts = async () => {
    setLoadingFonts(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBVRHmHcuTxQnYMvYHvVSOxXGMAgxSoIHI&sort=popularity`,
      );
      const data = await response.json();
      setGoogleFonts(data.items || []);
    } catch (error) {
      clientLogger.error("Failed to fetch Google Fonts:", error);
    } finally {
      setLoadingFonts(false);
    }
  };

  // Helper function to check if a custom color has errors
  const hasError = (index: number) => {
    const themeErrors = errors.orgTheme as any;
    const themeTouched = touched.orgTheme as any;
    const colorErrors = themeErrors?.customColors;
    const colorTouched = themeTouched?.customColors;

    if (!colorErrors || !colorTouched) return false;
    if (!colorErrors[index] || !colorTouched[index]) return false;

    const errorObj = colorErrors[index];
    const touchedObj = colorTouched[index];

    return Object.keys(errorObj || {}).some(
      (key) => touchedObj && touchedObj[key] && errorObj[key],
    );
  };

  // Get error message for a specific field
  const getFieldError = (index: number, fieldName: string) => {
    const themeErrors = errors.orgTheme as any;
    const themeTouched = touched.orgTheme as any;
    const colorErrors = themeErrors?.customColors;
    const colorTouched = themeTouched?.customColors;

    if (!colorErrors || !colorTouched) return undefined;
    if (!colorErrors[index] || !colorTouched[index]) return undefined;

    return colorTouched[index][fieldName]
      ? colorErrors[index][fieldName]
      : undefined;
  };

  const handleDeleteClick = (index: number) => {
    setDeleteDialog({ open: true, index });
  };

  const handleDeleteConfirm = (removeFunc: (index: number) => void) => {
    if (deleteDialog.index !== null) {
      removeFunc(deleteDialog.index);
    }
    setDeleteDialog({ open: false, index: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, index: null });
  };

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Palette color="primary" />
            <Typography variant="h6">Theme Customization</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Customize the visual appearance of your organization's interface
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgTheme.primaryColor">
            {({ field, meta }: FieldProps<string>) => (
              <Box>
                <TextField
                  {...field}
                  fullWidth
                  label="Primary Color"
                  type="color"
                  error={meta.touched && Boolean(meta.error)}
                  InputLabelProps={{ shrink: true }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Main brand color used for primary elements (default: #1976d2)
                </Typography>
              </Box>
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgTheme.secondaryColor">
            {({ field, meta }: FieldProps<string>) => (
              <Box>
                <TextField
                  {...field}
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  error={meta.touched && Boolean(meta.error)}
                  InputLabelProps={{ shrink: true }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Accent color for secondary elements (default: #dc004e)
                </Typography>
              </Box>
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgTheme.tertiaryColor">
            {({ field, meta }: FieldProps<string>) => (
              <Box>
                <TextField
                  {...field}
                  fullWidth
                  label="Tertiary Color"
                  type="color"
                  error={meta.touched && Boolean(meta.error)}
                  InputLabelProps={{ shrink: true }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Additional accent color (optional)
                </Typography>
              </Box>
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={googleFonts}
            getOptionLabel={(option) => option.family}
            value={
              googleFonts.find(
                (font) => font.family === values.orgTheme?.fontFamily?.family,
              ) || null
            }
            onChange={(_, newValue) => {
              if (newValue) {
                // Store the complete font object
                setFieldValue("orgTheme.fontFamily", {
                  family: newValue.family,
                  variants: newValue.variants,
                  subsets: newValue.subsets,
                  version: newValue.version,
                  lastModified: newValue.lastModified,
                  files: newValue.files,
                  category: newValue.category,
                  kind: newValue.kind,
                  menu: newValue.menu,
                });
              } else {
                setFieldValue("orgTheme.fontFamily", undefined);
              }
            }}
            loading={loadingFonts}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Font Family"
                placeholder="Search Google Fonts..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingFonts ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                helperText="Select from 1000+ Google Fonts"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Custom Colors
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            gutterBottom
          >
            Add custom color variables for advanced theming
          </Typography>
          <FieldArray name="orgTheme.customColors">
            {({ push, remove }) => (
              <Box>
                {(values.orgTheme?.customColors || []).map(
                  (customColor, index) => (
                    <Accordion
                      key={index}
                      sx={{
                        mb: 2,
                        border: hasError(index) ? "1px solid" : "none",
                        borderColor: "error.main",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                          backgroundColor: hasError(index)
                            ? "error.light"
                            : "background.paper",
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flex={1}
                        >
                          {hasError(index) && (
                            <ErrorIcon color="error" fontSize="small" />
                          )}
                          <Typography variant="body2" fontWeight="medium">
                            Custom Color {index + 1}:{" "}
                            {customColor.title || "Untitled"}
                          </Typography>
                          {customColor.color && (
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                backgroundColor: customColor.color,
                                border: "2px solid",
                                borderColor: "divider",
                                ml: 1,
                              }}
                            />
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(index);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <SlugField
                              label="Slug"
                              value={customColor.slug}
                              disabled
                              helperText="Auto-generated from title"
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              required
                              label="Title"
                              value={customColor.title}
                              onChange={(e) => {
                                const title = e.target.value;
                                setFieldValue(
                                  `orgTheme.customColors.${index}.title`,
                                  title,
                                );
                                // Auto-generate slug from title
                                setFieldValue(
                                  `orgTheme.customColors.${index}.slug`,
                                  generateSlug(title),
                                );
                              }}
                              error={Boolean(getFieldError(index, "title"))}
                              helperText={
                                getFieldError(index, "title") ||
                                "Name for this color"
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              required
                              label="Description"
                              value={customColor.description}
                              onChange={(e) =>
                                setFieldValue(
                                  `orgTheme.customColors.${index}.description`,
                                  e.target.value,
                                )
                              }
                              error={Boolean(
                                getFieldError(index, "description"),
                              )}
                              helperText={
                                getFieldError(index, "description") ||
                                "Describe this color usage"
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <TextField
                              fullWidth
                              required
                              label="Color"
                              type="color"
                              value={customColor.color}
                              onChange={(e) =>
                                setFieldValue(
                                  `orgTheme.customColors.${index}.color`,
                                  e.target.value,
                                )
                              }
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(getFieldError(index, "color"))}
                              helperText={getFieldError(index, "color")}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ),
                )}
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() =>
                    push({
                      slug: "",
                      title: "",
                      description: "",
                      color: "#000000",
                    })
                  }
                  fullWidth
                >
                  Add Custom Color
                </Button>

                <ConfirmationDialog
                  open={deleteDialog.open}
                  title="Delete Custom Color"
                  message="Are you sure you want to delete this custom color? This action cannot be undone."
                  confirmText="Delete"
                  cancelText="Cancel"
                  severity="error"
                  onConfirm={() => handleDeleteConfirm(remove)}
                  onCancel={handleDeleteCancel}
                />
              </Box>
            )}
          </FieldArray>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default ThemeForm;
