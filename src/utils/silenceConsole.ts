/**
 * Utilidad para silenciar completamente todos los mensajes de consola
 * sin afectar la funcionalidad del sistema.
 * 
 * Esta función sobrescribe todos los métodos de console con funciones vacías
 * para evitar que se muestren mensajes, logs, warnings o errores en la consola del navegador.
 */

// Guardar referencias originales (por si acaso se necesitan en el futuro)
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace,
  table: console.table,
  group: console.group,
  groupEnd: console.groupEnd,
  groupCollapsed: console.groupCollapsed,
  time: console.time,
  timeEnd: console.timeEnd,
  timeLog: console.timeLog,
  assert: console.assert,
  clear: console.clear,
  count: console.count,
  countReset: console.countReset,
  dir: console.dir,
  dirxml: console.dirxml,
  profile: console.profile,
  profileEnd: console.profileEnd,
};

/**
 * Silencia todos los métodos de console
 */
export function silenceConsole(): void {
  // Sobrescribir todos los métodos de console con funciones vacías
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};
  console.table = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
  console.groupCollapsed = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
  console.timeLog = () => {};
  console.assert = () => {};
  console.clear = () => {};
  console.count = () => {};
  console.countReset = () => {};
  console.dir = () => {};
  console.dirxml = () => {};
  console.profile = () => {};
  console.profileEnd = () => {};
}

/**
 * Restaura los métodos originales de console (útil para debugging)
 */
export function restoreConsole(): void {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
  console.trace = originalConsole.trace;
  console.table = originalConsole.table;
  console.group = originalConsole.group;
  console.groupEnd = originalConsole.groupEnd;
  console.groupCollapsed = originalConsole.groupCollapsed;
  console.time = originalConsole.time;
  console.timeEnd = originalConsole.timeEnd;
  console.timeLog = originalConsole.timeLog;
  console.assert = originalConsole.assert;
  console.clear = originalConsole.clear;
  console.count = originalConsole.count;
  console.countReset = originalConsole.countReset;
  console.dir = originalConsole.dir;
  console.dirxml = originalConsole.dirxml;
  console.profile = originalConsole.profile;
  console.profileEnd = originalConsole.profileEnd;
}

// Silenciar la consola después de que React esté completamente inicializado
// Esto asegura que no interfiera con la inicialización de componentes
if (typeof window !== 'undefined') {
  // Función para silenciar después de que todo esté listo
  const silenceAfterReady = () => {
    // Usar requestIdleCallback si está disponible, sino usar setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        silenceConsole();
      }, { timeout: 1000 });
    } else {
      // Esperar a que React esté completamente montado
      setTimeout(() => {
        silenceConsole();
      }, 1000);
    }
  };

  // Esperar a que el DOM esté listo y luego esperar un poco más para React
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', silenceAfterReady);
  } else if (document.readyState === 'interactive') {
    // Si está en estado interactive, esperar a que esté complete
    window.addEventListener('load', silenceAfterReady);
  } else {
    // Si ya está complete, ejecutar después de un breve delay
    silenceAfterReady();
  }
} else {
  // Si no hay window (SSR), silenciar inmediatamente
  silenceConsole();
}

