"use client";

import { Suspense } from "react";
import { Formik, Form } from "formik";
import { loginSchema } from "@/utils/validation";
import FormInput from "@/components/ui/FormInput";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { loginRequest } from "@/utils/auth";
import { getDefaultRedirect } from "@/conf/routes.config";
import type { UserRole } from "@/conf/routes.config";
import { motion, AnimatePresence } from "framer-motion";

interface LoginValues {
  email: string;
  password: string;
}

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialValues: LoginValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (
    values: LoginValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const { role } = await loginRequest(values.email, values.password);
      toast.success("Login Successfully");
      resetForm();

      const redirect = searchParams.get("redirect");
      const destination =
        redirect && redirect.startsWith("/")
          ? redirect
          : getDefaultRedirect(role as UserRole);

      router.push(destination);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  const formVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        delay: 0.2
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10
      }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const linkVariants = {
    rest: { color: "#2563EB" },
    hover: { 
      color: "#1D4ED8",
      scale: 1.05,
      transition: {
        type: "spring" as const,
        stiffness: 300
      }
    }
  };

  const loadingDotsVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 0, -5],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }
    }
  };

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="login-form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md px-4"
          >
            <motion.div 
              variants={formVariants}
              whileHover="hover"
              className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                Welcome Back
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-center text-gray-500 mb-8"
              >
                Please login to your account
              </motion.p>

              <Formik
                initialValues={initialValues}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <motion.div variants={itemVariants}>
                      <FormInput
                        name="email"
                        type="email"
                        placeholder="Email"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormInput
                        name="password"
                        type="password"
                        placeholder="Password"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden cursor-pointer"
                      >
                        {isSubmitting ? (
                          <motion.div 
                            variants={loadingDotsVariants}
                            initial="initial"
                            animate="animate"
                            className="flex items-center justify-center space-x-2"
                          >
                            <motion.span 
                              variants={dotVariants}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                            <motion.span 
                              variants={dotVariants}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                            <motion.span 
                              variants={dotVariants}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          </motion.div>
                        ) : (
                          "Login"
                        )}
                      </motion.button>
                    </motion.div>
                  </Form>
                )}
              </Formik>


              <motion.p 
                variants={itemVariants}
                className="text-center mt-6 text-sm text-gray-600"
              >
                Don't have an account?{" "}
                <motion.span
                  variants={linkVariants}
                  initial="rest"
                  whileHover="hover"
                  className="inline-block"
                >
                  <Link
                    href="/signup"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sign Up
                  </Link>
                </motion.span>
              </motion.p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
};

const LoginPage = () => (
  <Suspense
    fallback={
      <div className="w-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }
  >
    <LoginForm />
  </Suspense>
);

export default LoginPage;