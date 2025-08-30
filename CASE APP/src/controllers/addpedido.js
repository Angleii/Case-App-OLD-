let urlServer = "";

document.addEventListener("DOMContentLoaded", async function () {
  fetch("../db/data.json")
    .then((response) => response.json())
    .then(async (data) => {
      try {
        urlServer = "https://" + data.urlServer;

        const user = JSON.parse(sessionStorage.getItem("user")).departamento;
        const arrayDep = [
          "pedidoDeCompra.html",
          "listmaterial.html",
          "solicitcompra.html",
        ];

        let idT, pagelink;

        pagelink = arrayDep[user];
        if (arrayDep[user] === undefined) pagelink = arrayDep[0];
        const adicionarItemBtn = document.getElementById("adicionarItemBtn");
        const concluirButton = document.getElementById("concluirBtn");
        const cancelarButton = document.getElementById("cancelarBtn");
        const listaItens = document.getElementById("listaItens");
        const modeloItem = document.getElementById("modeloItem");
        let nName = 0;

        adicionarItemBtn.addEventListener("click", function () {
          nName += 0.0001;
          const novoItem = modeloItem.cloneNode(true);
          novoItem.style.display = "block";
          const cardBody = novoItem.querySelector(".card-body");

          novoItem
            .querySelectorAll("[name]")
            .forEach((input) => (input.name = input.name));

          const removerItemBtn = document.createElement("button");
          removerItemBtn.innerText = "Remover Item";
          removerItemBtn.classList = "btn btn-submit me-2";
          removerItemBtn.addEventListener("click", () =>
            listaItens.removeChild(novoItem)
          );
          cardBody.appendChild(removerItemBtn);
          listaItens.appendChild(novoItem);
        });

        fetch(`${urlServer}/contratos`, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            const arrayContratos = Object.values(data);
            console.log(arrayContratos)
            const selectElement = document.getElementById("contratos-select");
            arrayContratos.forEach((contrato) => {
              console.log(contrato)
              const option = document.createElement("option");
              option.text = contrato;
              option.value = contrato;
              selectElement.add(option);
            });
          })
          .catch((error) => {
            console.error("Erro ao obter contratos:", error);
            // Trate o erro conforme necessário
          });
        concluirButton.addEventListener("click", function (event) {
          event.preventDefault();

          fetch(`${urlServer}/quantidade-pedidos`, {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "69420",
            },
          })
            .then((response) => response.json())
            .then((data) => {
              idT = data.idPedido;
              const contrato =
                document.querySelector('[name="contrato"]').value;
              const condutor = "nenhum";
              const autor = JSON.parse(sessionStorage.getItem("user")).username;
              const timestamp = obterDataAtualFormatada();

              const contratoS = document.querySelector('[name="contrato"]');

              if (contratoS.options.selectedIndex === 0) {
                alert("Por favor, selecione uma opção válida para o contrato.");
                return;
              }

              console.log(idT);
              // Crie um FormData específico para o formulário principal
              const formData = new FormData(
                document.getElementById("pedidoForm")
              );
              const novoPedido = {
                id: idT,
                response: JSON.parse(sessionStorage.getItem("user")).matricula,
                contrato: contrato,
                condutor: condutor,
                autor: autor,
                data: timestamp,
                assinaturaAmo: false,
                amoView: 0,
                assinaturaSup: false,
                supView: 0,
                assinaturaDir: false,
                dirView: 0,
                pedidos: [],
              };

              // Adicione os dados dos itens adicionados
              const itensAdicionados = document.querySelectorAll(
                "#listaItens .card-body"
              );
              itensAdicionados.forEach((item, index) => {
                const formDataItem = new FormData(item.querySelector("form"));

                // Converta FormData para um objeto
                const itemData = {};
                formDataItem.forEach((value, key) => {
                  itemData[key] = value;
                  if (key === "quantidade") {
                    itemData.quantidade_original = value;
                  }
                });
                itemData.valorUni = 0;
                itemData.fornecedor = "";

                novoPedido.pedidos.push(itemData);
              });

              const colaboradorId = JSON.parse(
                sessionStorage.getItem("user")
              ).matricula;
              const contratoId = formData.get("contrato");
              const token = sessionStorage.getItem("token");

              // Verifique se o token está presente
              if (!token) {
                console.error(
                  "Token não encontrado. O usuário não está autenticado."
                );
                return;
              }

              console.log('teste')
              // Enviar a solicitação POST para adicionar o novo pedido
              fetch(`${urlServer}/adicionar-pedido`, {
                method: "POST",
                headers: {
                  "ngrok-skip-browser-warning": "69420",
                  "Content-Type": "application/json",
                  Authorization: token, // Inclua o token no cabeçalho
                },
                body: JSON.stringify({
                  contrato: contratoId,
                  colaborador: colaboradorId,
                  pedido: novoPedido,
                  id: idT,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log('teste')
                  console.log("Novo pedido adicionado:", data);

                  window.location.href = `${pagelink}`;
                })
                .catch((error) => {
                  console.log('teste')
                  console.error("Erro ao adicionar o pedido:", error);
                });
            })
            .catch((error) => {
              console.error("Erro ao analisar count:", error);
            });
        });

        cancelarButton.addEventListener(
          "click",
          () => (window.location.href = `${pagelink}`)
        );
      } catch (error) {
        console.error("Erro ao carregar o JSON:", error);
      }
    });

  function obterDataAtualFormatada() {
    // Get date for save data
    const dataAtual = new Date();

    const dia = String(dataAtual.getDate()).padStart(2, "0");
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const ano = dataAtual.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }
});
