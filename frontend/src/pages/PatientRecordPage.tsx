import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  Download,
  AlertTriangle,
  Stethoscope,
  FileImage,
  Shield,
  ArrowLeft,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AttachmentsGrid } from "../components/Attachmentssection ";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DentalLogo from "@/components/DentalLogo";
import ToothIcon from "@/components/ToothIcon";
import AccessNotification from "@/components/AccessNotification";
import { api } from "@/lib/api";
import socket from "../lib/socket";
import { toast } from "sonner";

const patient = {
  attachments: [
    { type: "xray", name: "Panoramic X-Ray", date: "2025-12-10" },
    { type: "image", name: "Intraoral Photo", date: "2025-09-22" },
    { type: "audio", name: "Voice Note – Dr. Alaoui", date: "2025-09-22" },
  ],
};
interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  cin: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;

  qrImage: string;
}
interface Treatments {
  date: string;
  name: string;
  description: string;
}
interface MedicalRecord {
  patientId: string;
  allergies: string[];
  chronicDiseases: string[];
  treatments: Treatments[];
}
interface Consultation {
  date: string;
  doctor: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
}
interface QrImage {
  qrImage: string;
}
interface PatientRecord {
  patient: Patient | null;
  qrImage: QrImage | null;
  medicalRecord: MedicalRecord | null;
  consultations: Consultation[] | null;
}
const PatientRecordPage = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);
  useEffect(() => {
    socket.on("qrScanned", (data) => {
      console.log("QR Scanned:", data);
      toast.error(`${data.firstName} is requesting access to your records !`, {
        style: {
          background: "#ef4444", // rouge (tailwind red-500)
          color: "white",
          border: "none",
        },
      });
    });

    return () => {
      socket.off("qrScanned"); // cleanup important
    };
  }, []);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const storedPatient = JSON.parse(localStorage.getItem("patient") || "{}");
  const patientId = storedPatient._id;
  const [data, setData] = useState<PatientRecord>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await api.get(`/medicalRecord/${patientId}`);
        console.log(res.data);
        setData(res.data);
      } catch (err: any) {
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) fetchRecord();
  }, [patientId]);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const handleDownloadQR = () => {
    if (!data.qrImage?.qrImage) return;

    const link = document.createElement("a");
    link.href = data.qrImage.qrImage;
    link.download = "qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (loading) return <Loader2 className="w-4 h-4" />;

  if (error)
    return (
      <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-4 py-3 mt-4 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
      </div>
    );
  return (
    <div className="min-h-screen bg-background">
      {showNotification && (
        <AccessNotification
          qrImage={data.qrImage.qrImage}
          onApprove={() => {
            setShowNotification(false);
            navigate("/doctor-record");
          }}
          onReject={() => setShowNotification(false)}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <DentalLogo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setShowNotification(true)}
            >
              <QrCode className="w-4 h-4 mr-1" /> Simuler un scan QR
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Patient header */}
        <div className="card-dental flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-dental flex items-center justify-center">
              <ToothIcon className="w-7 h-7" color="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {data.patient.firstName} {data.patient.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">
                CIN: {data.patient.cin} · DOB:{" "}
                {data.patient.dateOfBirth.split("T")[0]}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleDownloadQR}
            >
              <Download className="w-4 h-4 mr-1" /> QR Code
            </Button>
          </div>
        </div>

        {/* Security banner */}
        <div
          className="flex items-center gap-3 bg-accent rounded-2xl px-5 py-3 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <Shield className="w-5 h-5 text-accent-foreground shrink-0" />
          <p className="text-sm text-accent-foreground font-medium">
            Vos données sont sécurisées et contrôlées par vous. Seuls les
            dentistes approuvés peuvent consulter vos dossiers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Section
            title="Informations personnelles"
            icon={<Stethoscope className="w-4 h-4" />}
            delay="0.15s"
          >
            <InfoRow label="Email" value={data.patient.email} />
            <InfoRow label="Téléphone" value={data.patient.phoneNumber} />
            <InfoRow
              label="Date de naissance"
              value={data.patient.dateOfBirth.split("T")[0]}
            />
          </Section>

          {/* Allergies & Diseases */}
          <div className="space-y-6">
            <Section
              title="Allergies"
              icon={<AlertTriangle className="w-4 h-4" />}
              delay="0.2s"
            >
              <div className="flex flex-wrap gap-2">
                {data?.medicalRecord?.allergies?.length ? (
                  data.medicalRecord.allergies.map((a) => (
                    <Badge
                      key={a}
                      variant="destructive"
                      className="rounded-lg px-3 py-1"
                    >
                      {a}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucune allergie connue.
                  </p>
                )}
              </div>
            </Section>
            <Section
              title="Maladies chroniques"
              icon={<AlertCircle className="w-4 h-4" />}
              delay="0.25s"
            >
              <div className="flex flex-wrap gap-2">
                {data?.medicalRecord?.chronicDiseases?.length ? (
                  data.medicalRecord.chronicDiseases.map((d) => (
                    <Badge
                      key={d}
                      variant="secondary"
                      className="rounded-lg px-3 py-1 bg-warning/10 text-warning border-warning/20"
                    >
                      {d}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucune maladie chronique.
                  </p>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* Timeline */}
        <Section
          title="Historique des consultations"
          icon={<Clock className="w-4 h-4" />}
          delay="0.3s"
        >
          <div className="space-y-0">
            {data?.medicalRecord?.treatments?.length ? (
              data.medicalRecord.treatments.map((c, i) => (
                <div key={i} className="relative pl-8 pb-6 last:pb-0">
                  <div className="absolute left-[11px] top-2 w-0.5 h-full bg-border last:hidden" />
                  <div className="absolute left-1 top-2 w-[14px] h-[14px] rounded-full border-2 border-primary bg-card" />

                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {c?.date ? c.date.split("T")[0] : "Unknown date"}
                      </span>

                      <span className="text-xs text-primary font-medium">
                        {c?.name ?? "Untitled"}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      Traitements: {c?.description ?? "No description"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun traitements disponible.
              </p>
            )}
          </div>
        </Section>

       
      </main>
    </div>
  );
};

const Section = ({
  title,
  icon,
  children,
  delay = "0s",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: string;
}) => (
  <div
    className="card-dental animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center gap-2 mb-4">
      <div className="text-primary">{icon}</div>
      <h2 className="font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default PatientRecordPage;
