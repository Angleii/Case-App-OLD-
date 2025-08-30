let urlServera = "";

document.addEventListener("DOMContentLoaded", async function () {
  fetch("../db/data.json")
    .then((response) => response.json())
    .then(async (data) => {
      try {
        urlServera = "https://" + data.urlServer;
        const user = JSON.parse(sessionStorage.getItem("user"));
        const allowedMainItems = user
          ? getAllowedMainItems(user.departamento)
          : [];
        hideMainItems(allowedMainItems);

        function getAllowedMainItems(departamento) {
          if (departamento === 3) return getAllMainItems();
          const mainMenuVisibilityRules = {
            0: ["Pedidos", "Configurações"],
            1: ["Pedidos De Material", "Configurações"],
            2: ["Suprimentos", "Configurações"],
            3: ["Pedidos", "Configurações"],
          };
          return mainMenuVisibilityRules[departamento] || [];
        }

        try {
          const response = await fetch(
            `${urlServera}/departamento/${user.departamento}`,
            {
              headers: {
                "ngrok-skip-browser-warning": "69420",
              },
            }
          );
          if (!response.ok)
            throw new Error(
              `Erro ao obter informações do departamento: ${response.statusText}`
            );
          const departamento = await response.json();
          atualizarInformacoesPerfil(user.username, departamento);
        } catch (error) {
          console.error(error);
        }
      } catch (error) {
        console.error("Erro ao carregar o JSON:", error);
      }
    });

  function getAllMainItems() {
    const mainMenuItems = document.querySelectorAll("#sidebar-menu > ul > li");
    return Array.from(mainMenuItems).map((item) =>
      item.textContent.trim().split("\n")[0].trim()
    );
  }

  function hideMainItems(allowedItems) {
    const mainMenuItems = document.querySelectorAll("#sidebar-menu > ul > li");
    mainMenuItems.forEach((item) => {
      const itemName = item.textContent.trim().split("\n")[0].trim();
      if (!allowedItems.includes(itemName)) item.style.display = "none";
    });
  }

  function atualizarInformacoesPerfil(novoNome, novoCargo) {
    var profileSetsContainer = document.getElementById("profileContainer");

    if (profileSetsContainer) {
      var profileSetsElement =
        profileSetsContainer.querySelector(".profilesets");

      if (profileSetsElement) {
        profileSetsElement.querySelector("h6").textContent = novoNome;
        profileSetsElement.querySelector("h5").textContent = novoCargo;
      } else {
        console.error(
          'Elemento com a classe "profilesets" não encontrado dentro do container.'
        );
      }
    } else {
      console.error('Container com o ID "profileContainer" não encontrado.');
    }
  }
});
