import { loadLink } from "../utils/validation.js";

/* Painel Administrativo */

document.addEventListener("DOMContentLoaded", async () => {

loadLink("admin");
const params = new URLSearchParams(window.location.search);;
const admin_userPanelbtn = document.getElementById("userPanel");
const admin_productPanelbtn = document.getElementById("productPanel");

admin_userPanelbtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "./userControl.html";
});

admin_productPanelbtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "./productControl.html";
});


});
