import {
  ShieldCheck,
  QrCode,
  Users,
  CreditCard,
  LockKeyhole
} from "lucide-react";

import AgentManagement from "./pages/AgentManagement";

import AdminDashboard from "./pages/AdminDashboard";

import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import VerifyBadge from "./pages/VerifyBadge";
import AdminLogin from "./pages/AdminLogin";
import "./style.css";

function Home() {
  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={30} />
          </div>
          <div>
            <h1>SOCODA <span>DIGITAL ID</span></h1>
            <p>COOP-CA / KWILU</p>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot"></span>
          Système de vérification
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="badge">PLATEFORME OFFICIELLE</span>

            <h2>
              L'identité professionnelle,
              <span> en toute confiance.</span>
            </h2>

            <p>
              Bienvenue sur la plateforme numérique de gestion et de
              vérification des badges des agents de SOCODA COOP-CA/Kwilu.
            </p>

            <div className="hero-actions">
              <a href="#verification" className="btn-primary">
                <QrCode size={19} />
                Vérifier un badge
              </a>

              <Link to="/admin/login" className="btn-secondary">
                <LockKeyhole size={18} />
                Administration
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="digital-card">
              <div className="card-top">
                <ShieldCheck size={27} />
                <span>SOCODA COOP-CA</span>
              </div>

              <div className="card-chip"></div>

              <div className="card-bottom">
                <div>
                  <small>IDENTITÉ NUMÉRIQUE</small>
                  <strong>OFFICIELLE</strong>
                </div>
                <QrCode size={55} />
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <div className="feature-icon"><QrCode /></div>
            <h3>Vérification QR</h3>
            <p>Authentification numérique des badges.</p>
          </div>

          <div className="feature">
            <div className="feature-icon"><Users /></div>
            <h3>Gestion des agents</h3>
            <p>Centralisation des informations des agents.</p>
          </div>

          <div className="feature">
            <div className="feature-icon"><CreditCard /></div>
            <h3>Gestion des badges</h3>
            <p>Suivi de validité et des statuts des badges.</p>
          </div>
        </section>

        <section className="verification" id="verification">
          <QrCode size={35} />
          <div>
            <h3>Vérification d'un badge</h3>
            <p>
              Scannez le QR code figurant sur un badge SOCODA
              pour consulter son authenticité et sa validité.
            </p>
          </div>
        </section>

        <section className="admin-section">
          <LockKeyhole size={25} />
          <div>
            <h3>Espace d'administration</h3>
            <p>
              Accès réservé aux administrateurs autorisés
              de SOCODA COOP-CA/Kwilu.
            </p>
            <Link to="/admin/login" className="admin-link">
              Accéder à l'administration →
            </Link>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2026 SOCODA COOP-CA/Kwilu</p>
        <p>SOCODA DIGITAL ID · Sécurité et confiance</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify/:code" element={<VerifyBadge />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/agents" element={<AgentManagement />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
