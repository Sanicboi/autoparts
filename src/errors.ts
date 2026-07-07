/**
 * Класс HTTP ошибки
 */
export class HttpError extends Error {
  /**
   * Конструктор ошибки
   * @param code код ошибки
   */
  constructor(public readonly code: number) {
    super("Http Error");
  }
}
