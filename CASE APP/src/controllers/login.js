let urlServer1 = "";

async function init() {
  try {
    const response = await fetch("./src/db/data.json");
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
    const data = await response.json();
    urlServer1 = `https://${data.urlServer}`;
    document.getElementById("loginButton").addEventListener("click", login);
  } catch (error) {
    console.error("Erro ao carregar o JSON:", error);
  }
}

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
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

    const data = await response.json();

    if (data.success) {
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("menuItems", JSON.stringify(data.menuItems));
      sessionStorage.setItem("pageIndex", data.redirectURL);
      window.location.href = data.redirectURL;
    } else {
      alert("Credenciais inválidas");
    }
  } catch (error) {
    console.error("Erro durante o login:", error);
  }
}

init();
