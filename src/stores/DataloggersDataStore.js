// services/sensorStore.js
const globalState = {};

const DataloggersDataStore = {
    // --- Métodos de Logger (Ya los tenías) ---
    
    setLoggerData: (dataloggerUuid, data) => {
        // data se asume que es un Array de canales: [{ channelUuid: '...', ... }, ...]
        globalState[dataloggerUuid] = data;
        console.log(`[STORE] Logger actualizado: ${dataloggerUuid}`);
    },

    getLoggerData: (dataloggerUuid) => {
        return globalState[dataloggerUuid] || [];
    },

    getAll: () => globalState,


   
};

export default DataloggersDataStore;