const ToothIcon = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-16 h-16",
  };

  return (
    <img
      src="/user.png"
      alt="user avatar"
      className={`${sizes[size]} object-cover rounded-full`}
    />
  );
};

export default ToothIcon;