let urlServer4 = "";

document.addEventListener("DOMContentLoaded", async function () {
  fetch("../db/data.json")
    .then((response) => response.json())
    .then(async (data) => {
      try {
        urlServer4 = "https://" + data.urlServer;
        const token = sessionStorage.getItem("token");
        const user = JSON.parse(sessionStorage.getItem("user"));
        const departamentosPermitidos = [0, 1, 2, 3];

        if (token) {
          fetchPedidos();
        }

        document.addEventListener("click", function (event) {
          handlePedidoClick(event);
        });

        function fetchPedidos() {
          fetch(`${urlServer4}/meus-pedidos`, {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Content-Type": "application/json",
              Authorization: token,
            },
          })
            .then((response) => response.json())
            .then((pedidos) => {
              const dataTable = $(".datanew").DataTable();

              pedidos.forEach((pedido) => {
                if (!pedido.assinaturaDir) return;

                const isAuthor = pedido.autor === user.username;
                const isNoDriver = pedido.condutor === "nenhum";

                const eyeI = getEyeIcon(pedido);
                const deleteI = `<a><img class="removePedido" data-pedidoId="${pedido.id}" data-contratoId="${pedido.contrato}" data-colaboradorId="${user.matricula}" src="../img/icons/delete.svg" alt="img" /></a>`;

                let actionsColumn = isAuthor && isNoDriver ? deleteI : eyeI;

                if (departamentosPermitidos.includes(user.departamento)) {
                  actionsColumn = isAuthor && isNoDriver ? `${eyeI}` : eyeI;
                }

                dataTable.row
                  .add([
                    `<label class="checkboxs"><input type="checkbox" /><span class="checkmarks"></span></label>`,
                    `PM${pedido.id}`,
                    pedido.contrato,
                    pedido.condutor,
                    pedido.data,
                    pedido.autor,
                    actionsColumn,
                  ])
                  .draw(false);
              });
            })
            .catch((error) =>
              console.error("Erro ao obter os pedidos do colaborador:", error)
            );
        }

        function getEyeIcon(pedido) {
          const eyeG = `<a><img class="infoPedido" data-pedidoId="${pedido.id}" data-contratoId="${pedido.contrato}" data-colaboradorId="${user.matricula}" src="../img/icons/eyeGreen.png" alt="img" /></a>`;
          const eyeN = `<a><img class="infoPedido" data-pedidoId="${pedido.id}" data-contratoId="${pedido.contrato}" data-colaboradorId="${user.matricula}" src="../img/icons/eye.svg" alt="img" /></a>`;

          if (
            (user.departamento === 1 && pedido.amoView === 0) ||
            (user.departamento === 2 && pedido.supView === 0) ||
            (user.departamento === 3 && pedido.dirView === 0)
          ) {
            return eyeG;
          } else if (
            user.departamento === 0 ||
            (user.departamento === 1 && pedido.amoView === 1) ||
            (user.departamento === 2 && pedido.supView === 1) ||
            (user.departamento === 3 && pedido.dirView === 1)
          ) {
            return eyeN;
          }
          return "";
        }

        function handlePedidoClick(event) {
          if (event.target.classList.contains("infoPedido")) {
            const pedidoId = event.target.dataset.pedidoid;
            window.location.href = `pedidoDeMaterial.html?id=${pedidoId}`;
          }

          if (event.target.classList.contains("removePedido")) {
            const pedidoId = event.target.dataset.pedidoid;
            const contratoId = event.target.dataset.contratoid;
            const colaboradorId = event.target.dataset.colaboradorid;
            excluirPedido(contratoId, colaboradorId, pedidoId);
          }
        }

        function excluirPedido(contrato, colaborador, idPedido) {
          if (confirm("Tem certeza de que deseja excluir este pedido?")) {
            fetch(
              `${urlServer4}/deletar-pedido/${contrato}/${colaborador}/${idPedido}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: sessionStorage.getItem("token"),
                },
              }
            )
              .then((response) => {
                if (response.ok) {
                  console.log("Pedido excluído com sucesso.");
                  window.location.reload(true);
                } else {
                  throw new Error(
                    `Erro ao excluir o pedido. Status: ${response.status}`
                  );
                }
              })
              .catch((error) => console.error(error.message));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar o JSON:", error);
      }
    });
});
