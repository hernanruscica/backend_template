import DataModel from '../../models/dataModel.js';
import { calculatePorcentageOn } from '../../utils/MathUtils.js';
import { evaluate } from 'mathjs';

class PorcentajeEncendidoStrategy {
  async evaluate(alarm) {
    const { tabla, columna, periodo_tiempo, condicion } = alarm;
    
    // 1. Obtener datos
    const currentData = await DataModel.findDataFromDigitalChannel(tabla, columna, periodo_tiempo);
    const rangePorcentageSecs = periodo_tiempo * 60;
    
    // 2. Calcular lógica de negocio
    const dataPorcentagesOn = calculatePorcentageOn(currentData, rangePorcentageSecs);
    
    if (!dataPorcentagesOn || dataPorcentagesOn.length === 0) {
      return { triggered: false, variables: {} };
    }

    // 3. Preparar variables
    const currentPorcentage = dataPorcentagesOn[dataPorcentagesOn.length - 1].porcentaje_encendido;
    const variables = { porcentaje_encendido: currentPorcentage };

    // 4. Evaluar condición matemática
    try {
      const isTriggered = evaluate(condicion, variables);
      return { triggered: isTriggered, variables };
    } catch (error) {
      console.error(`Error evaluando condición ${condicion}:`, error);
      return { triggered: false, variables, error };
    }
  }
}

export default new PorcentajeEncendidoStrategy();