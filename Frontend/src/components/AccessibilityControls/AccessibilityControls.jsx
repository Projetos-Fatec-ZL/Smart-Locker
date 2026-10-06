import { useEffect, useState } from "react";
import "./AccessibilityControls.css";

function AccessibilityControls() {
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem("smartlocker-theme") === "dark";
  });

  const [fonteGrande, setFonteGrande] = useState(() => {
    return localStorage.getItem("smartlocker-font") === "large";
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark-theme",
      temaEscuro
    );

    localStorage.setItem(
      "smartlocker-theme",
      temaEscuro ? "dark" : "light"
    );
  }, [temaEscuro]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "font-large",
      fonteGrande
    );

    localStorage.setItem(
      "smartlocker-font",
      fonteGrande ? "large" : "normal"
    );
  }, [fonteGrande]);

  return (
    <div className="accessibility-controls">

      <button
        type="button"
        className={`accessibility-button ${
          temaEscuro ? "active" : ""
        }`}
        onClick={() =>
          setTemaEscuro((anterior) => !anterior)
        }
        title={
          temaEscuro
            ? "Ativar tema claro"
            : "Ativar tema escuro"
        }
        aria-label={
          temaEscuro
            ? "Ativar tema claro"
            : "Ativar tema escuro"
        }
      >
        {temaEscuro ? "☀️" : "🌙"}
      </button>

      <button
        type="button"
        className={`accessibility-button font-button ${
          fonteGrande ? "active" : ""
        }`}
        onClick={() =>
          setFonteGrande((anterior) => !anterior)
        }
        title={
          fonteGrande
            ? "Restaurar tamanho da fonte"
            : "Aumentar tamanho da fonte"
        }
        aria-label={
          fonteGrande
            ? "Restaurar tamanho da fonte"
            : "Aumentar tamanho da fonte"
        }
      >
        A+
      </button>

    </div>
  );
}

export default AccessibilityControls;