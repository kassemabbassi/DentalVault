import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Save,
  Stethoscope,
  AlertTriangle,
  Heart,
  FileImage,
  Clock,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AttachmentsGrid } from "../components/Attachmentssection ";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DentalLogo from "@/components/DentalLogo";
import ToothIcon from "@/components/ToothIcon";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";

const patient = {
  name: "Ahmed Benali",
  cin: "AB123456",
  dob: "1990-05-15",
  email: "ahmed@email.com",
  phone: "+212 612 345 678",
  allergies: ["Penicillin", "Latex"],
  chronicDiseases: ["Diabetes Type 2"],
  consultations: [
    {
      date: "2025-12-10",
      doctor: "Dr. Salma Idrissi",
      diagnosis: "Dental caries (upper right molar)",
      treatment: "Composite filling",
      notes: "Patient advised to reduce sugar intake",
    },
    {
      date: "2025-09-22",
      doctor: "Dr. Karim Alaoui",
      diagnosis: "Gingivitis (mild)",
      treatment: "Deep cleaning + chlorhexidine rinse",
      notes: "Follow-up in 3 months",
    },
  ],
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
  _id: string;
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

const DoctorRecordPage = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { token } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add-consultation" | "create-record"
  >("add-consultation");
  const [data, setData] = useState<PatientRecord>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newConsultation, setNewConsultation] = useState({
    name: "",
    description: "",
    date: "",
  });
  const [newRecord, setNewRecord] = useState({
    allergies: "",
    chronicDiseases: "",
  });

  const handleSubmit = async () => {
    setError("");
    if (
      !newConsultation.name ||
      !newConsultation.description ||
      !newConsultation.date
    ) {
      setError("Please fill in all fields");
      return;
    }
    if (!data?.medicalRecord?._id) {
      setError(
        "Aucun dossier médical disponible pour ajouter une consultation.",
      );
      return;
    }
    const treatment = {
      name: newConsultation.name,
      description: newConsultation.description,
      date: newConsultation.date,
    };
    try {
      const newtreatment = await api.post(
        `/medicalRecord/addTreatment/${data.medicalRecord._id}`,
        treatment,
      );
      const res = await api.get(`/medicalRecord/doctor/${token}`);
      setData(res.data);
      setShowModal(false);
      setNewConsultation({ name: "", description: "", date: "" });
    } catch (error) {
      setError("Failed to add treatment");
      console.log(error);
    }
  };

  const handleCreateMedicalRecord = async () => {
    setError("");
    if (!newRecord.allergies && !newRecord.chronicDiseases) {
      setError(
        "Merci de renseigner au moins une allergie ou une maladie chronique.",
      );
      return;
    }

    const allergies = newRecord.allergies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const chronicDiseases = newRecord.chronicDiseases
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await api.post(`/medicalRecord/${data.patient._id}`, {
        allergies,
        chronicDiseases,
        treatments: [],
      });
      const res = await api.get(`/medicalRecord/doctor/${token}`);
      setData(res.data);
      setShowModal(false);
      setNewRecord({ allergies: "", chronicDiseases: "" });
    } catch (error) {
      setError("Échec de la création du dossier médical.");
      console.log(error);
    }
  };
  const fetchRecord = async () => {
    try {
      const res = await api.get(`/medicalRecord/doctor/${token}`);
      console.log(res.data);
      setData(res.data);
    } catch (err: any) {
      setError("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token) fetchRecord();
  }, [token]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-4 py-3 mt-4 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
      </div>
    );
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            <DentalLogo  />
          </div>
          <Badge className="bg-success/10 text-success border-success/20 rounded-lg px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Mode accès médecin.
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Patient header */}
        <div className="card-dental flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl  flex items-center justify-center">
              <ToothIcon size="md" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {data.patient.firstName} {data.patient.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">
                CIN: {data.patient.cin} · DDN:{" "}
                {data.patient.dateOfBirth.split("T")[0]}
              </p>
            </div>
          </div>
          <Button
            className="bg-success hover:bg-success/90 text-success-foreground rounded-xl"
            onClick={() => {
              setModalMode(
                data?.medicalRecord ? "add-consultation" : "create-record",
              );
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {data?.medicalRecord
              ? "Ajouter une consultation"
              : "Créer dossier médical"}
          </Button>
        </div>

        {!data?.medicalRecord ? (
          <div className="rounded-3xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-foreground">
            Aucun dossier médical trouvé pour ce patient. Cliquez sur "Créer
            dossier médical" pour ajouter les allergies et les maladies
            chroniques, puis vous pourrez créer des consultations.
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-6">
          <Section
            title="Informations personnelles."
            icon={<Stethoscope className="w-4 h-4" />}
          >
            <InfoRow label="Email" value={data.patient.email} />
            <InfoRow label="Téléphone" value={data.patient.phoneNumber} />
            <InfoRow
              label="Date de naissance"
              value={data.patient.dateOfBirth.split("T")[0]}
            />
          </Section>

          <div className="space-y-6">
            <Section
              title="Allergies"
              icon={<AlertTriangle className="w-4 h-4" />}
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

        {/* Attachments */}
        <Section
          title="Pièces jointes"
          icon={<FileImage className="w-4 h-4" />}
        >
          <AttachmentsGrid
            attachments={patient.attachments}
            lightboxIndex={lightboxIndex}
            setLightboxIndex={setLightboxIndex}
          />
        </Section>
      </main>

      {/* Add Consultation or Create Medical Record Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-success" />
              {modalMode === "create-record"
                ? "Créer un dossier médical"
                : "Ajouter une nouvelle consultation"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {modalMode === "create-record" ? (
              <>
                <div className="space-y-1.5">
                  <Label>Allergies</Label>
                  <Input
                    placeholder="ex: Pollen, Arachides"
                    className="rounded-xl"
                    value={newRecord.allergies}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, allergies: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Séparez les valeurs avec des virgules.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Maladies chroniques</Label>
                  <Input
                    placeholder="ex: Diabète, Hypertension"
                    className="rounded-xl"
                    value={newRecord.chronicDiseases}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        chronicDiseases: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Séparez les valeurs avec des virgules.
                  </p>
                </div>
                <Button
                  className="w-full bg-success hover:bg-success/90 text-success-foreground rounded-xl py-5"
                  onClick={handleCreateMedicalRecord}
                >
                  <Save className="w-4 h-4 mr-2" /> Créer le dossier médical
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Diagnostic.</Label>
                  <Input
                    placeholder="e.g. Dr Ben Hassan"
                    className="rounded-xl"
                    value={newConsultation.name}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Traitements</Label>
                  <Input
                    placeholder="e.g. Composite filling for upper right molar"
                    className="rounded-xl"
                    value={newConsultation.description}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <input
                    type="date"
                    placeholder="Additional notes..."
                    className="rounded-xl resize-none"
                    value={newConsultation.date}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  className="w-full bg-success hover:bg-success/90 text-success-foreground rounded-xl py-5"
                  onClick={handleSubmit}
                >
                  <Save className="w-4 h-4 mr-2" /> Enregistrer la consultation
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="card-dental animate-fade-in">
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

export default DoctorRecordPage;
