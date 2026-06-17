export class AppError extends Error {
  constructor(message, code, statusCode, details) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} not found: ${id}`, "NOT_FOUND", 404, { resource, id });
  }
}

export class ValidationError extends AppError {
  constructor(details) {
    super("Validation failed", "VALIDATION_ERROR", 422, details);
  }
}

export class UpstreamError extends AppError {
  constructor(message, details) {
    super(message, "UPSTREAM_ERROR", 502, details);
  }
}

export function parseWithSchema(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  return result.data;
}
