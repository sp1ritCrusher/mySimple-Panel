  export function validateForm(name, email, password, phone) {
    const nameValid = name.value.length >= 6 && !name.value.includes(" ");
    const emailValid = /^[^@\s]+@[^@\s]+\.[^\s@]+$/.test(email.value);
    const passwordValid = /^(?=(?:.*\d){4,})(?=.*[A-Za-z]).{8,}$/.test(password.value.trim());
    const phoneValid = /^[0-9]{10,11}$/.test(phone.value);

    console.log({ nameValid, emailValid, passwordValid, phoneValid });
    return { nameValid, emailValid,  passwordValid, phoneValid };
  }

    export function validateLogin(email, password) {
    const emailValid = /^[^@\s]+@[^@\s]+\.[^\s@]+$/.test(email.value);
    const passwordValid = /^(?=(?:.*\d){4,})(?=.*[A-Za-z]).{8,}$/.test(password.value.trim()
    );
    return { emailValid, passwordValid };
    }

    export function showError(input, message) {
    let p = document.getElementById(`error-${input.id}`);
    {
      if (!p) {
        p = document.createElement("p");
        p.className = "error-msg";
        p.id = `error-${input.id}`;
        input.parentNode.insertBefore(p, input);
      }
      p.textContent = message;
    }
  }

   export function clearError(input) {
    let p = document.getElementById(`error-${input.id}`);
    console.log("cleaning", p, "from", input);
    if (p) p.remove();

  }

  export function showAlert(message) {
    return new Promise((resolve) => {
      const alertBox = document.getElementById("customAlert");
      const alertMsg = document.getElementById("alertMessage");
      const okButton = alertBox.querySelector("button");

      alertMsg.textContent = message;
      alertBox.style.display = "block";

      okButton.onclick = () => {
        alertBox.style.display = "none";
        resolve();
      };
    });
  }

  export function closeAlert() {
    const alertBox = document.getElementById("customAlert");
    if (alertBox) alertBox.style.display = "none";
  }
     window.closeAlert = closeAlert;

