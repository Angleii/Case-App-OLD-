let urlServer3 = "";

document.addEventListener("DOMContentLoaded", async function () {
  fetch("../db/data.json")
    .then((response) => response.json())
    .then(async (data) => {
      try {
        urlServer3 = "https://" + data.urlServer;

        let pagelink;

        const user = JSON.parse(sessionStorage.getItem("user")).departamento;
        const arrayDep = [
          "pedidoDeCompra.html",
          "listmaterial.html",
          "solicitcompra.html",
        ];
        const bv = document.getElementById("buttonVoltar");

        pagelink = arrayDep[user];
        if (arrayDep[user] === undefined) pagelink = arrayDep[0];
        bv.href = pagelink;

        const obterParametroDaURL = (nome) =>
          new URLSearchParams(window.location.search).get(nome);

        let tudoValor = 0;
        let diretoria = false;

        // Obter o id da URL
        const idDoPedido = obterParametroDaURL("id");
        const token = sessionStorage.getItem("token");
        const dpUsuario = JSON.parse(
          sessionStorage.getItem("user")
        ).departamento;

        // Fazer solicitação ao servidor para obter detalhes do pedido
        fetch(`${urlServer3}/detalhes-pedido/${idDoPedido}`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Content-Type": "application/json",
            Authorization: token, // Inclua o token no cabeçalho
          },
        })
          .then((response) => response.json())
          .then((detalhesDoPedido) => {
            let assiAmo = detalhesDoPedido.assinaturaAmo;
            let assiSup = detalhesDoPedido.assinaturaSup;
            let assiDir = detalhesDoPedido.assinaturaDir;

            let count = 0;
            let descript = "";

            const divD = document.getElementById("destino");
            const p = document.createElement("p");
            p.innerHTML = `<strong>Destino:</strong><br />${detalhesDoPedido.contrato}</p>`;
            divD.appendChild(p);
            let td4, td5;

            detalhesDoPedido.pedidos.forEach((d, index) => {
              if (
                (Number(d.quantidade) === 0 && dpUsuario === 2) ||
                (Number(d.quantidade) === 0 && dpUsuario === 3)
              ) {
                return;
              }
              count++;

              const div = document.getElementById("itens");
              const tr = document.createElement("tr");

              const td1 = document.createElement("td");
              td1.innerHTML = count;

              const td2 = document.createElement("td");
              td2.innerHTML = d.nome;

              const td3 = document.createElement("td");

              const tdDesc = document.createElement("td");
              tdDesc.innerHTML = d.descricao;

              const tdForne = document.createElement("td");

              if (
                dpUsuario === 0 ||
                (dpUsuario === 1 && assiDir === true) ||
                (dpUsuario === 1 && String(assiDir) === "NEGADO")
              ) {
                if (d.quantidade === d.quantidade_original) {
                  td3.innerHTML = `Pedido ${d.quantidade_original}`;
                } else {
                  td3.innerHTML = `Pedido ${d.quantidade_original} | Estoque: ${d.quantidade}`;
                }
              } else if (assiAmo === true) {
                td3.innerHTML = parseFloat(
                  String(d.quantidade).replace(",", ".")
                );
              } else {
                const inputQuantidade = document.createElement("input");
                inputQuantidade.type = "text";
                inputQuantidade.value = parseFloat(
                  String(d.quantidade).replace(",", ".")
                );
                inputQuantidade.id = `quantidade_${index}`;
                td3.appendChild(inputQuantidade);

                inputQuantidade.addEventListener("input", function () {
                  const valorAtual = parseFloat(inputQuantidade.value);

                  if (valorAtual > d.quantidade) {
                    inputQuantidade.value = parseFloat(
                      String(d.quantidade).replace(",", ".")
                    );
                  }
                });
              }

              td4 = document.createElement("td");
              let valueM;

              if (assiSup === true) {
                const teste = parseFloat(String(d.valorUni).replace(",", "."));
                td4.innerHTML = teste.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                });

                tdForne.innerHTML = d.fornecedor;
                valueM = d.valorUni;
              } else {
                const inputUni = document.createElement("input");
                inputUni.type = "text";
                inputUni.id = `precoUni_${index}`;
                td4.appendChild(inputUni);

                const inputForne = document.createElement("input");
                inputForne.type = "text";
                inputForne.id = `forne_${index}`;
                tdForne.appendChild(inputForne);

                if (String(d.quantidade) === "n") {
                  inputUni.value = 0;
                  inputUni.disabled = true;
                }

                valueM = inputUni.value;
              }

              td5 = document.createElement("td");
              if (valueM === "") {
                valueM = 1;
              }
              let valorUni = 0;
              if (d.quantidade !== "n") {
                valorUni =
                  parseFloat(String(d.quantidade).replace(",", ".")) *
                  parseFloat(String(valueM).replace(",", "."));
              } else {
                valorUni = 0;
              }
              td5.innerHTML = valorUni.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });

              tudoValor = tudoValor + valorUni;

              if (count === 1) {
                descript += `Item (${count}) - ${d.descricao}`;
              } else {
                descript += `<br>Item (${count}) - ${d.descricao}`;
              }

              if (String(d.quantidade) === "n") {
                td1.style.color = "red";
                td2.style.color = "red";
                td3.style.color = "red";
                td3.innerHTML = "NEGADO";
                td4.style.color = "red";
                td5.style.color = "red";
              }
              tr.appendChild(td1);
              tr.appendChild(td2);
              tr.appendChild(td3);
              tr.appendChild(tdDesc);

              if (assiDir === true || String(assiDir) === "NEGADO") {
                const title = document.getElementById("titleT");
                title.innerHTML = "Ordem de Compra";
                tr.appendChild(td4);
                tr.appendChild(tdForne);
                tr.appendChild(td5);
                const totalTudo = document.getElementById("totalTudo");

                totalTudo.innerHTML = `<strong>Total da Ordem:</strong> ${tudoValor.toLocaleString(
                  "pt-BR",
                  { style: "currency", currency: "BRL" }
                )}`;
              } else if (assiDir === false) {
                if (dpUsuario === 1 || dpUsuario === 0) {
                  const precoUnitarioTh = document.getElementById("precoUni");
                  const totalTh = document.getElementById("totalUni");
                  const totalTudo = document.getElementById("totalTudo");

                  precoUnitarioTh.style.display = "none";
                  totalTh.style.display = "none";
                  totalTudo.style.display = "none";
                } else if (dpUsuario === 2) {
                  const title = document.getElementById("titleT");
                  title.innerHTML = "Autorização de Compra";
                  tr.appendChild(td4);
                  tr.appendChild(tdForne);
                  const totalTh = document.getElementById("totalUni");
                  const totalTudo = document.getElementById("totalTudo");
                  totalTh.style.display = "none";
                  totalTudo.style.display = "none";
                } else if (dpUsuario === 3) {
                  tr.appendChild(td4);
                  tr.appendChild(tdForne);
                  tr.appendChild(td5);
                  const title = document.getElementById("titleT");
                  title.innerHTML = "Ordem de Compra";
                  const totalTudo = document.getElementById("totalTudo");

                  totalTudo.innerHTML = `<strong>Total da Ordem:</strong> ${tudoValor.toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )}`;
                }
              }

              div.appendChild(tr);
            });

            document.getElementById("obs").innerHTML = descript;

            const divAssinatura =
              dpUsuario === 1
                ? document.getElementById("amo")
                : dpUsuario === 2
                ? document.getElementById("sup")
                : dpUsuario === 3
                ? document.getElementById("dir")
                : null;

            const buttonAssinatura = document.createElement("button");
            buttonAssinatura.innerHTML = "ASSINAR";

            const buttonNegar = document.createElement("button");
            buttonNegar.innerHTML = "NÃO AUTORIZADO";

            // Verificar departamento do usuário e decidir onde adicionar o botão
            if (dpUsuario === 1) {
              divAssinatura.appendChild(buttonAssinatura);
            } else if (dpUsuario === 2) {
              divAssinatura.appendChild(buttonAssinatura);
            } else if (dpUsuario === 3) {
              divAssinatura.appendChild(buttonAssinatura);

              divAssinatura.appendChild(buttonNegar);
              buttonNegar.style.marginTop = "20px";
            }

            if (dpUsuario !== 3) {
              buttonNegar.style.display = "none";
            }

            if (assiAmo === true) {
              divAssinaturaAmo = document.getElementById("amo");
              adicionarAssinatura(divAssinaturaAmo);

              if (dpUsuario === 1) {
                buttonAssinatura.remove();
              }
            }

            if (assiSup === true) {
              divAssinaturaAmo = document.getElementById("sup");
              adicionarAssinatura(divAssinaturaAmo);

              if (dpUsuario === 1 || dpUsuario === 2) {
                buttonAssinatura.remove();
              }
            }

            if (assiDir === true || String(assiDir) === "NEGADO") {
              if (String(assiDir) !== "NEGADO") {
                divAssinaturaAmo = document.getElementById("dir");

                adicionarAssinatura(divAssinaturaAmo);
              }

              if (dpUsuario === 1 || dpUsuario === 2 || dpUsuario === 3) {
                buttonAssinatura.remove();
                buttonNegar.remove();
              }
            }

            buttonAssinatura.addEventListener("click", function (event) {
              if (dpUsuario === 3) {
                diretoria = true;
              }

              realizarAssinatura(divAssinatura, detalhesDoPedido, diretoria);
              desabilitarCamposQuantidade();
              buttonAssinatura.remove();
              buttonNegar.remove();
            });

            buttonNegar.addEventListener("click", function (event) {
              diretoria = "n";
              realizarAssinatura(divAssinatura, detalhesDoPedido, diretoria);
              desabilitarCamposQuantidade();
              buttonAssinatura.remove();
              buttonNegar.remove();
            });

            if (String(assiDir) === "NEGADO") {
              const denied = document.createElement("img");
              denied.src = "../img/denied.png";
              denied.id = "denied";
              document.body.appendChild(denied);
            }
          })
          .catch((error) => {
            console.error("Erro ao obter detalhes do pedido:", error);
          });

        function adicionarAssinatura(divContainer) {
          const assinatura = document.createElement("img");
          assinatura.classList.add("imgAss");
          assinatura.src = "../assinatura.png";

          const divs = divContainer.getElementsByTagName("p");
          const posicaoInsercao = Math.floor(divs.length / 3);
          divContainer.insertBefore(assinatura, divs[posicaoInsercao]);
        }

        function realizarAssinatura(divContainer, detalhesDoPedido, diretoria) {
          if (String(diretoria) !== "n") {
            adicionarAssinatura(divContainer);
          }

          // Desabilita os campos de quantidade
          desabilitarCamposQuantidade();

          // Envia as informações atualizadas e a assinatura para o servidor
          enviarInformacoesAssinatura(detalhesDoPedido, diretoria);
        }

        function enviarInformacoesAssinatura(detalhesDoPedido, diretoria) {
          const quantidadesAtualizadas = [];
          const fornecedor = [];

          const camposQuantidade = document.querySelectorAll(
            '[id^="quantidade_"]'
          );
          camposQuantidade.forEach((campo, index) => {
            quantidadesAtualizadas.push({
              index,
              novaQuantidade: campo.value,
            });
          });

          const camposForne = document.querySelectorAll('[id^="forne_"]');
          camposForne.forEach((campo) => {
            fornecedor.push(campo.value);
          });

          const camposUni = document.querySelectorAll('[id^="precoUni_"]');
          camposUni.forEach((campo, index) => {
            quantidadesAtualizadas.push({
              index,
              novaUni: campo.value,
              fornecedor: fornecedor[index],
            });
          });

          if (diretoria === true) {
            quantidadesAtualizadas.push({ diretoria: diretoria });
          } else if (String(diretoria) === "n") {
            quantidadesAtualizadas.push({ diretoria: diretoria });
          }

          fetch(`${urlServer3}/assinar-pedido`, {
            method: "POST",
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Content-Type": "application/json",
              Authorization: token, // Inclua o token no cabeçalho
            },
            body: JSON.stringify({
              contrato: detalhesDoPedido.contrato,
              colaborador: detalhesDoPedido.response,
              idPedido: idDoPedido,
              quantidadesAtualizadas: quantidadesAtualizadas,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data.message);
            })
            .catch((error) => {
              console.error("Erro ao assinar o pedido:", error);
            });
        }

        function desabilitarCamposQuantidade() {
          const camposQuantidade = document.querySelectorAll(
            '[id^="quantidade_"]'
          );
          camposQuantidade.forEach((campo) => {
            campo.disabled = true;
          });
          const camposUni = document.querySelectorAll(
            '[id^="precoUni_"]'
          );
          camposUni.forEach((campo) => {
            campo.disabled = true;
          });
          const camposForne = document.querySelectorAll(
            '[id^="forne_"]'
          );
          camposForne.forEach((campo) => {
            campo.disabled = true;
          });
        }
      } catch (error) {
        console.error("Erro ao carregar o JSON:", error);
      }
    });
});
