/**
 * Retorna una versión "debounced" de la función recibida.
 *
 * La función resultante solo se ejecuta una vez que dejaron de
 * invocarse llamadas por al menos `delayMs` milisegundos.
 *
 * Uso típico: búsquedas mientras el usuario escribe, consultas
 * de disponibilidad mientras selecciona servicios, resize handlers.
 *
 * @example
 * const buscar = createDebounced((q: string) => this.search(q), 500);
 * buscar('man');   // cancela el timer anterior
 * buscar('mani');  // cancela el timer anterior
 * buscar('manicure'); // → ejecuta this.search('manicure') después de 500ms
 */
export function createDebounced<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = undefined;
    }, delayMs);
  };
}
