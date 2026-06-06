export class AppError extends Error {
  constructor({ message, status, code }) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}
export class AuthError extends AppError {
  constructor({ message, status, code, userid }) {
    super({ message, status, code, userid });
    this.name = "AuthError";
    this.userid = userid;
  }
}
export class RegisterError extends AppError { 
  constructor({ message, status, code, userid }) {
    super({ message, status, code, userid });
    this.name = "RegisterError";
    this.userid = userid;
  }
}

export class AdminError extends AppError {
  constructor({ message, status, code }) {
    super({ message, status, code });
    this.name = "AdminError";
  }
}

export class SystemError extends AppError {
  constructor({ message, status, code }) {
    super({ message, status, code });
    this.name = "SystemError";
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