/**
 * Classe pour formater les réponses d'erreur
 * @extends Error
 */
class ErrorResponse extends Error {
  /**
   * Constructeur
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code HTTP de l'erreur
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse; 