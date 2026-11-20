import { useEffect, useState } from "react";

import {
  ShieldCheck,
  QrCode,
  Users,
  CreditCard,
  LockKeyhole
} from "lucide-react";

import AgentManagement from "./pages/AgentManagement";
import BadgeManagement from "./pages/BadgeManagement";
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

function SplashScreen() {
  return (
    <div className="socoda-splash">
      <style>{`
        .socoda-splash {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(145deg, #081d36, #123b65);
          color: white;
          animation: splashFadeIn 0.5s ease;
        }

        .splash-logo {
          width: 118px;
          height: 118px;
          border: 2px solid #f2c230;
          border-radius: 28px;
          padding: 12px;
          background: rgba(255,255,255,0.08);
          box-shadow: 0 15px 45px rgba(0,0,0,0.25);
          animation: splashPulse 1.8s ease-in-out infinite;
        }

        .splash-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .splash-title {
          margin-top: 28px;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-align: center;
        }

        .splash-title span {
          color: #f2c230;
        }

        .splash-subtitle {
          margin-top: 10px;
          color: #c8d6e5;
          font-size: 12px;
          letter-spacing: 4px;
        }

        .splash-line {
          display: flex;
          width: 90px;
          height: 4px;
          margin-top: 35px;
          overflow: hidden;
          border-radius: 10px;
          background: rgba(255,255,255,0.15);
        }

        .splash-line::after {
          content: "";
          width: 45%;
          background: #f2c230;
          border-radius: 10px;
          animation: splashLoading 1.2s ease-in-out infinite;
        }

        .splash-footer {
          position: absolute;
          bottom: 35px;
          color: #b9c8d9;
          font-size: 10px;
          letter-spacing: 1px;
          text-align: center;
        }

        .splash-colors {
          display: flex;
          width: 75px;
          height: 4px;
          margin: 12px auto 0;
        }

        .splash-colors span {
          flex: 1;
        }

        .splash-colors span:nth-child(1) {
          background: #1769aa;
        }

        .splash-colors span:nth-child(2) {
          background: #e53935;
        }

        .splash-colors span:nth-child(3) {
          background: #f2c230;
        }

        @keyframes splashPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }

        @keyframes splashLoading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(230%);
          }
        }

        @keyframes splashFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      <div className="splash-logo">
        <img src="/icon-512.svg" alt="SOCODA DIGITAL ID" />
      </div>

      <h1 className="splash-title">
        SOCODA <span>DIGITAL ID</span>
      </h1>

      <p className="splash-subtitle">
        COOP-CA / KWILU
      </p>

      <div className="splash-line"></div>

      <div className="splash-footer">
        <p>SÉCURITÉ · IDENTITÉ · CONFIANCE</p>

        <div className="splash-colors">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <p style={{ marginTop: 12 }}>
          © 2026 SOCODA COOP-CA/Kwilu
        </p>
      </div>
    </div>
  );
}

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

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify/:code" element={<VerifyBadge />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/agents" element={<AgentManagement />} />
        <Route path="/admin/badges" element={<BadgeManagement />} />
        <Route path="*" element={<Home />} />
      </Routes>

      {showSplash && <SplashScreen />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
