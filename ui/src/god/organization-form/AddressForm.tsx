import React from "react";
import { useFormikContext, Field, FieldProps } from "formik";
import {
  Grid,
  TextField,
  Autocomplete,
  Typography,
  Box,
  Fade,
  InputAdornment,
} from "@mui/material";
import { LocationOn, Search } from "@mui/icons-material";
import { OrganizationFormData } from "./types";
import { countries } from "./countries";

const AddressForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();

  // Find the country object that matches the stored country name
  const selectedCountry =
    countries.find((country) => country.name === values.orgAddress?.country) ||
    null;

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocationOn color="primary" />
            <Typography variant="h6">Address Information</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Physical location details of your organization
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Field name="orgAddress.addressLine1">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="Address Line 1"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Street address, P.O. box, company name, etc."
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="orgAddress.addressLine2">
            {({ field }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="Address Line 2"
                helperText="Apartment, suite, unit, building, floor, etc. (optional)"
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgAddress.city">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="City"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error ? meta.error : "City or town name"
                }
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgAddress.state">
            {({ field }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="State / Province"
                helperText="State, province, or region"
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={countries}
            value={selectedCountry}
            getOptionLabel={(option) => `${option.flag} ${option.name}`}
            isOptionEqualToValue={(option, value) => option.name === value.name}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Typography sx={{ mr: 1, fontSize: "1.2rem" }}>
                  {option.flag}
                </Typography>
                <Typography variant="body2">{option.name}</Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                placeholder="Search country..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                helperText="Select your country"
              />
            )}
            onChange={(_, value) => {
              setFieldValue("orgAddress.country", value?.name || "");
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgAddress.zipCode">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="ZIP / Postal Code"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error ? meta.error : "Postal or ZIP code"
                }
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default AddressForm;
