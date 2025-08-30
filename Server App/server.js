const chokidar = require("chokidar");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fsPromises = fs.promises;
//AES-128-ECB - case => base64

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Database (JSONS)
const ContratosPath = "./database/pedidos.json";
let contratos = {};

const usuariosPath = "./database/users.json";
let usuarios = {};

const colaboradoresPath = "./database/colaboradores.json";
let colaboradoresP = {};

const departamentoPath = "./database/departamentos.json";
let departamentoP = {};

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  console.error("JWT_SECRET não definido nas variáveis de ambiente.");
  process.exit(1);
}

async function recarregarDados() {
  try {
    const data0 = await fsPromises.readFile(ContratosPath, "utf-8");
    contratos = JSON.parse(data0);

    const data1 = await fsPromises.readFile(usuariosPath, "utf-8");
    usuarios = JSON.parse(data1);

    const data2 = await fsPromises.readFile(colaboradoresPath, "utf-8");
    colaboradoresP = JSON.parse(data2);

    const data3 = await fsPromises.readFile(departamentoPath, "utf-8");
    departamentoP = JSON.parse(data3);

    console.log("Dados recarregados com sucesso!");
  } catch (error) {
    console.error("Erro ao recarregar dados:", error);
  }
}

recarregarDados();

// Rota de login
app.post("/login", (req, res) => {
  const { matricula, senha } = req.body;

  // Verificar se as credenciais são válidas
  if (usuarios[matricula] && usuarios[matricula].password === senha) {
    const token = generateToken(matricula);
    const colaboradorInfo = colaboradoresP[matricula];
    const userLocal = {
      username: colaboradorInfo.nome,
      departamento: colaboradorInfo.departamento,
      email: colaboradorInfo.email,
      matricula: colaboradorInfo.matricula,
    };

    const menuItems = getMenuItemsPorDepartamento(colaboradorInfo.departamento);

    const urlSpawn = `src/pages/${
      departamentoP.departamentos[userLocal.departamento].urlSpawn
    }.html`;
    const pagePath = urlSpawn || departamentoP.defaultURL;

    res.json({
      success: true,
      token,
      user: userLocal,
      menuItems,
      redirectURL: pagePath,
    });
  } else {
    res.status(401).json({ success: false, message: "Credenciais inválidas" });
  }
});

// Rota para adicionar pedidos
app.post("/adicionar-pedido", verifyToken, async (req, res) => {
  try {
    const { contrato, colaborador, pedido, id } = req.body;

    if (!contratos.contratos[contrato]) {
      contratos.contratos[contrato] = {
        colaboradores: {
          [colaborador]: {
            pedidos: [],
          },
        },
      };
    }

    if (!contratos.contratos[contrato].colaboradores[colaborador]) {
      contratos.contratos[contrato].colaboradores[colaborador] = {
        pedidos: [],
      };
    }

    // Garantir que pedidos seja um array
    if (
      !Array.isArray(
        contratos.contratos[contrato].colaboradores[colaborador].pedidos
      )
    ) {
      contratos.contratos[contrato].colaboradores[colaborador].pedidos = [];
    }

    // Adicionar o novo pedido ao array de pedidos
    contratos.contratos[contrato].colaboradores[colaborador].pedidos.push(
      pedido
    );

    contratos.count = id;

    await fsPromises.writeFile(
      ContratosPath,
      JSON.stringify(contratos, null, 2)
    );

    res.json(contratos);
  } catch (error) {
    console.error("Erro interno ao processar a solicitação:", error);
    res.status(500).send("Erro interno no servidor");
  }
});

// Rota para assinar e enviar informações atualizadas
app.post("/assinar-pedido", verifyToken, async (req, res) => {
  try {
    const { contrato, colaborador, idPedido, quantidadesAtualizadas } =
      req.body;

    const pedido = contratos.contratos[contrato]?.colaboradores[
      colaborador
    ]?.pedidos.find((p) => Number(p.id) === Number(idPedido));

    if (pedido) {
      // Atualize as quantidades conforme fornecido
      quantidadesAtualizadas.forEach((atualizacao) => {
        const { index, novaQuantidade, novaUni } = atualizacao;
        if (quantidadesAtualizadas[0].diretoria === true) {
          pedido.assinaturaDir = true;
          pedido.dirView = 1;
        } else if (String(quantidadesAtualizadas[0].diretoria) === "n") {
          pedido.assinaturaDir = "NEGADO";
          pedido.dirView = 1;
        }
        if (pedido.pedidos[index]) {
          if (novaQuantidade === undefined) {
            pedido.pedidos[index].valorUni = novaUni;
            pedido.assinaturaSup = true;
            pedido.supView = 1;
          } else {
            pedido.pedidos[index].quantidade = novaQuantidade;
            pedido.assinaturaAmo = true;
            pedido.amoView = 1;
          }
        }
      });

      // Salve as alterações no arquivo JSON
      await fsPromises.writeFile(
        ContratosPath,
        JSON.stringify(contratos, null, 2)
      );

      res.json({ message: "Pedido assinado com sucesso." });
    } else {
      res.status(404).json({ error: "Pedido não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao assinar o pedido:", error);
    res.status(500).send("Erro interno no servidor");
  }
});

// Ver contratos
app.get("/contratos", (req, res) => {
  let contratosList = [];
  try {
    for (const contratoId in contratos.contratos) {
      contratosList.push(contratoId);
    }

    res.json(contratosList);
  } catch (error) {
    console.error("Erro ao obter os pedidos do colaborador:", error);
    res.status(500).send("Erro interno no servidor");
  }
});

// Rota para obter departamento
app.get("/departamento/:id", (req, res) => {
  const departamentoId = req.params.id;
  const departamento = departamentoP.departamentos[departamentoId].name;

  if (departamento) {
    res.json(departamento);
  } else {
    res.status(404).json({ error: "Departamento não encontrado" });
  }
});

// Rota para quantidade de pedidos
app.get("/quantidade-pedidos", (req, res) => {
  const count = contratos.count;
  const idPedido = count + 1;

  res.json({ idPedido });
});

// Rota para obter pedidos do colaborador logado em todos os contratos
app.get("/meus-pedidos", verifyToken, (req, res) => {
  try {
    const colaboradorId = req.matricula;
    const departamentoId = colaboradoresP[colaboradorId].departamento;

    const pedidosDoColaborador = [];

    // Iterar sobre todos os contratos para encontrar os pedidos do colaborador
    for (const contratoId in contratos.contratos) {
      if (contratos.contratos.hasOwnProperty(contratoId)) {
        const contrato = contratos.contratos[contratoId];

        // Se o departamento for igual a 1, exiba todos os pedidos
        if (
          departamentoId === 1 ||
          departamentoId === 2 ||
          departamentoId === 3
        ) {
          for (const colaboradorId in contrato.colaboradores) {
            const pedidos = contrato.colaboradores[colaboradorId].pedidos;
            // Adicionar os pedidos ao array geral
            pedidosDoColaborador.push(...pedidos);
          }
        } else {
          // Verificar se o colaborador tem pedidos no contrato atual
          if (contrato.colaboradores[colaboradorId]) {
            const pedidos = contrato.colaboradores[colaboradorId].pedidos;
            // Adicionar os pedidos ao array geral
            pedidosDoColaborador.push(...pedidos);
          }
        }
      }
    }

    res.json(pedidosDoColaborador);
  } catch (error) {
    console.error("Erro ao obter os pedidos do colaborador:", error);
    res.status(500).send("Erro interno no servidor");
  }
});

// Rota para listagem de pedidos Editar Pedido - Almoxarife
app.get("/pedido/:contrato/:colaborador/:pedidoId", verifyToken, (req, res) => {
  const { contrato, colaborador, pedidoId } = req.params;

  try {
    const pedido = contratos.contratos[contrato]?.colaboradores[
      colaborador
    ]?.pedidos.find((p) => p.id === pedidoId);

    if (pedido) {
      res.json(pedido);
    } else {
      res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao ler dados de pedidos:", error);
    res.status(500).send("Erro interno no servidor");
  }
});

// Rota para obter detalhes do pedido com base no ID
app.get("/detalhes-pedido/:id", verifyToken, (req, res) => {
  try {
    const pedidoId = Number(req.params.id);

    // Ler o arquivo de pedido

    let detalhesDoPedido = null;

    // Iterar sobre os contratos e colaboradores para encontrar o pedido com o ID fornecido
    for (const contratoId in contratos.contratos) {
      if (contratos.contratos.hasOwnProperty(contratoId)) {
        const contrato = contratos.contratos[contratoId];

        for (const colaboradorId in contrato.colaboradores) {
          if (contrato.colaboradores.hasOwnProperty(colaboradorId)) {
            const pedidos = contrato.colaboradores[colaboradorId].pedidos;

            // Encontrar o pedido com base no ID
            const pedidoEncontrado = pedidos.find(
              (pedido) => pedido.id === pedidoId
            );

            if (pedidoEncontrado) {
              detalhesDoPedido = pedidoEncontrado;
              break;
            }
          }
        }

        if (detalhesDoPedido) {
          break;
        }
      }
    }

    // Se o pedido não for encontrado, você pode retornar uma resposta adequada
    if (!detalhesDoPedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Enviar detalhes do pedido como resposta
    res.json(detalhesDoPedido);
  } catch (error) {
    console.error("Erro ao obter detalhes do pedido:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.delete(
  "/deletar-pedido/:contrato/:colaborador/:idPedido",
  verifyToken,
  async (req, res) => {
    try {
      const { contrato, colaborador, idPedido } = req.params;

      const data = await fsPromises.readFile(ContratosPath, "utf-8");
      const contratos = JSON.parse(data);

      // Verificar se o contrato e o colaborador existem
      if (
        contratos.contratos[contrato] &&
        contratos.contratos[contrato].colaboradores[colaborador]
      ) {
        // Obter a lista de pedidos do colaborador
        const pedidos =
          contratos.contratos[contrato].colaboradores[colaborador].pedidos;

        // Encontrar o índice do pedido com base no ID fornecido
        const index = pedidos.findIndex(
          (pedido) => pedido.id === parseInt(idPedido)
        );

        // Se o índice for encontrado, remover o pedido
        if (index !== -1) {
          pedidos.splice(index, 1);

          // Salvar as alterações no arquivo JSON
          await fsPromises.writeFile(
            ContratosPath,
            JSON.stringify(contratos, null, 2)
          );

          res.json({ message: "Pedido excluído com sucesso." });
        } else {
          res.status(404).json({ error: "Pedido não encontrado." });
        }
      } else {
        res
          .status(404)
          .json({ error: "Contrato ou colaborador não encontrado." });
      }
    } catch (error) {
      console.error("Erro ao excluir o pedido:", error);
      res.status(500).send("Erro interno no servidor");
    }
  }
);

const watcher = chokidar.watch([usuariosPath, colaboradoresPath], {
  ignoreInitial: true,
});

// Adicione um evento para recarregar os dados quando os arquivos forem alterados
watcher.on("change", (path) => {
  console.log(`Arquivo alterado: ${path}`);
  recarregarDados();
});

// Função para gerar um token JWT
function generateToken(matricula) {
  return jwt.sign({ matricula }, secretKey, { expiresIn: "24h" });
}

// Middleware para verificar o token em rotas protegidas
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "Token não fornecido" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Falha na autenticação do token" });
    }

    req.matricula = decoded.matricula;
    next();
  });
}

function getMenuItemsPorDepartamento(departamento) {
  // departamento
  const menuPorDepartamento =
    departamentoP.departamentos[departamento].permission;

  return menuPorDepartamento || [];
}

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
