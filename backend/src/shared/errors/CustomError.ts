export class CustomError extends Error {
    constructor(
      public statusCode: number,
      public message: string,
      public isOperational = true
    ) {
      super(message);
      Object.setPrototypeOf(this, CustomError.prototype);
    }
  }
  
  export class ValidationError extends CustomError {
    constructor(message: string) {
      super(400, message);
    }
  }
  
  export class AuthenticationError extends CustomError {
    constructor(message = 'No autorizado') {
      super(401, message);
    }
  }
  
  export class AuthorizationError extends CustomError {
    constructor(message = 'No tiene permisos para realizar esta acción') {
      super(403, message);
    }
  }
  
  export class NotFoundError extends CustomError {
    constructor(message: string) {
      super(404, message);
    }
  }