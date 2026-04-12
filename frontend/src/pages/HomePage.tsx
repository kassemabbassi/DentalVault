import { useNavigate } from "react-router-dom";
import { Shield, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import DentalLogo from "@/components/DentalLogo";
import heroImage from "@/assets/dental-hero.jpg";
const features = [
  {
    icon: Shield,
    title: "Sécurité de bout en bout",
    desc: "Vos dossiers sont chiffrés et entièrement protégés",
  },
  {
    icon: Lock,
    title: "Vous avez le contrôle",
    desc: "Accordez et révoquez l'accès à vos données à tout moment",
  },
  {
    icon: Smartphone,
    title: "Accès partout",
    desc: "Consultez vos dossiers depuis n'importe quel appareil en toute sécurité",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <DentalLogo />
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate("/login")}
        >
          {token ? "Mon compte" : "Se connecter"}
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center py-12">
          <div className="space-y-8 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" /> Conforme HIPAA
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Dossiers dentaires sécurisés,{" "}
                <span className="text-primary">contrôlés par vous</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-4 max-w-lg">
                Gérez l'intégralité de votre historique dentaire dans un seul
                endroit sécurisé. Partagez l'accès avec votre dentiste
                instantanément via code QR.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!token && (
                <Button
                  size="lg"
                  className="text-base px-8 py-6 rounded-xl shadow-dental"
                  onClick={() => navigate("/signup")}
                >
                  Créer un compte patient
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 rounded-xl"
                onClick={() => navigate("/login")}
              >
                {token ? "Mon compte" : "Se connecter"}
              </Button>
            </div>
          </div>

          <div
            className="hidden lg:block animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <img
              src={heroImage}
              alt="Dental care illustration"
              className="w-full rounded-2xl shadow-dental-lg"
            />
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="card-dental flex items-start gap-4 animate-fade-in"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
