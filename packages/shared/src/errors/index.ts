export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class ConfigurationError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class ExtractionError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class AnalysisError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class BenchmarkError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}
