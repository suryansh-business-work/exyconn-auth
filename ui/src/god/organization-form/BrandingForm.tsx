import React, { useState, useRef } from "react";
import { useFormikContext } from "formik";
import {
  Grid,
  Typography,
  Box,
  Chip,
  Fade,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Image,
  Star,
  StarBorder,
  Delete,
  CloudUpload,
} from "@mui/icons-material";
import FileUpload from "../../components/FileUpload";
import { OrganizationFormData, OrgLogo } from "./types";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { API_ENDPOINTS } from "../../apis";

const logoSizes: Array<{
  size: OrgLogo["size"];
  label: string;
  shortLabel: string;
}> = [
  { size: "64x64", label: "64x64 (Small)", shortLabel: "64px" },
  { size: "128x128", label: "128x128 (Medium)", shortLabel: "128px" },
  { size: "256x256", label: "256x256 (Large)", shortLabel: "256px" },
  { size: "512x512", label: "512x512 (Extra Large)", shortLabel: "512px" },
];

const BrandingForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();
  const [uploadingSize, setUploadingSize] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { showSnackbar } = useSnackbar();

  const handleFileUpload = async (
    sizeInfo: { size: OrgLogo["size"]; label: string },
    file: File,
  ) => {
    setUploadingSize(sizeInfo.size);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_ENDPOINTS.IMAGEKIT.UPLOAD, {
        method: "POST",
        body: formData,
        headers: {
          // Use godToken for god panel
          Authorization: `Bearer ${localStorage.getItem("godToken") || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed`);
      }

      const result = await response.json();
      const url = result.data[0].filePath.fileUrl;

      const logoIndex = values.orgLogos?.findIndex(
        (logo) => logo.size === sizeInfo.size,
      );
      const isFirstLogo = !values.orgLogos || values.orgLogos.length === 0;
      const newLogo = { size: sizeInfo.size, url, isDefault: isFirstLogo };

      if (logoIndex !== undefined && logoIndex !== -1) {
        const newLogos = [...(values.orgLogos || [])];
        newLogos[logoIndex] = { ...newLogos[logoIndex], url };
        setFieldValue("orgLogos", newLogos);
      } else {
        const newLogos = [...(values.orgLogos || []), newLogo];
        setFieldValue("orgLogos", newLogos);
      }

      showSnackbar(`${sizeInfo.label} logo uploaded successfully`, "success");
    } catch (error: any) {
      showSnackbar(error.message || "Upload failed", "error");
    } finally {
      setUploadingSize(null);
    }
  };

  const handleFileSelect =
    (sizeInfo: { size: OrgLogo["size"]; label: string }) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) {
          showSnackbar("File size exceeds 5MB limit", "error");
          return;
        }

        // Proceed with upload
        handleFileUpload(sizeInfo, file);
      }
      // Reset input
      if (event.target) {
        event.target.value = "";
      }
    };

  const handleSetDefault = (size: OrgLogo["size"]) => {
    const newLogos = (values.orgLogos || []).map((logo) => ({
      ...logo,
      isDefault: logo.size === size,
    }));
    setFieldValue("orgLogos", newLogos);
  };

  const handleRemoveLogo = (size: OrgLogo["size"]) => {
    const logoIndex = values.orgLogos?.findIndex((logo) => logo.size === size);
    if (logoIndex !== undefined && logoIndex !== -1) {
      const newLogos = [...(values.orgLogos || [])];
      const wasDefault = newLogos[logoIndex].isDefault;
      newLogos.splice(logoIndex, 1);

      // If removed logo was default, set first remaining logo as default
      if (wasDefault && newLogos.length > 0) {
        newLogos[0].isDefault = true;
      }

      setFieldValue("orgLogos", newLogos);
    }
  };

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Image color="primary" />
            <Typography variant="h6">Branding Assets</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload logos and branding materials in various sizes. Select a
            default logo for primary use.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Organization Logos
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            gutterBottom
          >
            Upload logos in different sizes. Click the star icon to set as
            default logo.
          </Typography>

          {/* Horizontal Logo Display with Inline Upload */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {logoSizes.map((sizeInfo) => {
              const existingLogo = values.orgLogos?.find(
                (logo) => logo.size === sizeInfo.size,
              );
              const isDefault = existingLogo?.isDefault || false;
              const isUploading = uploadingSize === sizeInfo.size;

              return (
                <Box
                  key={sizeInfo.size}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                    border: "2px solid",
                    borderColor: isDefault ? "primary.main" : "divider",
                    borderRadius: 2,
                    bgcolor: isDefault ? "primary.50" : "background.paper",
                    minWidth: 160,
                    position: "relative",
                    transition: "all 0.2s ease",
                    opacity: isUploading ? 0.7 : 1,
                    "&:hover": {
                      borderColor: "primary.light",
                      boxShadow: 1,
                    },
                  }}
                >
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    style={{ display: "none" }}
                    ref={(el) => {
                      fileInputRefs.current[sizeInfo.size] = el;
                    }}
                    onChange={handleFileSelect(sizeInfo)}
                  />

                  {/* Size Label */}
                  <Typography
                    variant="caption"
                    fontWeight="medium"
                    sx={{ mb: 1 }}
                  >
                    {sizeInfo.shortLabel}
                  </Typography>

                  {/* Logo Preview or Upload Area */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      mb: 1,
                      overflow: "hidden",
                      cursor: isUploading ? "wait" : "pointer",
                      "&:hover": {
                        bgcolor: "grey.200",
                      },
                    }}
                    onClick={() =>
                      !isUploading &&
                      fileInputRefs.current[sizeInfo.size]?.click()
                    }
                  >
                    {isUploading ? (
                      <CircularProgress size={32} />
                    ) : existingLogo ? (
                      <img
                        src={existingLogo.url}
                        alt={sizeInfo.label}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Box sx={{ textAlign: "center" }}>
                        <CloudUpload sx={{ fontSize: 28, color: "grey.400" }} />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Upload
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {existingLogo && (
                      <>
                        <Tooltip
                          title={isDefault ? "Default logo" : "Set as default"}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleSetDefault(sizeInfo.size)}
                            color={isDefault ? "primary" : "default"}
                            disabled={isUploading}
                          >
                            {isDefault ? <Star /> : <StarBorder />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove logo">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveLogo(sizeInfo.size)}
                            disabled={isUploading}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Upload new logo">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          fileInputRefs.current[sizeInfo.size]?.click()
                        }
                        disabled={isUploading}
                      >
                        <CloudUpload fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Default Badge */}
                  {isDefault && (
                    <Chip
                      label="Default"
                      size="small"
                      color="primary"
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        fontSize: "0.65rem",
                        height: 20,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Favicon
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            gutterBottom
          >
            Upload a favicon (16x16 or 32x32 recommended) - Supports ICO, PNG,
            and SVG formats
          </Typography>
          <FileUpload
            label="Upload Favicon"
            accept="image/x-icon,image/png,image/svg+xml"
            onUpload={(urls) => {
              if (urls.length > 0) {
                setFieldValue("orgFavIcon", urls[0]);
              }
            }}
            currentFiles={values.orgFavIcon ? [values.orgFavIcon] : []}
            onRemove={() => setFieldValue("orgFavIcon", "")}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Login Background Images
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            gutterBottom
          >
            Upload multiple background images for the login page
          </Typography>
          <FileUpload
            label="Upload Background Images"
            accept="image/*"
            multiple={true}
            onUpload={(urls) => {
              const newImages = urls.map((url) => ({
                url,
                name: url.split("/").pop() || "Image",
              }));
              setFieldValue("loginBgImages", [
                ...(values.loginBgImages || []),
                ...newImages,
              ]);
            }}
            currentFiles={(values.loginBgImages || []).map((img) => img.url)}
            onRemove={(index) => {
              const newImages = [...(values.loginBgImages || [])];
              newImages.splice(index, 1);
              setFieldValue("loginBgImages", newImages);
            }}
          />
        </Grid>
      </Grid>
    </Fade>
  );
};

export default BrandingForm;
