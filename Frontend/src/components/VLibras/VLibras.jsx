import React, { useEffect } from "react";

export default function VLibras() {
  useEffect(() => {
    // Verifica se já existe para não duplicar
    if (document.getElementById("vlibras-script")) return;

    // 1. Cria o elemento principal que o VLibras procura no DOM
    const divContainer = document.createElement("div");
    divContainer.setAttribute("vw", "");
    divContainer.className = "enabled";

    // 2. Insere os elementos internos exigidos pelo widget
    divContainer.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="plugin-wrapper"></div>
      </div>
    `;

    document.body.appendChild(divContainer);

    // 3. Cria e adiciona o script oficial do VLibras
    const script = document.createElement("script");
    script.id = "vlibras-script";
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;

    script.onload = () => {
      // Inicializa o widget assim que o script estiver pronto
      if (window.VLibras) {
        new window.VLibras.Widget("https://vlibras.gov.br/app");
      }
    };

    document.body.appendChild(script);

    // Opcional: limpeza caso o componente seja desmontado
    return () => {
      // Mantemos o script ativo para garantir estabilidade nas rotas
    };
  }, []);

  return null;
}
