import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Camera,
  CameraOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function ScanBadge() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const scanningRef = useRef(false);

  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    "Appuyez sur le bouton pour activer la caméra."
  );

  function stopCamera() {
    scanningRef.current = false;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function openVerification(value) {
    try {
      const url = new URL(value);

      const match = url.pathname.match(/^\/verify\/([^/]+)/);

      if (match) {
        stopCamera();
        navigate(`/verify/${match[1]}`);
        return true;
      }
    } catch {
      // Le QR code peut aussi contenir directement un code.
    }

    const uuid =
      value.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );

    if (uuid) {
      stopCamera();
      navigate(`/verify/${value}`);
      return true;
    }

    setError("Ce QR code ne correspond pas à un badge SOCODA.");
    return false;
  }

  async function startCamera() {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("La caméra n'est pas accessible sur cet appareil.");
      return;
    }

    if (!("BarcodeDetector" in window)) {
      setError(
        "La détection QR n'est pas prise en charge par ce navigateur. Utilisez une version récente de Chrome."
      );
      return;
    }

    try {
      const detector = new window.BarcodeDetector({
        formats: ["qr_code"]
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" }
        }
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        stopCamera();
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      scanningRef.current = true;
      setScanning(true);
      setMessage("Placez le QR code devant la caméra.");

      timerRef.current = setInterval(async () => {
        if (
          !scanningRef.current ||
          !videoRef.current ||
          videoRef.current.readyState < 2
        ) {
          return;
        }

        try {
          const codes = await detector.detect(videoRef.current);

          if (codes.length > 0 && codes[0].rawValue) {
            openVerification(codes[0].rawValue);
          }
        } catch (err) {
          console.error("Erreur de lecture QR :", err);
        }
      }, 300);

    } catch (err) {
      console.error(err);

      setError(
        "Impossible d'activer la caméra. Vérifiez les autorisations de votre téléphone."
      );

      stopCamera();
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f2f5f9",
      padding: "20px",
      boxSizing: "border-box"
    }}>

      <div style={{
        maxWidth: "500px",
        margin: "auto"
      }}>

        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#0b1f3a",
            textDecoration: "none",
            fontWeight: "700",
            marginBottom: "25px"
          }}
        >
          <ArrowLeft size={20} />
          Retour à l'accueil
        </Link>

        <div style={{
          background: "#0b1f3a",
          color: "white",
          borderRadius: "18px",
          padding: "25px 20px",
          textAlign: "center"
        }}>

          <ShieldCheck size={38} color="#f2c230" />

          <h2 style={{ margin: "12px 0 6px" }}>
            SOCODA DIGITAL ID
          </h2>

          <p style={{
            color: "#cbd8e7",
            fontSize: "13px",
            margin: 0
          }}>
            SCANNER DE VÉRIFICATION QR
          </p>

        </div>

        <div style={{
          background: "white",
          marginTop: "20px",
          padding: "18px",
          borderRadius: "18px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.06)"
        }}>

          <div style={{
            background: "#071525",
            borderRadius: "14px",
            overflow: "hidden",
            minHeight: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}>

            <video
              ref={videoRef}
              muted
              playsInline
              style={{
                width: "100%",
                display: scanning ? "block" : "none"
              }}
            />

            {!scanning && (
              <div style={{
                color: "white",
                textAlign: "center",
                padding: "25px"
              }}>
                <CameraOff size={55} color="#f2c230" />
                <p>Caméra désactivée</p>
              </div>
            )}

            {scanning && (
              <div style={{
                position: "absolute",
                width: "190px",
                height: "190px",
                border: "3px solid #f2c230",
                borderRadius: "18px",
                pointerEvents: "none"
              }} />
            )}

          </div>

          <p style={{
            textAlign: "center",
            color: "#526579",
            fontSize: "14px",
            margin: "18px 0"
          }}>
            {message}
          </p>

          {error && (
            <div style={{
              background: "#fff0f0",
              color: "#b42318",
              padding: "12px",
              borderRadius: "10px",
              display: "flex",
              gap: "8px",
              fontSize: "13px",
              marginBottom: "15px"
            }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {!scanning ? (
            <button
              onClick={startCamera}
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "12px",
                background: "#0b2b4c",
                color: "white",
                fontWeight: "800",
                fontSize: "15px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <Camera size={21} />
              Démarrer le scanner
            </button>
          ) : (
            <button
              onClick={stopCamera}
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "12px",
                background: "#b42318",
                color: "white",
                fontWeight: "800",
                fontSize: "15px"
              }}
            >
              Arrêter la caméra
            </button>
          )}

        </div>

        <p style={{
          textAlign: "center",
          color: "#718096",
          fontSize: "12px",
          marginTop: "20px"
        }}>
          SOCODA COOP-CA / KWILU
        </p>

      </div>

    </main>
  );
        }
