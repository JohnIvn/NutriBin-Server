//Page Header Component
export default function PageHeader({ title, icon }) {
  return (
    <header className="pt-12 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 text-black flex items-center justify-center">
          {icon}
        </div>

        <h1 className="text-4xl lg:text-5xl font-extrabold text-black">
          {title}
        </h1>
      </div>
    </header>
  );
}
