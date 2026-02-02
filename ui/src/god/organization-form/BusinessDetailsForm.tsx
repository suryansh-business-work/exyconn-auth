import React from "react";
import { useFormikContext, Field, FieldProps } from "formik";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Fade,
} from "@mui/material";
import { BusinessCenter } from "@mui/icons-material";
import { OrganizationFormData } from "./types";

const BusinessDetailsForm: React.FC = () => {
  useFormikContext<OrganizationFormData>();

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <BusinessCenter color="primary" />
            <Typography variant="h6">Business Details</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Information about your business operations and structure
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgBusinessType">
            {({ field }: FieldProps) => (
              <FormControl fullWidth>
                <InputLabel>Business Type</InputLabel>
                <Select {...field} label="Business Type">
                  <MenuItem value="Product">Product</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                </Select>
              </FormControl>
            )}
          </Field>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Type of business your organization operates
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="ownershipType">
            {({ field }: FieldProps) => (
              <FormControl fullWidth>
                <InputLabel>Ownership Type</InputLabel>
                <Select {...field} label="Ownership Type">
                  <MenuItem value="Private">Private</MenuItem>
                  <MenuItem value="Government">Government</MenuItem>
                  <MenuItem value="LLP">LLP</MenuItem>
                  <MenuItem value="Partnership">Partnership</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            )}
          </Field>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Legal structure of your organization
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgScaleType">
            {({ field }: FieldProps) => (
              <FormControl fullWidth>
                <InputLabel>Scale Type</InputLabel>
                <Select {...field} label="Scale Type">
                  <MenuItem value="National">National</MenuItem>
                  <MenuItem value="Multinational">Multinational</MenuItem>
                </Select>
              </FormControl>
            )}
          </Field>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Geographic scope of operations
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="numberOfEmployees">
            {({ field, form }: FieldProps) => (
              <FormControl fullWidth>
                <InputLabel>Number of Employees</InputLabel>
                <Select
                  {...field}
                  label="Number of Employees"
                  onChange={(e) => {
                    form.setFieldValue("numberOfEmployees", e.target.value);
                  }}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={5}>2-10</MenuItem>
                  <MenuItem value={25}>11-50</MenuItem>
                  <MenuItem value={100}>51-200</MenuItem>
                  <MenuItem value={500}>201-1000</MenuItem>
                  <MenuItem value={2000}>1001-5000</MenuItem>
                  <MenuItem value={10000}>5001+</MenuItem>
                </Select>
              </FormControl>
            )}
          </Field>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Approximate employee count range
          </Typography>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default BusinessDetailsForm;
