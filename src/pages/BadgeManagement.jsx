import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function BadgeManagement() {
  const navigate = useNavigate();

  const [badges, setBadges] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadData() {
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

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!admin) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      const [badgesResult, agentsResult] = await Promise.all([
        supabase
          .from("badges")
          .select("*")
          .order("issue_date", { ascending: false }),

        supabase
          .from("agents")
          .select("id, matricule, nom, postnom, prenom, fonction, photo_url")
          .order("created_at", { ascending: false })
      ]);

      if (badgesResult.error) throw badgesResult.error;
      if (agentsResult.error) throw agentsResult.error;

      setBadges(badgesResult.data || []);
      setAgents(agentsResult.data || []);

    } catch (err) {
      setError(err.message || "Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredBadges = badges.filter(badge => {
    const agent = agents.find(a => a.id === badge.agent_id);

    const text = [
      badge.badge_number,
      badge.status,
      agent?.matricule,
      agent?.nom,
      agent?.postnom,
      agent?.prenom
    ].join(" ").toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <div>
          <h1>
            <CreditCard size={27} />
            SOCODA DIGITAL ID
          </h1>
          <p>Administration SOCODA COOP-CA/Kwilu</p>
        </div>

        <Link to="/admin" className="logout-button">
          <ArrowLeft size={17} />
          Tableau de bord
        </Link>
      </header>

      <main className="dashboard-content">

        <div className="dashboard-welcome">
          <div>
            <h2>Gestion des badges</h2>
            <p>Création, suivi et administration des badges SOCODA.</p>
          </div>

          <button className="refresh-button" onClick={loadData}>
            <RefreshCw size={17} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="dashboard-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <section className="dashboard-stats">

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

          <div className="stat-card">
            <AlertCircle size={30} />
            <div>
              <span>Badges suspendus</span>
              <strong>
                {badges.filter(b => b.status === "suspended").length}
              </strong>
            </div>
          </div>

        </section>

        <section className="dashboard-panel">

          <h3>Liste des badges ({badges.length})</h3>

          <div className="agent-search">
            <Search size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un badge ou un agent..."
            />
          </div>

          {loading ? (
            <p>Chargement des badges...</p>
          ) : filteredBadges.length === 0 ? (
            <p className="empty-state">
              Aucun badge trouvé.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Agent</th>
                    <th>ID agent</th>
                    <th>Émission</th>
                    <th>Expiration</th>
                    <th>Statut</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBadges.map(badge => {
                    const agent = agents.find(
                      a => a.id === badge.agent_id
                    );

                    return (
                      <tr key={badge.id}>
                        <td>{badge.badge_number}</td>

                        <td>
                          {agent
                            ? `${agent.nom} ${agent.postnom || ""} ${agent.prenom}`
                            : "Agent introuvable"}
                        </td>

                        <td>{agent?.matricule || "—"}</td>

                        <td>{badge.issue_date || "—"}</td>

                        <td>{badge.expiry_date || "—"}</td>

                        <td>
                          <span className={`badge-status ${badge.status}`}>
                            {badge.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </section>

        <section className="dashboard-panel">
          <h3>Agents disponibles</h3>
          <p>
            Nombre d'agents enregistrés : <strong>{agents.length}</strong>
          </p>
        </section>

      </main>
    </div>
  );
        }
