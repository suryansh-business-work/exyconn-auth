import React from "react";
import { useFormikContext, Field, FieldProps } from "formik";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Fade,
} from "@mui/material";
import { Receipt } from "@mui/icons-material";
import { OrganizationFormData } from "./types";

const TaxForm: React.FC = () => {
  useFormikContext<OrganizationFormData>();

  return (
    <Fade in timeout={300}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Receipt color="primary" />
            <Typography variant="h6">Tax Information</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tax registration and compliance details
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgTaxType">
            {({ field }: FieldProps) => (
              <FormControl fullWidth>
                <InputLabel>Tax Type</InputLabel>
                <Select {...field} label="Tax Type">
                  <MenuItem value="GST">GST (Goods and Services Tax)</MenuItem>
                  <MenuItem value="CIN">
                    CIN (Corporate Identity Number)
                  </MenuItem>
                  <MenuItem value="PAN">
                    PAN (Permanent Account Number)
                  </MenuItem>
                  <MenuItem value="VAT">VAT (Value Added Tax)</MenuItem>
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
            Type of tax registration applicable
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field name="orgTaxNumber">
            {({ field, meta }: FieldProps<string>) => (
              <TextField
                {...field}
                fullWidth
                label="Tax Number"
                error={meta.touched && Boolean(meta.error)}
                helperText={
                  meta.touched && meta.error
                    ? meta.error
                    : "Official tax identification number"
                }
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default TaxForm;
