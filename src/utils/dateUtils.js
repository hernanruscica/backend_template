export const getSecondsSince = (isoDateString) => {
    // Date.now() da el tiempo actual en ms
    // new Date(isoDateString).getTime() convierte tu fecha a ms
    const diffInMs = Date.now() - new Date(isoDateString).getTime();
    
    // Convertimos a segundos y quitamos decimales
    return Math.floor(diffInMs / 1000);
};