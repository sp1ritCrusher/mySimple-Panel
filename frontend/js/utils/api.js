
export async function registerUser(userData) {
  try {
    const response = await fetch("http://127.0.0.1:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "User created sucessfully");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function loginUser(userData) {
  try {
    const response = await fetch("http://127.0.0.1:3000/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
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
      if(refreshResponse.ok) {
        console.log("Token renovado com sucesso");
        const retry = await fetch("http://127.0.0.1:3000/users", {
          method: "GET",
          credentials: "include",
        });
        return await retry.json();
      } else {
        console.log("Erro ao renovar token");
      }
      }
    const data = await response.json();
    console.log("Usuario logado: ", data);
    return data;

    } catch (error) {
    console.error("Error:", error);
  }
}

export async function logoutUser() {
  try {
    const response = await fetch("http://127.0.0.1:3000/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("Usuario deslogado: ", data);
    localStorage.setItem("loggedUser", "false");
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

