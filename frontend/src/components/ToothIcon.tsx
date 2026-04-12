const ToothIcon = ({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C9.5 2 7.5 3 6.5 5C5.5 7 5 9 5.5 11C6 13 6.5 15 7 17C7.5 19 8 21 9.5 21C11 21 11 19 12 19C13 19 13 21 14.5 21C16 21 16.5 19 17 17C17.5 15 18 13 18.5 11C19 9 18.5 7 17.5 5C16.5 3 14.5 2 12 2Z"
      fill={color}
      opacity="0.2"
    />
    <path
      d="M12 2C9.5 2 7.5 3 6.5 5C5.5 7 5 9 5.5 11C6 13 6.5 15 7 17C7.5 19 8 21 9.5 21C11 21 11 19 12 19C13 19 13 21 14.5 21C16 21 16.5 19 17 17C17.5 15 18 13 18.5 11C19 9 18.5 7 17.5 5C16.5 3 14.5 2 12 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ToothIcon;