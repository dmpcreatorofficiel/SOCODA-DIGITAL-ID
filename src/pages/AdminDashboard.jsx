import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  CreditCard,
  LogOut,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [agents, setAgents] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const user = sessionData.session?.user;

      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("id, full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!adminData) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      setAdmin(adminData);

      const [agentsResult, badgesResult] = await Promise.all([
        supabase.from("agents").select("*").order("created_at", {
          ascending: false
        }),

        supabase.from("badges").select("*").order("issue_date", {
          ascending: false
        })
      ]);

      if (agentsResult.error) throw agentsResult.error;
      if (badgesResult.error) throw badgesResult.error;

      setAgents(agentsResult.data || []);
      setBadges(badgesResult.data || []);

    } catch (err) {
      setError(err.message || "Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        Chargement de l'administration...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>
            <ShieldCheck size={27} />
            SOCODA DIGITAL ID
          </h1>
          <p>Administration SOCODA COOP-CA/Kwilu</p>
        </div>

        <button onClick={handleLogout} className="logout-button">
          <LogOut size={18} />
          Déconnexion
        </button>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <h2>Tableau de bord</h2>
            <p>
              Bienvenue, {admin?.full_name || "Administrateur"}.
            </p>
          </div>

          <button onClick={loadDashboard} className="refresh-button">
            <RefreshCw size={17} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="dashboard-error">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <section className="dashboard-stats">
          <div className="stat-card">
            <Users size={30} />
            <div>
              <span>Total des agents</span>
              <strong>{agents.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <CreditCard size={30} />
            <div>
              <span>Total des badges</span>
              <strong>{badges.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <ShieldCheck size={30} />
            <div>
              <span>Badges actifs</span>
              <strong>
                {badges.filter(b => b.status === "active").length}
              </strong>
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <h3>Derniers agents enregistrés</h3>

          {agents.length === 0 ? (
            <p className="empty-state">Aucun agent enregistré.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Nom</th>
                    <th>Postnom</th>
                    <th>Prénom</th>
                    <th>Fonction</th>
                  </tr>
                </thead>

                <tbody>
                  {agents.slice(0, 10).map(agent => (
                    <tr key={agent.id}>
                      <td>{agent.matricule}</td>
                      <td>{agent.nom}</td>
                      <td>{agent.postnom}</td>
                      <td>{agent.prenom}</td>
                      <td>{agent.fonction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <h3>Derniers badges enregistrés</h3>

          {badges.length === 0 ? (
            <p className="empty-state">Aucun badge enregistré.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Date d'émission</th>
                    <th>Date d'expiration</th>
                    <th>Statut</th>
                  </tr>
                </thead>

                <tbody>
                  {badges.slice(0, 10).map(badge => (
                    <tr key={badge.id}>
                      <td>{badge.badge_number}</td>
                      <td>{badge.issue_date}</td>
                      <td>{badge.expiry_date}</td>
                      <td>
                        <span className={`badge-status ${badge.status}`}>
                          {badge.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
