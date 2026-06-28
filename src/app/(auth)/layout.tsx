const AUTH_BACKGROUND_IMAGE = '/images/Apollo-Hospital.webp';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url('${AUTH_BACKGROUND_IMAGE}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-blue-800/65 to-indigo-900/75" />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  );
}
