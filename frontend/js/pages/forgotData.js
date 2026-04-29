document.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const btn = document.getElementById("btn");

  email.addEventListener("input", () => {
    if (email.value.trim() === "") {
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }
  });

  btn.addEventListener("click", async () => {
    const res = await fetch("http://127.0.0.1:3000/forgotPass", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email: email.value}),
    });
    const data = await res.json();
    if(res.ok) {
      alert(data.message);
      window.location.href = "./validateCode.html"
    } else {
      alert(data.message);
    }
  });
});
