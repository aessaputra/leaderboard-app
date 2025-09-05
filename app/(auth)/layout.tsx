export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh grid place-items-center p-6 bg-gradient-to-b from-black to-neutral-900">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
