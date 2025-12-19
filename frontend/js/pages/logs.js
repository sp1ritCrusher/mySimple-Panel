import { set_linkPermissions } from "../utils/validation.js";
import { getLogs, getLog } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  set_linkPermissions("user");
  const result = await getLogs();
  const params = new URLSearchParams(window.location.search);
  const log_id = params.get("id");
  const data = await result.json();
  const container = document.getElementById("logContainer");
  const select = document.querySelector("select");
  const form = document.getElementById("logsForm");
  const input = document.getElementById("searchLog");
  container.innerHTML = "";
  renderLogs(data.logs);
  let currentPage = 1;
  const itemsPerPage = 10;

  function translateClass(log) {
    if (log.includes("auth")) {
      return "Autenticação";
    } else if (log.includes("admin")) {
      return "Administrador";
    } else if (log.includes("user")) {
      return "Usuário";
    }
  }
//valida se o objeto recebido é um token ou um elemento comum
  function token_treatment(token) {
    const para =  document.getElementById("para");
    if(para.textContent.includes("token")) {
      para.innerHTML = `<a id="showContent">Clique aqui para ver o conteúdo</a>`;
      para.style.cursor = "pointer";
      para.addEventListener("click", async (e) => {
        e.preventDefault();
          alert(token);
      });
    }
    if (token.includes("Novo token")) {
      const display = token.slice(12, 40) + "...";
      return display;
  } else {
    return token;
  }
}

  async function render_selectedLog(log) {
    try {
      const result = await getLog(log); 
      document.getElementById("logsHeader").style.display = "none";
      container.style.display = "none";
      form.innerHTML = 
      `<div class="logInfo">
        <div class="usersHeader">
        <a href="./logs.html"><img class="icon" src="./assets/return.png" alt="Retornar"></a>
        <h2>Log</h2>
        </div>
        <p>Log ID: ${result.log._id}</p>
        <p>Acionador: ${result.log.actioner}</p>
        ${result.log.target? `<p>Alvo: ${result.log.target}</p>`: ""}
       <div class="logData">
       ${result.log.data? `<strong><p>Dados:</p><p id="para">${[result.log.data].flat().join("<br>")}</p></strong>`: ""}
       </div>
       <p>Data: ${new Date(result.log.date).toLocaleString()}</p>
       ${result.log.session? `<p>Sessão: ${result.log.session}</p>`: ""}
       <p>IP: ${result.log.ip}</p>
       </div>`;
      //
      token_treatment(result.log.data);
    } catch (error) {
    }
  }
  async function renderLogs(logs) {
    logs.forEach((log) => {
      const div = document.createElement("div");
      div.classList.add("logDiv");

      div.innerHTML = `
      <button type="button" data-id=${log._id} class="icon">i</button>
      <p>Classe: ${translateClass(log.type)}</p>
      <p>Log: ${log.action}</p>
      <p>Data: ${new Date(log.date).toLocaleString()}</p>
      <hr>
    `;

      container.appendChild(div);
    });
  }

  if (log_id) {
    render_selectedLog(log_id);
  } else {
    renderLogs(data.logs); // mostra todos
  }

  const p = document.createElement("p");
  form.insertAdjacentElement("afterbegin", p);

  select.addEventListener("change", () => {
    if (select.value === "all") {
      container.innerHTML = "";
      renderLogs(data.logs);
    }
    if (select.value === "admin") {
      const filtered = data.logs.filter((item) => item.type.includes("admin"));
      currentPage = 1;
      container.innerHTML = "";
      renderLogs(filtered);
    }
    if (select.value === "user") {
      const filtered = data.logs.filter((item) => item.type.includes("user"));
      currentPage = 1;
      container.innerHTML = "";
      renderLogs(filtered);
    }
    if (select.value === "auth") {
      const filtered = data.logs.filter((item) => item.type.includes("auth"));
      currentPage = 1;
      container.innerHTML = "";
      renderLogs(filtered);
    }
  });

  document.addEventListener("click", async (e) => {
    const btn = e.target.classList.contains("icon");
    if (!btn) return;
    const id = e.target.dataset.id;
    window.location.href = `?id=${id}`;
  });

  input.addEventListener("input", () => {
      const value = input.value.toLowerCase();
      container.innerHTML = "";
      const filtered = data.logs.filter((item) => {
      const id = String(item._id).toLowerCase();
      const type = String(item.type).toLowerCase();
      const log = String(item.log).toLowerCase();
      const dataField = String(item.data).toLowerCase();
      const session = String(item.session).toLowerCase();
      const date = String(new Date(item.date).toLocaleString());
      return ( id.includes(value) || type.includes(value) || log.includes(value) || dataField.includes(value) || session.includes(value) || date.includes(value) ); });
      renderLogs(filtered);

      if(filtered.length === 0) {
        container.innerHTML = "<p>Log não encontrado</p>";
      }
});
});
