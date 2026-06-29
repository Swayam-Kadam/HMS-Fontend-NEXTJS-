"use client";

import React, { useState } from "react";
import { Field, ErrorMessage, type FieldProps } from "formik";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  name: string;
  type: string;
  placeholder: string;
  min?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput = ({ name, type, placeholder, min, onChange }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <div className="relative">
        <Field name={name}>
          {({ field }: FieldProps) => (
            <input
              {...field}
              type={inputType}
              placeholder={placeholder}
              min={min}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e);
              }}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isPassword ? "pr-11" : ""
              }`}
            />
          )}
        </Field>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      <p className="text-red-500 text-sm mt-1 h-3">
        <ErrorMessage name={name} />
      </p>
    </div>
  );
};

export default FormInput;
