import React, { useEffect, useState } from "react";
import { useFormikContext, FieldArray } from "formik";
import {
  Grid,
  Typography,
  Box,
  Fade,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  TextFields,
  Add,
  Delete,
  ExpandMore,
  Error as ErrorIcon,
} from "@mui/icons-material";
import SlugField from "../../components/SlugField";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { OrganizationFormData } from "./types";
import { generateSlug } from "../../utils/slug";

const CustomTextForm: React.FC = () => {
  const { values, setFieldValue, errors, touched } =
    useFormikContext<OrganizationFormData>();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });

  // Auto-generate slug when name changes for custom text sections
  useEffect(() => {
    (values.customTextSections || []).forEach((section, index) => {
      if (section.name && !section.slug) {
        const slug = generateSlug(section.name);
        setFieldValue(`customTextSections.${index}.slug`, slug);
      }
    });
  }, [values.customTextSections, setFieldValue]);

  // Helper function to check if a section has errors
  const hasError = (index: number) => {
    const sectionErrors = errors.customTextSections as any;
    const sectionTouched = touched.customTextSections as any;

    if (!sectionErrors || !sectionTouched) return false;
    if (!sectionErrors[index] || !sectionTouched[index]) return false;

    const errorObj = sectionErrors[index];
    const touchedObj = sectionTouched[index];

    // Check if any field in this section has an error and is touched
    return Object.keys(errorObj || {}).some(
      (key) => touchedObj && touchedObj[key] && errorObj[key],
    );
  };

  // Get error message for a specific field
  const getFieldError = (index: number, fieldName: string) => {
    const sectionErrors = errors.customTextSections as any;
    const sectionTouched = touched.customTextSections as any;

    if (!sectionErrors || !sectionTouched) return undefined;
    if (!sectionErrors[index] || !sectionTouched[index]) return undefined;

    return sectionTouched[index][fieldName]
      ? sectionErrors[index][fieldName]
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
            <TextFields color="primary" />
            <Typography variant="h6">Custom Text Sections</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Add custom text sections for your branding pages. These sections can
            be used to display titles, descriptions, slogans, and other textual
            content with different typography styles.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FieldArray name="customTextSections">
            {({ push, remove }) => (
              <Box>
                {(values.customTextSections || []).map((section, index) => (
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
                      <Box display="flex" alignItems="center" gap={1} flex={1}>
                        {hasError(index) && (
                          <ErrorIcon color="error" fontSize="small" />
                        )}
                        <Typography variant="body2" fontWeight="medium">
                          Section {index + 1}: {section.name || "Untitled"}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(index);
                        }}
                        disabled={index < 3} // Prevent deletion of first 3 default sections
                        sx={{ mr: 1 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Name"
                            required
                            value={section.name}
                            onChange={(e) => {
                              const name = e.target.value;
                              setFieldValue(
                                `customTextSections.${index}.name`,
                                name,
                              );
                              // Auto-generate slug from name
                              setFieldValue(
                                `customTextSections.${index}.slug`,
                                generateSlug(name),
                              );
                            }}
                            error={Boolean(getFieldError(index, "name"))}
                            helperText={
                              getFieldError(index, "name") ||
                              "Display name for this text section"
                            }
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <SlugField
                            label="Slug"
                            value={section.slug}
                            disabled
                            helperText="Auto-generated from name (read-only)"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl
                            fullWidth
                            error={Boolean(getFieldError(index, "type"))}
                          >
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={section.type}
                              label="Type"
                              onChange={(e) => {
                                const type = e.target.value as
                                  | "heading"
                                  | "paragraph";
                                setFieldValue(
                                  `customTextSections.${index}.type`,
                                  type,
                                );
                                // Auto-set default variant based on type
                                const defaultVariant =
                                  type === "heading" ? "h1" : "body1";
                                if (
                                  !section.variant ||
                                  (type === "heading" &&
                                    ![
                                      "h1",
                                      "h2",
                                      "h3",
                                      "h4",
                                      "h5",
                                      "h6",
                                    ].includes(section.variant || "")) ||
                                  (type === "paragraph" &&
                                    !["body1", "body2"].includes(
                                      section.variant || "",
                                    ))
                                ) {
                                  setFieldValue(
                                    `customTextSections.${index}.variant`,
                                    defaultVariant,
                                  );
                                }
                              }}
                            >
                              <MenuItem value="heading">Heading</MenuItem>
                              <MenuItem value="paragraph">Paragraph</MenuItem>
                            </Select>
                            {getFieldError(index, "type") && (
                              <Typography
                                variant="caption"
                                color="error"
                                sx={{ mt: 0.5, ml: 2 }}
                              >
                                {getFieldError(index, "type")}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl
                            fullWidth
                            error={Boolean(getFieldError(index, "variant"))}
                          >
                            <InputLabel>Variant</InputLabel>
                            <Select
                              value={
                                section.variant ||
                                (section.type === "heading" ? "h1" : "body1")
                              }
                              label="Variant"
                              onChange={(e) =>
                                setFieldValue(
                                  `customTextSections.${index}.variant`,
                                  e.target.value,
                                )
                              }
                            >
                              {section.type === "heading" ? (
                                <>
                                  <MenuItem value="h1">H1 (Largest)</MenuItem>
                                  <MenuItem value="h2">H2</MenuItem>
                                  <MenuItem value="h3">H3</MenuItem>
                                  <MenuItem value="h4">H4</MenuItem>
                                  <MenuItem value="h5">H5</MenuItem>
                                  <MenuItem value="h6">H6 (Smallest)</MenuItem>
                                </>
                              ) : (
                                <>
                                  <MenuItem value="body1">
                                    Body 1 (Regular)
                                  </MenuItem>
                                  <MenuItem value="body2">
                                    Body 2 (Small)
                                  </MenuItem>
                                </>
                              )}
                            </Select>
                            {getFieldError(index, "variant") && (
                              <Typography
                                variant="caption"
                                color="error"
                                sx={{ mt: 0.5, ml: 2 }}
                              >
                                {getFieldError(index, "variant")}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Text Content"
                            value={section.text}
                            onChange={(e) =>
                              setFieldValue(
                                `customTextSections.${index}.text`,
                                e.target.value,
                              )
                            }
                            placeholder={`Enter ${section.type === "heading" ? "heading" : "paragraph"} text here...`}
                            error={Boolean(getFieldError(index, "text"))}
                            helperText={
                              getFieldError(index, "text") ||
                              "The actual text content to display"
                            }
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() =>
                    push({
                      name: "",
                      slug: "",
                      text: "",
                      type: "heading",
                      variant: "h1",
                    })
                  }
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Add Text Section
                </Button>

                <ConfirmationDialog
                  open={deleteDialog.open}
                  title="Delete Text Section"
                  message="Are you sure you want to delete this custom text section? This action cannot be undone."
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

        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              backgroundColor: "info.main",
              color: "info.contrastText",
              borderRadius: 1,
              opacity: 0.8,
            }}
          >
            <Typography variant="caption" display="block">
              💡 <strong>Tip:</strong> The first three sections (Title,
              Description, Slogan) are default sections and cannot be deleted.
              You can edit their content and styling as needed.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default CustomTextForm;
