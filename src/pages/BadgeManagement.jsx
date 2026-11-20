import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  CreditCard,
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  QrCode,
  X,
  Ban,
  CheckCircle,
  Pencil
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function BadgeManagement() {
  const navigate = useNavigate();

  const [badges, setBadges] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingBadgeId, setUpdatingBadgeId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [createdBadge, setCreatedBadge] = useState(null);

  // MODIFICATION DE LA DATE D'EXPIRATION
  const [editingBadge, setEditingBadge] = useState(null);
  const [editingExpiryDate, setEditingExpiryDate] = useState("");
  const [savingExpiry, setSavingExpiry] = useState(false);

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
      setError(err.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // OUVRIR LE FORMULAIRE DE MODIFICATION
  function openExpiryEditor(badge) {
    setEditingBadge(badge);
    setEditingExpiryDate(badge.expiry_date || "");
    setError("");
    setSuccess("");
    setShowForm(false);
  }

  // ENREGISTRER LA NOUVELLE DATE D'EXPIRATION
  async function saveExpiryDate(e) {
    e.preventDefault();

    if (!editingBadge) return;

    setError("");
    setSuccess("");
    setSavingExpiry(true);

    try {
      const { data, error: updateError } = await supabase
        .from("badges")
        .update({
          expiry_date: editingExpiryDate || null
        })
        .eq("id", editingBadge.id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      setBadges(previous =>
        previous.map(badge =>
          badge.id === editingBadge.id ? data : badge
        )
      );

      if (createdBadge?.id === editingBadge.id) {
        setCreatedBadge(data);
      }

      setSuccess(
        `La date d'expiration du badge ${data.badge_number} a été modifiée avec succès.`
      );

      setEditingBadge(null);
      setEditingExpiryDate("");

    } catch (err) {
      setError(
        err.message || "Impossible de modifier la date d'expiration."
      );
    } finally {
      setSavingExpiry(false);
    }
  }

  // CRÉATION D'UN BADGE
  async function createBadge(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedAgent) {
      setError("Veuillez sélectionner un agent.");
      return;
    }

    const existingBadge = badges.find(
      badge =>
        badge.agent_id === selectedAgent &&
        badge.status !== "revoked"
    );

    if (existingBadge) {
      setError("Cet agent possède déjà un badge non révoqué.");
      return;
    }

    setCreating(true);

    try {
      const { data: badgeNumber, error: numberError } =
        await supabase.rpc("generate_socoda_badge_number");

      if (numberError) throw numberError;

      const badgeData = {
        agent_id: selectedAgent,
        badge_number: badgeNumber
      };

      if (expiryDate) {
        badgeData.expiry_date = expiryDate;
      }

      const { data: newBadge, error: insertError } = await supabase
        .from("badges")
        .insert(badgeData)
        .select("*")
        .single();

      if (insertError) throw insertError;

      setCreatedBadge(newBadge);
      setSuccess("Badge créé avec succès !");
      setShowForm(false);
      setSelectedAgent("");
      setExpiryDate("");

      await loadData();

    } catch (err) {
      setError(err.message || "Impossible de créer le badge.");
    } finally {
      setCreating(false);
    }
  }

  // SUSPENSION D'UN BADGE
  async function suspendBadge(badge) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment suspendre le badge ${badge.badge_number} ?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setUpdatingBadgeId(badge.id);

    try {
      const { data, error: updateError } = await supabase
        .from("badges")
        .update({ status: "suspended" })
        .eq("id", badge.id)
        .eq("status", "active")
        .select("id");

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error("Aucune modification effectuée.");
      }

      setSuccess(
        `Le badge ${badge.badge_number} a été suspendu avec succès.`
      );

      if (createdBadge?.id === badge.id) {
        setCreatedBadge({
          ...createdBadge,
          status: "suspended"
        });
      }

      await loadData();

    } catch (err) {
      setError(err.message || "Impossible de suspendre ce badge.");
    } finally {
      setUpdatingBadgeId(null);
    }
  }

  // RÉACTIVATION D'UN BADGE
  async function reactivateBadge(badge) {
    const today = new Date().toISOString().split("T")[0];

    if (badge.expiry_date && badge.expiry_date < today) {
      setError(
        "Impossible de réactiver ce badge : sa date d'expiration est dépassée."
      );
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment réactiver le badge ${badge.badge_number} ?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setUpdatingBadgeId(badge.id);

    try {
      const { data, error: updateError } = await supabase
        .from("badges")
        .update({ status: "active" })
        .eq("id", badge.id)
        .eq("status", "suspended")
        .select("id");

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error("Aucune modification effectuée.");
      }

      setSuccess(
        `Le badge ${badge.badge_number} a été réactivé avec succès.`
      );

      if (createdBadge?.id === badge.id) {
        setCreatedBadge({
          ...createdBadge,
          status: "active"
        });
      }

      await loadData();

    } catch (err) {
      setError(err.message || "Impossible de réactiver ce badge.");
    } finally {
      setUpdatingBadgeId(null);
    }
  }

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

  function getVerificationUrl(badge) {
    return `${window.location.origin}/verify/${badge.verification_code}`;
  }

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

          <div style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}>
            <button
              className="refresh-button"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Actualiser
            </button>

            <button
              className="refresh-button"
              onClick={() => {
                setShowForm(true);
                setEditingBadge(null);
                setError("");
                setSuccess("");
              }}
              disabled={agents.length === 0}
            >
              <Plus size={17} />
              Créer un badge
            </button>
          </div>
        </div>

        {error && (
          <div className="dashboard-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: "13px",
            marginBottom: "18px",
            background: "#e7f8ed",
            color: "#176b35",
            borderRadius: "8px"
          }}>
            <ShieldCheck size={18} />
            {" "}{success}
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

        {/* FORMULAIRE DE MODIFICATION DE DATE */}
        {editingBadge && (
          <section className="dashboard-panel">
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px"
            }}>
              <h3>
                <Pencil size={20} />
                {" "}Modifier la date d'expiration
              </h3>

              <button
                type="button"
                onClick={() => {
                  setEditingBadge(null);
                  setEditingExpiryDate("");
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer"
                }}
              >
                <X />
              </button>
            </div>

            <p>
              Badge concerné :{" "}
              <strong>{editingBadge.badge_number}</strong>
            </p>

            <form onSubmit={saveExpiryDate}>

              <div style={{ marginBottom: "18px" }}>
                <label>
                  <strong>Nouvelle date d'expiration</strong>
                </label>

                <input
                  type="date"
                  value={editingExpiryDate}
                  onChange={e => setEditingExpiryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "13px",
                    marginTop: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc"
                  }}
                />

                <small style={{
                  display: "block",
                  marginTop: "8px",
                  color: "#666"
                }}>
                  Laissez ce champ vide pour supprimer la date d'expiration.
                </small>
              </div>

              <div style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap"
              }}>
                <button
                  type="submit"
                  className="refresh-button"
                  disabled={savingExpiry}
                >
                  <CheckCircle size={17} />
                  {savingExpiry
                    ? "Enregistrement..."
                    : "Enregistrer la modification"}
                </button>

                <button
                  type="button"
                  className="refresh-button"
                  onClick={() => {
                    setEditingBadge(null);
                    setEditingExpiryDate("");
                  }}
                  disabled={savingExpiry}
                  style={{
                    background: "#eeeeee",
                    color: "#333"
                  }}
                >
                  Annuler
                </button>
              </div>

            </form>
          </section>
        )}

        {/* FORMULAIRE DE CRÉATION */}
        {showForm && (
          <section className="dashboard-panel">
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3>Créer un nouveau badge</h3>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer"
                }}
              >
                <X />
              </button>
            </div>

            <form onSubmit={createBadge}>

              <div style={{ marginBottom: "18px" }}>
                <label>
                  <strong>Sélectionner l'agent *</strong>
                </label>

                <select
                  value={selectedAgent}
                  onChange={e => setSelectedAgent(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "13px",
                    marginTop: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc"
                  }}
                >
                  <option value="">Choisir un agent</option>

                  {agents.map(agent => {
                    const alreadyHasBadge = badges.some(
                      b =>
                        b.agent_id === agent.id &&
                        b.status !== "revoked"
                    );

                    return (
                      <option
                        key={agent.id}
                        value={agent.id}
                        disabled={alreadyHasBadge}
                      >
                        {agent.nom} {agent.postnom || ""} {agent.prenom}
                        {" — "}
                        {agent.matricule}
                        {alreadyHasBadge ? " (Badge déjà attribué)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label>
                  <strong>Date d'expiration (facultative)</strong>
                </label>

                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "13px",
                    marginTop: "8px",
                    borderRadius: "8px",
                    border: "1px solid #ccc"
                  }}
                />
              </div>

              <button
                type="submit"
                className="refresh-button"
                disabled={creating}
              >
                <Plus size={18} />
                {creating ? "Création en cours..." : "Créer le badge"}
              </button>

            </form>
          </section>
        )}

        {/* AFFICHAGE DU QR CODE */}
        {createdBadge && (
          <section className="dashboard-panel">
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3>
                <QrCode size={21} /> Badge
              </h3>

              <button
                onClick={() => setCreatedBadge(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer"
                }}
              >
                <X />
              </button>
            </div>

            <div style={{
              textAlign: "center",
              padding: "20px"
            }}>
              <h2 style={{ color: "#102b50" }}>
                {createdBadge.badge_number}
              </h2>

              <p>QR CODE DE VÉRIFICATION</p>

              <div style={{
                display: "flex",
                justifyContent: "center",
                padding: "20px"
              }}>
                <QRCodeSVG
                  value={getVerificationUrl(createdBadge)}
                  size={210}
                  level="H"
                  includeMargin
                />
              </div>

              <p>
                Statut :{" "}
                <strong>
                  {createdBadge.status === "suspended"
                    ? "SUSPENDU"
                    : createdBadge.status === "revoked"
                    ? "RÉVOQUÉ"
                    : "ACTIF"}
                </strong>
              </p>

              <p>
                Date d'émission : {createdBadge.issue_date}
              </p>

              <p>
                Expiration : {createdBadge.expiry_date || "Aucune"}
              </p>

              <a
                href={getVerificationUrl(createdBadge)}
                target="_blank"
                rel="noreferrer"
              >
                Tester la vérification du badge
              </a>
            </div>
          </section>
        )}

        {/* LISTE DES BADGES */}
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
            <p className="empty-state">Aucun badge trouvé.</p>
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
                    <th>QR code</th>
                    <th>Actions</th>
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

                        <td>
                          <button
                            className="refresh-button"
                            onClick={() => setCreatedBadge(badge)}
                          >
                            <QrCode size={16} />
                            Voir QR
                          </button>
                        </td>

                        <td>
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            minWidth: "145px"
                          }}>

                            {/* MODIFIER LA DATE */}
                            <button
                              className="refresh-button"
                              onClick={() => openExpiryEditor(badge)}
                              style={{
                                background: "#e8f1ff",
                                color: "#174a85",
                                border: "1px solid #9bbce5"
                              }}
                            >
                              <Pencil size={16} />
                              Modifier date
                            </button>

                            {badge.status === "active" && (
                              <button
                                className="refresh-button"
                                onClick={() => suspendBadge(badge)}
                                disabled={updatingBadgeId === badge.id}
                                style={{
                                  background: "#fff0d9",
                                  color: "#9a5b00",
                                  border: "1px solid #e5b45c"
                                }}
                              >
                                <Ban size={16} />
                                {updatingBadgeId === badge.id
                                  ? "Suspension..."
                                  : "Suspendre"}
                              </button>
                            )}

                            {badge.status === "suspended" && (
                              <button
                                className="refresh-button"
                                onClick={() => reactivateBadge(badge)}
                                disabled={updatingBadgeId === badge.id}
                                style={{
                                  background: "#e7f8ed",
                                  color: "#176b35",
                                  border: "1px solid #8ac9a0"
                                }}
                              >
                                <CheckCircle size={16} />
                                {updatingBadgeId === badge.id
                                  ? "Réactivation..."
                                  : "Réactiver"}
                              </button>
                            )}

                            {badge.status === "revoked" && (
                              <span style={{
                                color: "#b91c1c",
                                fontWeight: "bold"
                              }}>
                                Révoqué
                              </span>
                            )}

                          </div>
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
