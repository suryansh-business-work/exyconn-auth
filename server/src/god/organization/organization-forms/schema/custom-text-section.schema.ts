import { Schema } from "mongoose";

export const CustomTextSectionSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    text: { type: String, default: "" },
    type: {
      type: String,
      required: true,
      enum: ["heading", "paragraph"],
    },
    variant: {
      type: String,
      enum: ["h1", "h2", "h3", "h4", "h5", "h6", "body1", "body2"],
    },
  },
  { _id: false },
);

export const customTextSectionsDefault = [
  {
    name: "Title",
    slug: "title",
    text: "Welcome to Our Platform",
    type: "heading",
    variant: "h1",
  },
  {
    name: "Description",
    slug: "description",
    text: "Sign in to access your account and explore our services",
    type: "paragraph",
    variant: "body1",
  },
  {
    name: "Slogan",
    slug: "slogan",
    text: "Your Journey Starts Here",
    type: "heading",
    variant: "h3",
  },
];
