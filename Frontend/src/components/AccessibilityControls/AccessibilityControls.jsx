import { useEffect, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Contrast,
  Check,
  ChevronDown,
} from "lucide-react";

import "./AccessibilityControls.css";

const CHAVE_APARENCIA = "smartlocker-appearance";
const CHAVE_TEMA_ANTIGA = "smartlocker-theme";
const CHAVE_FONTE = "smartlocker-font-level";

function obterAparenciaInicial() {
  try {
    const salva = localStorage.getItem(CHAVE_APARENCIA);

    if (["light", "dark", "contrast"].includes(salva)) {
      return salva;
    }

    // Mantém o tema escuro que já estava salvo na versão anterior.
    return localStorage.getItem(CHAVE_TEMA_ANTIGA) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function obterNivelFonteInicial() {
  try {
    const nivel = Number.parseInt(
      localStorage.getItem(CHAVE_FONTE) || "0",
      10
    );

    return Number.isInteger(nivel) && nivel >= 0 && nivel <= 3
      ? nivel
      : 0;
  } catch {
    return 0;
  }
}

function AccessibilityControls() {
  const [aparencia, setAparencia] = useState(obterAparenciaInicial);
  const [nivelFonte, setNivelFonte] = useState(obterNivelFonteInicial);
  const [menuAberto, setMenuAberto] = useState(false);

  const menuRef = useRef(null);

  // Aplica e salva a aparência selecionada.
  useEffect(() => {
    const raiz = document.documentElement;

    raiz.classList.toggle("dark-theme", aparencia === "dark");
    raiz.classList.toggle("alto-contraste", aparencia === "contrast");

    try {
      localStorage.setItem(CHAVE_APARENCIA, aparencia);

      // Compatibilidade com o código antigo do tema.
      localStorage.setItem(
        CHAVE_TEMA_ANTIGA,
        aparencia === "dark" ? "dark" : "light"
      );
    } catch {
      // A aparência continua funcionando sem persistência.
    }
  }, [aparencia]);

  // Aplica o nível de fonte escolhido.
  useEffect(() => {
    const raiz = document.documentElement;

    raiz.classList.remove(
      "font-large",
      "font-xlarge",
      "font-xxlarge"
    );

    if (nivelFonte === 1) {
      raiz.classList.add("font-large");
    } else if (nivelFonte === 2) {
      raiz.classList.add("font-xlarge");
    } else if (nivelFonte === 3) {
      raiz.classList.add("font-xxlarge");
    }

    try {
      localStorage.setItem(CHAVE_FONTE, String(nivelFonte));
    } catch {
      // O controle de fonte continua funcionando.
    }
  }, [nivelFonte]);

  // Fecha o menu ao clicar fora ou pressionar Escape.
  useEffect(() => {
    if (!menuAberto) return;

    function fecharAoClicarFora(evento) {
      if (!menuRef.current?.contains(evento.target)) {
        setMenuAberto(false);
      }
    }

    function fecharComEscape(evento) {
      if (evento.key === "Escape") {
        setMenuAberto(false);

        menuRef.current
          ?.querySelector(".appearance-button")
          ?.focus();
      }
    }

    document.addEventListener("pointerdown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.removeEventListener(
        "pointerdown",
        fecharAoClicarFora
      );

      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [menuAberto]);

  function selecionarAparencia(opcao) {
    setAparencia(opcao);
    setMenuAberto(false);
  }

  function handleAumentarFonte() {
    setNivelFonte((anterior) => (anterior >= 3 ? 0 : anterior + 1));
  }

  const IconeAparencia =
    aparencia === "dark"
      ? Sun
      : aparencia === "contrast"
        ? Contrast
        : Moon;

  const opcoesAparencia = [
    {
      valor: "light",
      titulo: "Tema claro",
      descricao: "Aparência padrão do sistema",
      Icone: Sun,
    },
    {
      valor: "dark",
      titulo: "Tema escuro",
      descricao: "Interface com cores escuras",
      Icone: Moon,
    },
    {
      valor: "contrast",
      titulo: "Alto contraste",
      descricao: "Preto, branco e destaques amarelos",
      Icone: Contrast,
    },
  ];

  const titulosFonte = [
    "Aumentar tamanho da fonte",
    "Aumentar para tamanho extra grande",
    "Aumentar para tamanho máximo",
    "Restaurar tamanho padrão da fonte",
  ];

  const rotulosFonte = ["A+", "A+", "A++", "A+++"];

  return (
    <div className="accessibility-controls">
      {/* Botão da lua: abre as opções de aparência */}
      <div className="appearance-control" ref={menuRef}>
        <button
          type="button"
          className={`accessibility-button appearance-button ${
            aparencia !== "light" ? "active" : ""
          }`}
          onClick={() => setMenuAberto((aberto) => !aberto)}
          aria-label="Opções de aparência"
          aria-haspopup="true"
          aria-expanded={menuAberto}
          title="Opções de aparência"
        >
          <IconeAparencia size={20} aria-hidden="true" />
          <ChevronDown
            className="appearance-chevron"
            size={13}
            aria-hidden="true"
          />
        </button>

        {menuAberto && (
          <div
            className="appearance-menu"
            role="group"
            aria-label="Escolher aparência do site"
          >
            <p className="appearance-menu-title">
              Aparência
            </p>

            <p className="appearance-menu-description">
              Personalize a visualização do Smart Locker.
            </p>

            <div className="appearance-options">
              {opcoesAparencia.map((opcao) => {
                const Icone = opcao.Icone;
                const selecionada = aparencia === opcao.valor;

                return (
                  <button
                    key={opcao.valor}
                    type="button"
                    className={`appearance-option ${
                      selecionada ? "is-selected" : ""
                    }`}
                    onClick={() =>
                      selecionarAparencia(opcao.valor)
                    }
                    aria-pressed={selecionada}
                  >
                    <span className="appearance-option-icon">
                      <Icone size={19} aria-hidden="true" />
                    </span>

                    <span className="appearance-option-text">
                      <span className="appearance-option-title">
                        {opcao.titulo}
                      </span>

                      <span className="appearance-option-description">
                        {opcao.descricao}
                      </span>
                    </span>

                    {selecionada && (
                      <Check
                        className="appearance-check"
                        size={18}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Controle de fonte permanece separado */}
      <button
        type="button"
        className={`accessibility-button font-button ${
          nivelFonte > 0 ? "active" : ""
        }`}
        onClick={handleAumentarFonte}
        title={titulosFonte[nivelFonte]}
        aria-label={titulosFonte[nivelFonte]}
      >
        {rotulosFonte[nivelFonte]}
      </button>
    </div>
  );
}

export default AccessibilityControls;
