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
          variant="outline"
          size="sm"
          className="rounded-lg border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={() => navigate("/login")}
        >
          {token ? "Mon compte" : "Se connecter"}
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center py-12">
          {/* Left */}
          <div
            className="space-y-8 animate-fade-in"
            style={{ animationDelay: "0s" }}
          >
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
                style={{
                  background: "hsl(214 84% 56% / 0.1)",
                  color: "hsl(214 84% 56%)",
                  border: "1px solid hsl(214 84% 56% / 0.25)",
                }}
              >
                <Shield className="w-3.5 h-3.5" /> Conforme HIPAA
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.2rem] font-semibold text-foreground leading-tight">
                Dossiers dentaires sécurisés,{" "}
                <span style={{ color: "hsl(214 84% 56%)" }}>
                  contrôlés par vous
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mt-4 max-w-lg leading-relaxed">
                Gérez l'intégralité de votre historique dentaire dans un seul
                endroit sécurisé. Partagez l'accès avec votre dentiste
                instantanément via code QR.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!token && (
                <Button
                  size="lg"
                  className="text-white text-base px-7 py-5 rounded-xl shadow-none transition-colors"
                  style={{ background: "hsl(214 84% 56%)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "hsl(214 84% 46%)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "hsl(214 84% 56%)")
                  }
                  onClick={() => navigate("/signup")}
                >
                  Créer un compte patient
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="text-base px-7 py-5 rounded-xl border-border/70 hover:bg-muted/60 transition-colors"
                onClick={() => navigate("/login")}
              >
                {token ? "Mon compte" : "Se connecter"}
              </Button>
            </div>
          </div>

          {/* Right — image */}
          <div
            className="hidden lg:block animate-fade-in"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="rounded-2xl overflow-hidden border border-border/40 shadow-sm aspect-[4/3]">
              <img
                src={heroImage}
                alt="Dental care illustration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl p-5 flex items-start gap-4 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${0.25 + i * 0.12}s` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "hsl(214 84% 56% / 0.5)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 4px hsl(214 84% 56% / 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "hsl(214 84% 56% / 0.1)" }}
              >
                <f.icon
                  className="w-5 h-5"
                  style={{ color: "hsl(214 84% 56%)" }}
                />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;