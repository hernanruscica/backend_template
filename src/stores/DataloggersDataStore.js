// services/sensorStore.js
const globalState = {};

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