import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, LockKeyhole, Mail, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password
        });

      if (loginError) throw loginError;

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("id, full_name, role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        throw new Error("Accès refusé : compte administrateur non autorisé.");
      }

      navigate("/admin");
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <ShieldCheck size={45} />
          <h1>SOCODA DIGITAL ID</h1>
          <p>Administration SOCODA COOP-CA/Kwilu</p>
        </div>

        <h2>Connexion administrateur</h2>
        <p className="login-description">
          Connectez-vous avec votre compte autorisé.
        </p>

        <form onSubmit={handleLogin}>
          <label>Adresse e-mail</label>

          <div className="input-group">
            <Mail size={19} />
            <input
              type="email"
              placeholder="administrateur@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Mot de passe</label>

          <div className="input-group">
            <LockKeyhole size={19} />
            <input
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <Link to="/" className="login-back">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
            }
