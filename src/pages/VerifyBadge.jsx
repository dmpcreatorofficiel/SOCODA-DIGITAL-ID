import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, LoaderCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function VerifyBadge() {
  const { code } = useParams();

  const [loading, setLoading] = useState(true);
  const [badge, setBadge] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyBadge() {
      const { data, error } = await supabase.rpc(
        "verify_socoda_badge",
        { p_code: code }
      );

      if (error) {
        setError("Impossible de vérifier ce badge pour le moment.");
      } else if (!data || (Array.isArray(data) && data.length === 0)) {
        setError("Ce badge est introuvable ou non reconnu.");
      } else {
        setBadge(Array.isArray(data) ? data[0] : data);
      }

      setLoading(false);
    }

    if (code) {
      verifyBadge();
    } else {
      setError("Code de vérification manquant.");
      setLoading(false);
    }
  }, [code]);

  const status = badge?.status || badge?.badge_status;
  const valid = status === "active";

  return (
    <main className="verification-page">
      <div className="verification-card">
        <div className="verification-logo">
          <ShieldCheck size={38} />
          <h2>SOCODA DIGITAL ID</h2>
          <p>Administration SOCODA COOP-CA/Kwilu</p>
        </div>

        {loading ? (
          <div className="verification-message">
            <LoaderCircle className="spinner" size={35} />
            <p>Vérification du badge en cours...</p>
          </div>
        ) : error ? (
          <div className="verification-message invalid">
            <ShieldAlert size={42} />
            <h3>Vérification impossible</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className={valid ? "result active" : "result invalid"}>
              {valid ? <ShieldCheck size={42} /> : <ShieldAlert size={42} />}
              <h3>{valid ? "BADGE ACTIF" : "BADGE NON VALIDE"}</h3>
              <p>
                {valid
                  ? "Ce badge est reconnu par le système."
                  : "Ce badge n'est pas actuellement valide."}
              </p>
            </div>

            <div className="badge-details">
              <h3>Informations du titulaire</h3>

              <p><strong>Nom :</strong> {badge.nom || "Non renseigné"}</p>
              <p><strong>Postnom :</strong> {badge.postnom || "Non renseigné"}</p>
              <p><strong>Prénom :</strong> {badge.prenom || "Non renseigné"}</p>
              <p><strong>Fonction :</strong> {badge.fonction || "Non renseignée"}</p>
              <p><strong>Bureau :</strong> {badge.bureau || "Non renseigné"}</p>
              <p><strong>Numéro du badge :</strong> {badge.badge_number || "Non renseigné"}</p>
              <p><strong>Statut :</strong> {status || "Inconnu"}</p>
              <p><strong>Expiration :</strong> {badge.expiry_date || "Non renseignée"}</p>
            </div>
          </>
        )}

        <Link to="/" className="back-home">
          Retour à l'accueil
        </Link>

        <footer>
          © 2026 SOCODA COOP-CA/Kwilu
        </footer>
      </div>
    </main>
  );
    }
