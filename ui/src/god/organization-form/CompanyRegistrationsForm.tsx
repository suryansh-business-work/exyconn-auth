import React from "react";
import { useFormikContext, Field, FieldProps } from "formik";
import { Grid, TextField, Typography, Box, Fade } from "@mui/material";
import { Description } from "@mui/icons-material";
import { OrganizationFormData } from "./types";

const CompanyRegistrationsForm: React.FC = () => {
  useFormikContext<OrganizationFormData>();

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Description color="primary" />
            <Typography variant="h6">Company Registration</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Official registration details and identifiers
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgRegistrationNumber">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="Registration Number"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Official company registration number (CIN, incorporation number, etc.)"
                }
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default CompanyRegistrationsForm;
