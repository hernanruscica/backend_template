import DataModel from '../../models/dataModel.js';
import { evaluate } from 'mathjs';

class FalloComunicacionStrategy {
  async evaluate(alarm) {
    const { tabla, condicion } = alarm;

    // 1. Obtener último dato
    const currentDataFail = await DataModel.findLastDataFromTable(tabla);
    if (!currentDataFail || currentDataFail.length === 0) {
        return { triggered: false, variables: {} };
    }

    // 2. Calcular tiempos
    const now = Date.now() - 3 * 60 * 60 * 1000; // Ajuste de zona horaria si aplica
    const lastDate = new Date(currentDataFail[0].fecha).getTime();
    
    // 3. Mapear variables dinámicas (simplificado para legibilidad)
    // Asumimos que la condición siempre usa 'minutos_sin_conexion' como resultado final
    const minutosSinConexion = (now - lastDate) / 1000 / 60;
    
    const variables = { 
        fecha: parseInt(lastDate) / 60 / 1000,
        fecha_actual: parseInt(now) / 60 / 1000,
        minutos_sin_conexion: parseFloat(minutosSinConexion.toFixed(1))
    };

    // 4. Evaluar
    try {
      const isTriggered = evaluate(condicion, variables);
      return { triggered: isTriggered, variables };
    } catch (error) {
      console.error(`Error evaluando fallo comunicación:`, error);
      return { triggered: false, variables, error };
    }
  }
}

export default new FalloComunicacionStrategy();