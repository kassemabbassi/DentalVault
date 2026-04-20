import { useState } from "react";
import { Upload, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface Props {
  medicalRecordId: string;
  patientId: string;
  onSuccess: () => void;
}

const UploadAttachment = ({ medicalRecordId, patientId, onSuccess }: Props) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");   
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 5MB)");
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return setError("Veuillez sélectionner un fichier");
    if (!customName.trim()) return setError("Veuillez donner un nom au fichier");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("medicalRecordId", medicalRecordId);
    formData.append("patientId", patientId);
    formData.append("customName", customName.trim());

    try {
      setLoading(true);
      await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setCustomName("");
      setOpen(false);
      setError("");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Échec de l'upload");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setCustomName("");
    setError("");
  };

  return (
    <>
      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setOpen(true)}>
        <Upload className="w-4 h-4 mr-1" /> Ajouter un fichier
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Ajouter une pièce jointe
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Nom personnalisé */}
            <div className="space-y-1.5">
              <Label>Nom du fichier</Label>
              <Input
                placeholder="ex: Radio panoramique janvier 2025"
                className="rounded-xl"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            {/* Fichier */}
            <div className="space-y-1.5">
              <Label>Fichier (image, radio, audio)</Label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/wav"
                onChange={handleFileChange}
                className="w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:text-sm file:bg-muted file:text-foreground cursor-pointer"
              />
              {file && (
                <p className="text-xs text-muted-foreground">
                  {file.name} · {(file.size / 1024).toFixed(0)} KB
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handleClose} disabled={loading}>
                <X className="w-4 h-4 mr-1" /> Annuler
              </Button>
              <Button
                className="flex-1 rounded-xl bg-success hover:bg-success/90 text-success-foreground"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                {loading ? "Upload..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadAttachment;