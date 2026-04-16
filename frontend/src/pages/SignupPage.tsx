import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  CreditCard,
  CheckCircle,
  QrCode,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DentalLogo from "@/components/DentalLogo";
import { api } from "@/lib/api";

interface FormField {
  name: string;
  label: string;
  type: string;
  icon: React.ElementType;
  placeholder: string;
}

const fields: FormField[] = [
  {
    name: "firstName",
    label: "Prénom",
    type: "text",
    icon: User,
    placeholder: "John",
  },
  {
    name: "lastName",
    label: "Nom",
    type: "text",
    icon: User,
    placeholder: "Doe",
  },
  {
    name: "cin",
    label: "CIN (Identité nationale)",
    type: "text",
    icon: CreditCard,
    placeholder: "AB123456",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    icon: Mail,
    placeholder: "john@example.com",
  },
  {
    name: "phoneNumber",
    label: "Numéro de téléphone",
    type: "tel",
    icon: Phone,
    placeholder: "+216 98 000 000",
  },
  {
    name: "dateOfBirth",
    label: "Date de naissance",
    type: "date",
    icon: Calendar,
    placeholder: "",
  },
  {
    name: "password",
    label: "Mot de passe  ",
    type: "password",
    icon: Lock,
    placeholder: "••••••••",
  },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (!form[f.name]?.trim()) errs[f.name] = `${f.label} est obligatoire`;
    });
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Email invalide";
    if (form.password && form.password.length < 6)
      errs.password = "Min 6 caractères";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const sendReq = async () => {
    try {
      const res = await api.post("/register", form);
       // 🔐 1. récupérer token
      const token = res.data.token;

      // 💾 2. stocker dans localStorage
      localStorage.setItem("token", token);

      // (optionnel mais recommandé)
      localStorage.setItem("patient", JSON.stringify(res.data.patient));

      setSuccess(true);
      setErrors({});

      console.log("User created:", res.data);

      
    } catch (error: any) {
      setSuccess(false);

      // gestion backend errors
      if (error.response) {
        // erreur renvoyée par ton backend
        setErrors({
          api: error.response.data.message || "Registration failed",
        });
      } else if (error.request) {
        // backend down ou pas de réponse
        setErrors({
          api: "Server not responding. Try again later.",
        });
      } else {
        // erreur front
        setErrors({
          api: "Unexpected error occurred",
        });
      }

      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await sendReq();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="card-dental max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Compte créé !
          </h2>
          <p className="text-muted-foreground">
            Votre dossier dentaire a été initialisé. 
             Voici votre code QR personnel pour partager l'accès.
          </p>
          <div className="w-40 h-40 mx-auto bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
            <QrCode className="w-20 h-20 text-primary" />
          </div>
          <Button
            className="w-full rounded-xl"
            onClick={() => navigate("/patient-record")}
          >
            Afficher mon dossier
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-6">
      <div className="mb-8">
        <DentalLogo />
      </div>

      <div className="card-dental max-w-lg w-full animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Créer un compte
        </h2>
        <p className="text-muted-foreground mb-6">
          Commencez à gérer vos dossiers dentaires en toute sécurité
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.slice(0, 2).map((f) => (
              <FieldInput
                key={f.name}
                field={f}
                value={form[f.name] || ""}
                error={errors[f.name]}
                onChange={(v) => setForm({ ...form, [f.name]: v })}
              />
            ))}
          </div>
          {fields.slice(2).map((f) => (
            <FieldInput
              key={f.name}
              field={f}
              value={form[f.name] || ""}
              error={errors[f.name]}
              onChange={(v) => setForm({ ...form, [f.name]: v })}
            />
          ))}
          <Button
            type="submit"
            className="w-full py-6 rounded-xl text-base mt-2"
          >
            Créer un compte
          </Button>
          {errors.api && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-4 py-3 mt-4 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errors.api}
            </div>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Vous avez déjà un compte ?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-primary font-medium hover:underline"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

const FieldInput = ({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) => {
  const Icon = field.icon;
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {field.label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type={field.type}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-10 rounded-xl h-11 ${error ? "border-destructive" : ""}`}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default SignupPage;
