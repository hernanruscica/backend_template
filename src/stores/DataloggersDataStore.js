// services/sensorStore.js
const globalState = {};

const DataloggersDataStore = {
    setLoggerData: (dataloggerUuid, data) => {
        globalState[dataloggerUuid] = data;
        console.log(`[STORE] Estado actualizado para: ${dataloggerUuid}`);
    },
    getLoggerData: (dataloggerUuid) => {
        return globalState[dataloggerUuid] || [];
    },
    getAll: () => globalState
};

export default DataloggersDataStore;