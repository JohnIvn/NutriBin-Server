//Page Wrapper Component
export default function PageWrapper({ children }) {
  return (
    <main className="min-h-screen w-full flex justify-center">
      <div className="w-full max-w-[1400px] px-10">{children}</div>
    </main>
  );
}
