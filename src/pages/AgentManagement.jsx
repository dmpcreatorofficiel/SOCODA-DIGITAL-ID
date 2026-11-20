import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, Plus, Search, Pencil, Trash2,
  Save, ArrowLeft, Camera, Upload, X
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

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

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

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function resetPhoto() {
    setPhotoFile(null);
    setPhotoPreview("");
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    resetPhoto();
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

    setPhotoFile(null);
    setPhotoPreview(agent.photo_url || "");

    setShowForm(true);
    setError("");
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Format non autorisé. Utilise JPG, PNG ou WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La photo ne doit pas dépasser 5 Mo.");
      e.target.value = "";
      return;
    }

    setError("");

    setPhotoFile(file);

    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto() {
    if (!photoFile) {
      return form.photo_url.trim() || null;
    }

    const extensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    };

    const extension = extensions[photoFile.type];

    const fileName =
      `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("agents-photos")
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("agents-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const photoUrl = await uploadPhoto();

      const payload = {
        matricule: form.matricule.trim(),
        nom: form.nom.trim(),
        postnom: form.postnom.trim(),
        prenom: form.prenom.trim(),
        fonction: form.fonction.trim(),
        bureau: form.bureau.trim(),
        telephone: form.telephone.trim() || null,
        email: form.email.trim() || null,
        photo_url: photoUrl
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
      resetPhoto();

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
              {editingId
                ? "Modifier un agent"
                : "Enregistrer un nouvel agent"}
            </h3>

            <form
              className="agent-form"
              onSubmit={handleSubmit}
            >

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

              <div
                style={{
                  gridColumn: "1 / -1",
                  marginTop: "12px"
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "12px"
                  }}
                >
                  <Camera size={17} style={{ verticalAlign: "middle" }} />
                  {" "}Photo de l'agent
                </label>

                {photoPreview && (
                  <div
                    style={{
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap"
                    }}
                  >
                    <img
                      src={photoPreview}
                      alt="Aperçu de la photo"
                      style={{
                        width: "115px",
                        height: "125px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "2px solid #d5dce8"
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        resetPhoto();
                        setForm({
                          ...form,
                          photo_url: ""
                        });
                      }}
                      style={{
                        padding: "10px 14px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        cursor: "pointer"
                      }}
                    >
                      <X size={15} />
                      Retirer la photo
                    </button>
                  </div>
                )}

                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 16px",
                    background: "#142b50",
                    color: "#ffffff",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  <Upload size={18} />
                  {photoPreview
                    ? "Changer la photo"
                    : "Choisir une photo"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                </label>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "8px"
                  }}
                >
                  Formats acceptés : JPG, PNG, WEBP.
                  Taille maximale : 5 Mo.
                </p>
              </div>

              <div className="agent-form-actions">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetPhoto();
                  }}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                >
                  <Save size={17} />

                  {saving
                    ? "Enregistrement..."
                    : "Enregistrer"}
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
                        <button
                          onClick={() => openEdit(agent)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => deleteAgent(agent)}
                        >
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
