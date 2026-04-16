const DentalLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { icon: "w-10 h-10", text: "text-xl" },
    md: { icon: "w-14 h-14", text: "text-3xl" },
    lg: { icon: "w-16 h-16", text: "text-5xl" },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {/* Image logo */}
      <img
        src="/logo.png"
        alt="logo"
        className={`${s.icon} object-contain`}
      />

      {/* Nom de l'app */}
      <span className={`${s.text} font-bold text-foreground tracking-tight`}>
        Dental<span className="text-primary">Vault</span>
      </span>
    </div>
  );
};

export default DentalLogo;