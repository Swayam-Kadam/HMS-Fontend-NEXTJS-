const conf = {
  APIUrl: String(process.env.NEXT_PUBLIC_API_URL),
  cookiePath: String(process.env.NEXT_PUBLIC_COOKIE_PATH),
  cookieDomain: String(process.env.NEXT_PUBLIC_COOKIE_DOMAIN),
  cookieExpires: String(process.env.NEXT_PUBLIC_COOKIE_EXPIRES),
  redirectUrl: String(process.env.NEXT_PUBLIC_REDIRECT_URL),
  razorpayKey: String(process.env.NEXT_PUBLIC_RAZORPAY_KEY),
  stripePublishableKey: String(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
};

export default conf;