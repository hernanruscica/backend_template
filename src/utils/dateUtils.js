export const getSecondsSince = (isoDateString) => {
    if (!isoDateString) return 999999; // Retorno de seguridad si no hay fecha

    const now = Date.now(); // Hora REAL del servidor (Siempre es UTC)
    const lastConnDate = new Date(isoDateString).getTime(); // Hora de la BD (Argentina disfrazada de UTC)

    // 1. Calculamos la diferencia bruta
    // Si el sensor reportó recién: 20:00 (Server) - 17:00 (BD) = 3 horas (10800000 ms)
    const rawDiffInMs = now - lastConnDate;

    // 2. Obtenemos el offset de tu .env (ej: "-03:00" -> parseInt devuelve -3)
    // Si no existe la variable, asumo -3 (Argentina) por defecto
    const offsetHours = parseInt(process.env.TIME_ZONE_OFFSET);
    
    // Convertimos el offset a milisegundos (-3 * 3600 * 1000 = -10800000)
    const offsetInMs = offsetHours * 60 * 60 * 1000;

    // 3. Ajustamos la diferencia
    // 3 horas (raw) + (-3 horas offset) = 0 segundos de diferencia real
    const adjustedDiffInMs = rawDiffInMs + offsetInMs;

    // Convertimos a segundos
    return Math.floor(adjustedDiffInMs / 1000);
};