/* API client-side */

// Registro de usuário
export async function registerUser(userData) {
  try {
    const response = await fetch("http://127.0.0.1:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return response;
  } catch (error) {
  }
}

// Login de usuário
export async function loginUser(userData) {
  try {
    const response = await fetch("http://127.0.0.1:3000/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    localStorage.setItem("loggedUser", "true");
    if (!response.ok) {
      throw new Error(data.message || "Erro ao logar-se");
    }

    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// GET pra pegar o usuário via cookies/tokens(refresh e access)
//Caso o accessToken seja inválido o refreshToken é requisitado
//Se o refresh estiver Ok então a rota gera um novo access
export async function getUser() {
  try {
    const response = await fetch("http://127.0.0.1:3000/users", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const refreshResponse = await fetch("http://127.0.0.1:3000/refresh", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (refreshResponse.ok) {
        const retry = await fetch("http://127.0.0.1:3000/users", {
          method: "GET",
          credentials: "include",
        });
        return await retry.json();
      } else {
        alert("Erro: logue-se novamente!");
        window.location.href = "./index.html"
      }
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

//Request pra logout

export async function logoutUser() {
  try {
    const response = await fetch("http://127.0.0.1:3000/logout", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    localStorage.setItem("loggedUser", "false");
    alert("Você foi deslogado!")
    window.location.href = "index.html";
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Adicionar novo produto

export async function addProduct(productData) {
  try {
    const response = await fetch("http://127.0.0.1:3000/products/addproduct", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

//Listar produto
export async function getProduct() {
  try {
    const response = await fetch("http://127.0.0.1:3000/products", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error:", error);
  }
}

//Listar todos os usuários

export async function getUsers() {

  try {
    const response = await fetch("http://127.0.0.1:3000/userControl", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error:", error);
  }
}

//Usuario atualizar seus proprios dados

export async function user_updateData(userInfo) { 

   try {
    const response = await fetch("http://127.0.0.1:3000/edit", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    });
    return response;
  } catch (error) {
    console.log("Error:", error);
  }

}

//Usuario mudar sua senha

export async function changePass(passData) {
   try {
    const response = await fetch("http://127.0.0.1:3000/changePassword", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function getLogs() {
  try {
    const result = await fetch("http://127.0.0.1:3000/logs", {
      method: "GET",
      credentials: "include",
      headers: {
      "Content-Type": "application/json",
      },
    });
    return result;
  } catch(error) {
    console.log("Error:", error);
  }
}

export async function getLog(log) {
  try{
      const response = await fetch(`http://127.0.0.1:3000/logs/${log}`, {
      method: "GET",
      credentials: "include",
      headers: {
      "Content-Type": "application/json",
      },
    });
    if(response.ok) {
      const data = response.json();
      return data;
    }
    } catch(error) {
      console.log(error);
    }
}