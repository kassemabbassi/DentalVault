import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DentalLogo from "@/components/DentalLogo";
import { api } from "@/lib/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [cin, setCin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/patient-record");
    }
  }, []);

  const sendReq = async () => {
    if (!cin.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await api.post("/login", {
        cin,
        password,
      });

      // 🔐 1. récupérer token
      const token = res.data.token;

      // 💾 2. stocker dans localStorage
      localStorage.setItem("token", token);

      // (optionnel mais recommandé)
      localStorage.setItem("patient", JSON.stringify(res.data.patient));

      setError("");

      // 🚀 3. redirection vers page protégée
      navigate("/patient-record");
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Server not reachable");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendReq();
    // Demo: navigate to patient record
    navigate("/patient-record");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="mb-8">
        <DentalLogo />
      </div>

      <div className="card-dental max-w-md w-full animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Bienvenue de retour
        </h2>
        <p className="text-muted-foreground mb-6">
          Connectez-vous pour accéder à vos dossiers dentaires
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">CIN (Numéro d'identité nationale)</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="AB123456"
                value={cin}
                onChange={(e) => {
                  setCin(e.target.value);
                  setError("");
                }}
                className="pl-10 rounded-xl h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="pl-10 rounded-xl h-11"
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-6 rounded-xl text-base">
            Se connecter
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Vous n'avez pas de compte ?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-primary font-medium hover:underline"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
