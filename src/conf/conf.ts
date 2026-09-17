const conf = {
  APIUrl: String(process.env.NEXT_PUBLIC_API_URL),
  cookiePath: String(process.env.NEXT_PUBLIC_COOKIE_PATH),
  cookieDomain: String(process.env.NEXT_PUBLIC_COOKIE_DOMAIN),
  cookieExpires: String(process.env.NEXT_PUBLIC_COOKIE_EXPIRES),
  redirectUrl: String(process.env.NEXT_PUBLIC_REDIRECT_URL),
  stripePublishableKey: String(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  socketUrl: String(
    process.env.NEXT_PUBLIC_SOCKET_URL ||
      (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '') ||
      'http://localhost:3001'
  ),
  payloadEncryption:
    String(process.env.NEXT_PUBLIC_PAYLOAD_ENCRYPTION || '').toLowerCase() === 'true',
  payloadEncryptionKey: String(process.env.NEXT_PUBLIC_PAYLOAD_ENCRYPTION_KEY || ''),
};

export default conf;