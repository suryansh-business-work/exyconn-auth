import React from "react";
import { useFormikContext, Field, FieldProps } from "formik";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Fade,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import { Phone, Search } from "@mui/icons-material";
import { OrganizationFormData } from "./types";
import { countries } from "./countries";

const ContactForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<OrganizationFormData>();

  // Find the country object that matches the stored countryCode
  const selectedCountry =
    countries.find(
      (country) => country.dialCode === values.orgPhone?.countryCode,
    ) || null;

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Phone color="primary" />
            <Typography variant="h6">Contact Information</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Phone details for reaching your organization
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Autocomplete
            options={countries}
            value={selectedCountry}
            getOptionLabel={(option) =>
              `${option.flag} ${option.dialCode} ${option.name}`
            }
            isOptionEqualToValue={(option, value) =>
              option.dialCode === value.dialCode
            }
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Typography sx={{ mr: 1, fontSize: "1.2rem" }}>
                  {option.flag}
                </Typography>
                <Typography variant="body2" sx={{ mr: 1, fontWeight: "bold" }}>
                  {option.dialCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.name}
                </Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country Code"
                placeholder="Search country..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                helperText="Select country dialing code"
              />
            )}
            onChange={(_, value) => {
              setFieldValue("orgPhone.countryCode", value?.dialCode || "");
            }}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Field name="orgPhone.phoneNumber">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="Phone Number"
                placeholder="1234567890"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Enter phone number without country code or special characters"
                }
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default ContactForm;
