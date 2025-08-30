let urlServer2 = "";

document.addEventListener("DOMContentLoaded", async function () {
  fetch("../db/data.json")
    .then((response) => response.json())
    .then(async (data) => {
      try {
        urlServer2 = "https://" + data.urlServer;

        const token = sessionStorage.getItem("token");
        const user = JSON.parse(sessionStorage.getItem("user"));
        const departamentosPermitidos = [0, 1, 2, 3];

        if (token) {
          fetch(`${urlServer2}/meus-pedidos`, {
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

              pedidos.forEach((Obj) => {
                if (
                  String(Obj.assinaturaDir) === "NEGADO" ||
                  Obj.assinaturaDir === true ||
                  (user.departamento === 2 && Obj.assinaturaAmo === false) ||
                  (user.departamento === 3 && Obj.assinaturaSup === false)
                )
                  return;

                const isAuthor = Obj.autor === user.username;
                const isNoDriver = Obj.condutor === "nenhum";

                let eyeI = ``;
                const eyeG = `<a><img class="infoPedido" data-pedidoId="${Obj.id}" data-contratoId="${Obj.contrato}" data-colaboradorId="${user.matricula}" src="../img/icons/eyeGreen.png" alt="img" /></a>`;
                const eyeN = `<a><img class="infoPedido" data-pedidoId="${Obj.id}" data-contratoId="${Obj.contrato}" data-colaboradorId="${user.matricula}" src="../img/icons/eye.svg" alt="img" /></a>`;
                const deleteI = `<a><img class="removePedido" data-pedidoId="${Obj.id}" data-contratoId="${Obj.contrato}" data-colaboradorId="${user.matricula}" src="../img/icons/delete.svg" alt="img" /></a>`;

                if (
                  (user.departamento === 1 && Obj.amoView === 0) ||
                  (user.departamento === 2 && Obj.supView === 0) ||
                  (user.departamento === 3 && Obj.dirView === 0)
                ) {
                  eyeI = eyeG;
                } else if (
                  user.departamento === 0 ||
                  (user.departamento === 1 && Obj.amoView === 1) ||
                  (user.departamento === 2 && Obj.supView === 1) ||
                  (user.departamento === 3 && Obj.dirView === 1)
                ) {
                  eyeI = eyeN;
                }

                let actionsColumn =
                  isAuthor && isNoDriver ? `${deleteI}` : eyeI;

                if (departamentosPermitidos.includes(user.departamento)) {
                  actionsColumn =
                    isAuthor && isNoDriver ? `${eyeI}${deleteI}` : `${eyeI}`;
                }

                dataTable.row
                  .add([
                    `<label class="checkboxs"><input type="checkbox" /><span class="checkmarks"></span></label>`,
                    `PM${Obj.id}`,
                    Obj.contrato,
                    Obj.condutor,
                    Obj.data,
                    Obj.autor,
                    actionsColumn,
                  ])
                  .draw(false);
              });
            })
            .catch((error) =>
              console.error("Erro ao obter os pedidos do colaborador:", error)
            );
        }

        document.addEventListener("click", function (event) {
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
        });

        function excluirPedido(contrato, colaborador, idPedido) {
          if (confirm("Tem certeza de que deseja excluir este pedido?")) {
            fetch(
              `${urlServer2}/deletar-pedido/${contrato}/${colaborador}/${idPedido}`,
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
