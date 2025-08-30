const fs = require("fs/promises");
const path = require("path");

let urlServer = "";

async function fetchUrl() {
  const apiUrl = "https://api.ngrok.com/endpoints";
  const token = process.env.NGROK_API_TOKEN;

  if (!token) {
    console.error("NGROK_API_TOKEN não definido nas variáveis de ambiente");
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Ngrok-Version": 2,
      },
    });

    const data = await response.json();
    if (!data.endpoints || data.endpoints.length === 0) {
      console.error("Nenhum endpoint encontrado na API Ngrok");
      return;
    }

    urlServer = String(data.endpoints[0].hostport);
  } catch (error) {
    console.error(error);
  }
}

function getUrl() {
  return urlServer;
}

async function saveToJson() {
  const jsonData = {
    urlServer: getUrl(),
    timestamp: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, "data.json");

  try {
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
    console.log("Data foi salva em data.json");
  } catch (error) {
    console.error("Error ao salvar data em data.json:", error);
  }
}

async function initialize() {
  await fetchUrl();
  const url = getUrl();
  urlServer = url;

  await saveToJson();

  setInterval(saveToJson, 10 * 60 * 1000);
}

initialize();

module.exports = { initialize };
