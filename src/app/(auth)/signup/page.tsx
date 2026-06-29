"use client";

import { Formik, Form, type FormikHelpers } from "formik";
import { signupSchema } from "@/utils/validation";
import FormInput from "@/components/ui/FormInput";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { toast, ToastContainer } from "react-toastify";
import { signup } from "@/store/slices/authSlice";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";

interface SignupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: 50,
    transition: {
      duration: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const formVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0, rotateX: -15 },
  visible: {
    scale: 1,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: 0.2,
    },
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: { scale: 0.95 },
};

const linkVariants: Variants = {
  rest: { color: "#2563EB" },
  hover: {
    color: "#1D4ED8",
    scale: 1.05,
    x: 5,
    transition: {
      type: "spring",
      stiffness: 300,
    },
  },
};

const loadingSpinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

const successCheckVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const passwordStrengthVariants: Variants = {
  weak: { scaleX: 0.25, backgroundColor: "#ef4444" },
  medium: { scaleX: 0.5, backgroundColor: "#f59e0b" },
  strong: { scaleX: 0.75, backgroundColor: "#10b981" },
  veryStrong: { scaleX: 1, backgroundColor: "#059669" },
};

const SignupPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const initialValues: SignupValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (
    values: SignupValues,
    { resetForm }: FormikHelpers<SignupValues>
  ) => {
    const payload = {
      name: values.name,
      email: values.email,
      password: values.password,
      cpassword: values.confirmPassword,
    };

    try {
      const res = await dispatch(signup(payload)).unwrap();
      if (res.status === 200 || res.status === 201) {
        toast.success("Account created successfully! Please login.");
        resetForm();
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch {
      // Error toast is handled in the auth thunk.
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
            key="signup-form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md relative z-10 px-4"
          >
            <motion.div 
              variants={formVariants}
              whileHover="hover"
              className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20"
            >
              <motion.div variants={itemVariants} className="text-center mb-8">
                <motion.h1 
                  className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                >
                  Create Account
                </motion.h1>
                <motion.p 
                  variants={itemVariants}
                  className="text-gray-500 mt-2"
                >
                  Join us today! Fill in your details
                </motion.p>
              </motion.div>

              <Formik
                initialValues={initialValues}
                validationSchema={signupSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, values, errors, touched }) => (
                  <Form>
                    <motion.div variants={itemVariants}>
                      <FormInput
                        name="name"
                        type="text"
                        placeholder="Full Name"
                      />
                    </motion.div>

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
                      
                      {/* Password strength indicator */}
                      {values.password && !errors.password && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2"
                        >
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full"
                              variants={passwordStrengthVariants}
                              animate={
                                values.password.length < 6 ? "weak" :
                                values.password.length < 8 ? "medium" :
                                values.password.length < 12 ? "strong" : "veryStrong"
                              }
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Password strength: {
                              values.password.length < 6 ? "Weak" :
                              values.password.length < 8 ? "Medium" :
                              values.password.length < 12 ? "Strong" : "Very Strong"
                            }
                          </p>
                        </motion.div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormInput
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                      />
                      
                      {/* Password match indicator */}
                      {values.confirmPassword && values.password && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-2 flex items-center space-x-2"
                        >
                          {values.password === values.confirmPassword ? (
                            <>
                              <motion.svg 
                                className="w-4 h-4 text-green-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                              >
                                <motion.path
                                  variants={successCheckVariants}
                                  initial="hidden"
                                  animate="visible"
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </motion.svg>
                              <span className="text-xs text-green-500">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <motion.svg 
                                className="w-4 h-4 text-red-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </motion.svg>
                              <span className="text-xs text-red-500">Passwords don't match</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-6">
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
                            className="flex items-center justify-center space-x-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              variants={loadingSpinnerVariants}
                              animate="animate"
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>Creating Account...</span>
                          </motion.div>
                        ) : (
                          "Create Account"
                        )}
                      </motion.button>
                    </motion.div>

                    <motion.p 
                      variants={itemVariants}
                      className="text-center mt-6 text-sm text-gray-600"
                    >
                      Already have an account?{" "}
                      <motion.span
                        variants={linkVariants}
                        initial="rest"
                        whileHover="hover"
                        className="inline-block"
                      >
                        <Link
                          href="/login"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Login
                        </Link>
                      </motion.span>
                    </motion.p>

                    <motion.p 
                      variants={itemVariants}
                      className="text-center mt-4 text-xs text-gray-400"
                    >
                      By signing up, you agree to our{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </motion.p>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default SignupPage;