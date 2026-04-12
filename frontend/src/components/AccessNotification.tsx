import { useState } from "react";
import { X, Shield } from "lucide-react";

interface AccessNotificationProps {
  qrImage: string; // 👈 base64 ou URL
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

const AccessNotification = ({
  qrImage,
  onApprove,
  onReject,
  onClose,
}: AccessNotificationProps) => {
  const [responded, setResponded] = useState<"approved" | "rejected" | null>(
    null,
  );

  const handleApprove = () => {
    setResponded("approved");
    setTimeout(onApprove, 1500);
  };

  const handleReject = () => {
    setResponded("rejected");
    setTimeout(onReject, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
      <div className="card-dental max-w-sm w-full mx-4 relative">
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          {/* icon */}
          <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
            <Shield className="w-7 h-7 text-accent-foreground" />
          </div>

          {/* title */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              QR Access Request
            </h3>
          </div>

          {/* QR DISPLAY */}
          <div className="bg-white p-3 rounded-xl shadow-md">
            <img
              src={qrImage}
              alt="QR Code"
              className="w-48 h-48 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessNotification;
