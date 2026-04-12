import ToothIcon from "./ToothIcon";

const DentalLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-lg" },
    md: { icon: "w-8 h-8", text: "text-2xl" },
    lg: { icon: "w-12 h-12", text: "text-4xl" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      
      <span className={`${s.text} font-bold text-foreground tracking-tight`}>
        Dent<span className="text-primary">Care</span>
      </span>
    </div>
  );
};

export default DentalLogo;