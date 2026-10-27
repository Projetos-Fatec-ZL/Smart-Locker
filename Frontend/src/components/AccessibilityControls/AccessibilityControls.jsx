import { useEffect, useState } from "react";
import "./AccessibilityControls.css";

function AccessibilityControls() {
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem("smartlocker-theme") === "dark";
  });

  // Mudamos de booleano para um nível numérico (0 = Normal, 1 = Grande, 2 = Extra Grande)
  const [nivelFonte, setNivelFonte] = useState(() => {
    return parseInt(localStorage.getItem("smartlocker-font-level") || "0", 10);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark-theme", temaEscuro);

    localStorage.setItem("smartlocker-theme", temaEscuro ? "dark" : "light");
  }, [temaEscuro]);

  useEffect(() => {
    // Remove classes anteriores de fonte
    document.documentElement.classList.remove("font-large", "font-xlarge");

    // Adiciona a classe correspondente ao nível atual
    if (nivelFonte === 1) {
      document.documentElement.classList.add("font-large");
    } else if (nivelFonte === 2) {
      document.documentElement.classList.add("font-xlarge");
    }

    localStorage.setItem("smartlocker-font-level", nivelFonte);
  }, [nivelFonte]);

  // Aumenta para 4 níveis (0, 1, 2, 3)
  const handleAumentarFonte = () => {
    setNivelFonte((prev) => (prev + 1) % 4);
  };

  useEffect(() => {
    // Remove todas as classes antigas de fonte
    document.documentElement.classList.remove(
      "font-large",
      "font-xlarge",
      "font-xxlarge",
    );

    // Adiciona a classe correspondente ao nível atual
    if (nivelFonte === 1) {
      document.documentElement.classList.add("font-large");
    } else if (nivelFonte === 2) {
      document.documentElement.classList.add("font-xlarge");
    } else if (nivelFonte === 3) {
      document.documentElement.classList.add("font-xxlarge");
    }

    localStorage.setItem("smartlocker-font-level", nivelFonte);
  }, [nivelFonte]);

  const titulosFonte = [
    "Aumentar tamanho da fonte",
    "Aumentar para tamanho grande",
    "Aumentar para tamanho extra grande",
    "Restaurar tamanho padrão da fonte",
  ];

  return (
    <div className="accessibility-controls">
      <button
        type="button"
        className={`accessibility-button ${temaEscuro ? "active" : ""}`}
        onClick={() => setTemaEscuro((anterior) => !anterior)}
        title={temaEscuro ? "Ativar tema claro" : "Ativar tema escuro"}
        aria-label={temaEscuro ? "Ativar tema claro" : "Ativar tema escuro"}
      >
        {temaEscuro ? "☀️" : "🌙"}
      </button>

      <button
        type="button"
        className={`accessibility-button font-button ${
          nivelFonte > 0 ? "active" : ""
        }`}
        onClick={handleAumentarFonte}
        title={titulosFonte[nivelFonte]}
        aria-label={titulosFonte[nivelFonte]}
      >
        {nivelFonte === 3 ? "A+++" : nivelFonte === 2 ? "A++" : "A+"}
      </button>
    </div>
  );
}

export default AccessibilityControls;
