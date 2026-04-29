export class AppError extends Error {
  constructor({ message, status, code }) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}
export class AuthError extends AppError {
  constructor({ message, status, code }) {
    super({ message, status, code });
    this.name = "AuthError";
  }
}
export class RegisterError extends AppError {
  constructor({ message, status, code }) {
    super({ message, status, code });
    this.name = "RegisterError";
  }
}

export class AdminError extends AppError {
  constructor({ message, status, code }) {
    super({ message, status, code });
    this.name = "AdminError";
  }
}

export class CodeError extends AppError {
  constructor({ message, status, code }) {
    super({ message, status, code });
    this.name = "CodeError";
  }
}

export class LogError extends AppError {
  constructor({ message, status, code }) {
    super({ message, status, code });
    this.name = "LogError";
  }
}

export class ProductError extends AppError {
  constructor({ message, status, code }) {
    super({ message, status, code });
    this.name = "ProductError";
  }
}

export class UserError extends AppError {
  constructor({ message, status, code }) {
    super({ message, status, code });
    this.name = "UserError";
  }
}