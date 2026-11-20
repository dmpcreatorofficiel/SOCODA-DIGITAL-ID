import { useEffect, useState } from "react";

import {
  ShieldCheck,
  QrCode,
  Users,
  CreditCard,
  LockKeyhole,
  House,
  ScanQrCode,
  CircleUserRound
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
    <div className="app" id="top">

      <style>{`
        .mobile-bottom-nav {
          display: none;
        }

        .about-section {
          padding: 55px 7%;
          background: #f4f7fb;
        }

        .about-container {
          max-width: 1050px;
          margin: auto;
        }

        .about-label {
          display: inline-block;
          color: #b58a12;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }

        .about-section h2 {
          color: #0b1f3a;
          font-size: 28px;
          margin-bottom: 18px;
        }

        .about-description {
          color: #526579;
          font-size: 15px;
          line-height: 1.8;
          max-width: 850px;
        }

        .about-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 30px;
        }

        .about-card {
          background: white;
          border: 1px solid #e1e8f0;
          border-radius: 14px;
          padding: 23px;
          box-shadow: 0 5px 18px rgba(8,29,54,0.04);
        }

        .about-card-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eaf1f8;
          color: #0b2b4c;
          border-radius: 12px;
          margin-bottom: 15px;
        }

        .about-card h3 {
          color: #0b1f3a;
          font-size: 16px;
          margin-bottom: 9px;
        }

        .about-card p {
          color: #647589;
          font-size: 13px;
          line-height: 1.7;
        }

        .about-note {
          margin-top: 25px;
          padding: 18px 20px;
          border-left: 4px solid #f2c230;
          background: #fff;
          color: #526579;
          line-height: 1.7;
          border-radius: 5px;
        }

        @media (max-width: 750px) {

          .mobile-bottom-nav {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;

            display: grid;
            grid-template-columns: repeat(3, 1fr);

            padding: 9px 8px calc(9px + env(safe-area-inset-bottom));

            background: rgba(255,255,255,0.97);
            border-top: 1px solid #dce4ed;
            box-shadow: 0 -6px 22px rgba(8,29,54,0.10);
            backdrop-filter: blur(12px);
          }

          .mobile-bottom-nav a {
            min-height: 52px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;

            color: #60758b;
            font-size: 10px;
            font-weight: 700;
            text-decoration: none;
          }

          .mobile-bottom-nav a:nth-child(2) {
            color: #0b2b4c;
          }

          .mobile-bottom-nav a:nth-child(2) svg {
            color: #d5a91d;
          }

          .mobile-bottom-nav svg {
            width: 21px;
            height: 21px;
          }

          .about-section {
            padding: 38px 18px;
          }

          .about-section h2 {
            font-size: 23px;
          }

          .about-grid {
            grid-template-columns: 1fr;
            gap: 13px;
          }

          footer {
            padding-bottom: 105px;
          }
        }
      `}</style>


      {/* EN-TÊTE */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            <ShieldCheck size={30} />
          </div>

          <div>
            <h1>
              SOCODA <span>DIGITAL ID</span>
            </h1>

            <p>COOP-CA / KWILU</p>
          </div>

        </div>

        <div className="header-status">
          <span className="status-dot"></span>
          Système de vérification
        </div>

      </header>


      <main>

        {/* SECTION PRINCIPALE */}

        <section className="hero">

          <div className="hero-content">

            <span className="badge">
              PLATEFORME OFFICIELLE
            </span>

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


        {/* À PROPOS DE SOCODA DIGITAL ID */}

        <section className="about-section" id="about">

          <div className="about-container">

            <span className="about-label">
              PRÉSENTATION DE LA PLATEFORME
            </span>

            <h2>
              À propos de SOCODA DIGITAL ID
            </h2>

            <p className="about-description">
              SOCODA DIGITAL ID est une plateforme numérique dédiée
              à la gestion et à la vérification des badges des agents
              de SOCODA COOP-CA/Kwilu. Elle facilite la consultation
              des informations liées aux badges et permet de vérifier
              leur authenticité ainsi que leur statut à partir d'un
              code QR.
            </p>


            <div className="about-grid">

              <div className="about-card">

                <div className="about-card-icon">
                  <ShieldCheck size={24} />
                </div>

                <h3>Identité numérique</h3>

                <p>
                  Chaque badge est associé à un agent enregistré
                  dans le système et à un code de vérification unique.
                </p>

              </div>


              <div className="about-card">

                <div className="about-card-icon">
                  <QrCode size={24} />
                </div>

                <h3>Vérification sécurisée</h3>

                <p>
                  Le scan du QR code permet de consulter les
                  informations disponibles et le statut du badge.
                </p>

              </div>


              <div className="about-card">

                <div className="about-card-icon">
                  <Users size={24} />
                </div>

                <h3>Gestion centralisée</h3>

                <p>
                  Les administrateurs autorisés assurent la gestion
                  des agents et le suivi des badges depuis leur espace.
                </p>

              </div>

            </div>


            <div className="about-note">
              <strong>Important :</strong> la consultation numérique
              constitue un moyen de contrôle du badge. En cas de doute,
              il convient de se référer aux services compétents de
              SOCODA COOP-CA/Kwilu.
            </div>

          </div>

        </section>


        {/* FONCTIONNALITÉS */}

        <section className="features">

          <div className="feature">

            <div className="feature-icon">
              <QrCode />
            </div>

            <h3>Vérification QR</h3>

            <p>
              Authentification numérique des badges.
            </p>

          </div>


          <div className="feature">

            <div className="feature-icon">
              <Users />
            </div>

            <h3>Gestion des agents</h3>

            <p>
              Centralisation des informations des agents.
            </p>

          </div>


          <div className="feature">

            <div className="feature-icon">
              <CreditCard />
            </div>

            <h3>Gestion des badges</h3>

            <p>
              Suivi de validité et des statuts des badges.
            </p>

          </div>

        </section>


        {/* VÉRIFICATION */}

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


        {/* ADMINISTRATION */}

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


      {/* NAVIGATION MOBILE */}

      <nav
        className="mobile-bottom-nav"
        aria-label="Navigation principale"
      >

        <Link
          to="/"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth"
            })
          }
        >
          <House />
          <span>Accueil</span>
        </Link>


        <a href="#verification">
          <ScanQrCode />
          <span>Vérifier un badge</span>
        </a>


        <Link to="/admin/login">
          <CircleUserRound />
          <span>Compte</span>
        </Link>

      </nav>


      {/* PIED DE PAGE */}

      <footer>

        <p>© 2026 SOCODA COOP-CA/Kwilu</p>

        <p>
          SOCODA DIGITAL ID · Sécurité et confiance
        </p>

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

        <Route
          path="/verify/:code"
          element={<VerifyBadge />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/agents"
          element={<AgentManagement />}
        />

        <Route
          path="/admin/badges"
          element={<BadgeManagement />}
        />

        <Route
          path="*"
          element={<Home />}
        />

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
