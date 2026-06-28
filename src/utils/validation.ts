import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),

  password: Yup.string()
    .min(5, "Minimum 5 characters")
    .required("Password is required"),
});

export const signupSchema = Yup.object({
  name: Yup.string().required("Name is required"),

  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export const addDoctorSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),

  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),

  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),

  nic: Yup.string()
    .matches(/^[0-9]{8}$/, "NIC must be exactly 8 digits")
    .required("NIC is required"),

  dob: Yup.string().required("Date of birth is required"),

  gender: Yup.string().required("Please select gender"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  department: Yup.string().required("Please select a department"),
});
