import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, Plus, Search, Pencil, Trash2,
  Save, X, ArrowLeft, RefreshCw
} from "lucide-react";

import { supabase } from "../lib/supabase";

const emptyForm = {
  matricule: "",
  nom: "",
  postnom: "",
  prenom: "",
  fonction: "",
  bureau: "",
  telephone: "",
  email: "",
  photo_url: ""
};

export default function AgentManagement() {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function loadAgents() {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user = sessionData.session?.user;

      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: admin } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!admin) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAgents(data || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(agent) {
    setEditingId(agent.id);

    setForm({
      matricule: agent.matricule || "",
      nom: agent.nom || "",
      postnom: agent.postnom || "",
      prenom: agent.prenom || "",
      fonction: agent.fonction || "",
      bureau: agent.bureau || "",
      telephone: agent.telephone || "",
      email: agent.email || "",
      photo_url: agent.photo_url || ""
    });

    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        matricule: form.matricule.trim(),
        nom: form.nom.trim(),
        postnom: form.postnom.trim(),
        prenom: form.prenom.trim(),
        fonction: form.fonction.trim(),
        bureau: form.bureau.trim(),
        telephone: form.telephone.trim() || null,
        email: form.email.trim() || null,
        photo_url: form.photo_url.trim() || null
      };

      if (
        !payload.matricule ||
        !payload.nom ||
        !payload.prenom ||
        !payload.fonction
      ) {
        throw new Error(
          "ID, nom, prénom et fonction sont obligatoires."
        );
      }

      let result;

      if (editingId) {
        result = await supabase
          .from("agents")
          .update(payload)
          .eq("id", editingId);
      } else {
        result = await supabase
          .from("agents")
          .insert(payload);
      }

      if (result.error) throw result.error;

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await loadAgents();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAgent(agent) {
    const confirmed = window.confirm(
      `Supprimer l'agent ${agent.nom} ${agent.prenom} (ID ${agent.matricule}) ?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("agents")
      .delete()
      .eq("id", agent.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadAgents();
  }

  const filteredAgents = agents.filter(agent => {
    const term = search.toLowerCase();

    return [
      agent.matricule,
      agent.nom,
      agent.postnom,
      agent.prenom,
      agent.fonction,
      agent.bureau
    ].some(value =>
      (value || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <div>
          <h1>
            <Users size={27} />
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
            <h2>Gestion des agents</h2>
            <p>
              Enregistrement et gestion du personnel SOCODA.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={openNew}
          >
            <Plus size={18} />
            Ajouter un agent
          </button>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {showForm && (
          <section className="dashboard-panel">

            <h3>
              {editingId ? "Modifier un agent" : "Enregistrer un nouvel agent"}
            </h3>

            <form className="agent-form" onSubmit={handleSubmit}>

              <label>ID *</label>
              <input
                name="matricule"
                value={form.matricule}
                onChange={handleChange}
                placeholder="Ex : SOC-KWL-001"
                required
              />

              <label>Nom *</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
              />

              <label>Postnom</label>
              <input
                name="postnom"
                value={form.postnom}
                onChange={handleChange}
              />

              <label>Prénom *</label>
              <input
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
              />

              <label>Fonction *</label>
              <input
                name="fonction"
                value={form.fonction}
                onChange={handleChange}
                required
              />

              <label>Bureau / Service</label>
              <input
                name="bureau"
                value={form.bureau}
                onChange={handleChange}
              />

              <label>Téléphone</label>
              <input
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
              />

              <label>Adresse e-mail</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />

              <label>Lien de la photo</label>
              <input
                name="photo_url"
                type="url"
                value={form.photo_url}
                onChange={handleChange}
                placeholder="https://..."
              />

              <div className="agent-form-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </button>

                <button type="submit" disabled={saving}>
                  <Save size={17} />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>

            </form>
          </section>
        )}

        <section className="dashboard-panel">

          <h3>
            Liste des agents ({agents.length})
          </h3>

          <div className="agent-search">
            <Search size={18} />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par ID, nom ou fonction..."
            />
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : filteredAgents.length === 0 ? (
            <p className="empty-state">
              Aucun agent trouvé.
            </p>
          ) : (

            <div className="table-container">

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom complet</th>
                    <th>Fonction</th>
                    <th>Bureau</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAgents.map(agent => (
                    <tr key={agent.id}>

                      <td>{agent.matricule}</td>

                      <td>
                        {agent.nom} {agent.postnom} {agent.prenom}
                      </td>

                      <td>{agent.fonction}</td>

                      <td>{agent.bureau || "—"}</td>

                      <td>
                        <button onClick={() => openEdit(agent)}>
                          <Pencil size={16} />
                        </button>

                        <button onClick={() => deleteAgent(agent)}>
                          <Trash2 size={16} />
                        </button>
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
