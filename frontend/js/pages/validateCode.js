import { getUser } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const code = document.getElementById("code");
  const btn = document.getElementById("btn");
  const resendbtn = document.getElementById("resend");
  btn.disabled = true;
  code.addEventListener("input", () => {
    if (code.value.trim() !== "") {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  });

  resendbtn.addEventListener("click", async () => {
    const result = await fetch("http://127.0.0.1:3000/resendCode", {
      method: "GET",
      credentials: "include",
      headers: {
          "Content-Type": "application/json",
      },
      });
      if(result.ok) {
      alert("Codigo reenviado com sucesso");
      } else {
        const data = await result.json();
        alert(data.message);
        window.location.href = "./index.html";
      }
  });

  btn.addEventListener("click", async () => {
        const request = await fetch("http://127.0.0.1:3000/validateCode", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: code.value }),
        });
        const data = await request.json();
        console.log(request);
        console.log(data);
        if (request.ok) {
        alert("Código validado com sucesso");
        window.location.href = "./changePass.html";
      } else {
        alert(data);
      }
  });
});
