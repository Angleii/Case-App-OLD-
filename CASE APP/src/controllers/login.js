let urlServer1 = "";

fetch("./src/db/data.json")
  .then((response) => response.json())
  .then(async (data) => {
    try {
      urlServer1 = "https://" + data.urlServer;
      document.getElementById("loginButton").addEventListener("click", login);

      async function login() {
        const matricula = document.getElementById("emailMatricula").value;
        const senha = document.getElementById("senha").value;

        try {
          const response = await fetch(`${urlServer1}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ matricula, senha }),
          });

          const data = await response.json();

          if (data.success) {
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data.user));
            sessionStorage.setItem("menuItems", data.menuItems);
            sessionStorage.setItem("pageIndex", data.redirectURL);
            window.location.href = data.redirectURL;
          } else {
            alert("Credenciais inválidas");
          }
        } catch (error) {
          console.error("Erro durante o login:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar o JSON:", error);
    }
  });
