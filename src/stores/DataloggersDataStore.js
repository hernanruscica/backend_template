// services/sensorStore.js
const globalState = {
    lastTotalDataLoad: 0
};

const DataloggersDataStore = {    
    
    setLoggerData: (dataloggerUuid, data) => {
        // data se asume que es un Array de canales: [{ channelUuid: '...', ... }, ...]
        globalState[dataloggerUuid] = data;
        console.log(`[STORE] Logger actualizado: ${dataloggerUuid}`);
    },

    getLoggerData: (dataloggerUuid) => {
        return globalState[dataloggerUuid] || [];
    },

    getAll: () => globalState,

    getLastTotalDataLoad: () => {
        const val = globalState.lastTotalDataLoad || 0;
        console.log(`📍 [STORE] getLastTotalDataLoad: ${val ? new Date(val).toISOString() : 'NUNCA'}`);
        return val;
    },

    setLastTotalDataLoad: (timestamp) => {
        console.log(`📍 [STORE] setLastTotalDataLoad: ${new Date(timestamp).toISOString()}`);
        globalState.lastTotalDataLoad = timestamp;
    },

    shouldReloadTotalData: (intervalHours = 24) => {
        const lastLoad = globalState.lastTotalDataLoad || 0;
        const now = Date.now();
        const intervalMs = intervalHours * 60 * 60 * 1000;
        const shouldReload = (now - lastLoad) > intervalMs;
        const timeSince = lastLoad ? Math.round((now - lastLoad) / (1000 * 60)) : 'NUNCA';
        console.log(`📍 [STORE] shouldReloadTotalData(${intervalHours}h): ${shouldReload} (ultima carga: hace ${timeSince} min)`);
        return shouldReload;
    },

    /**
     * Busca a qué Datalogger pertenece un Channel UUID.
     * @param {string} channelUuid 
     * @returns {string|null} Retorna el dataloggerUuid o null si no existe.
     */
    findDataloggerUuidByChannel: (channelUuid) => {
        // Recorremos las claves (dataloggerUuids) y sus valores
        for (const [loggerUuid, loggerData] of Object.entries(globalState)) {
            
            // Validación de seguridad: ¿Tiene canales?
            const channels = loggerData.channels || [];
            
            // Buscamos el canal usando .some() que es más rápido (retorna true/false)
            // Asegúrate que la propiedad en tu JSON sea 'uuid' (como en tu ejemplo)
            const exists = channels.some(ch => ch.uuid === channelUuid);

            if (exists) {
                return loggerData; 
            }
        }
        
        return null; // No encontrado
    }


   
};

export default DataloggersDataStore;