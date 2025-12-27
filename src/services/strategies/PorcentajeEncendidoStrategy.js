import DataModel from '../../models/dataModel.js';
import { calculatePorcentageOn } from '../../utils/MathUtils.js';
import { evaluate } from 'mathjs';

class PorcentajeEncendidoStrategy {
  async evaluate(alarm) {
    const { table_name, column_name, time_range, condition_logic, name } = alarm;
    
    // 1. Obtener datos
    const currentData = await DataModel.findDataFromDigitalChannel(table_name, column_name, time_range);
    const rangePorcentageSecs = time_range * 60;
    
    // 2. Calcular lógica de negocio
    const dataPorcentagesOn = calculatePorcentageOn(currentData, rangePorcentageSecs);
    
    if (!dataPorcentagesOn || dataPorcentagesOn.length === 0) {
      return { triggered: false, variables: {} };
    }

    // 3. Preparar variables
    const currentPorcentage = dataPorcentagesOn[dataPorcentagesOn.length - 1].porcentaje_encendido;
    const variables = { value: currentPorcentage };
    //console.log('variables', variables);
    
    // 4. Evaluar condición matemática
    try {
      const isTriggered = evaluate(condition_logic, variables);
      console.log(`${name} >>> condicion logica : ${condition_logic} - variables: ${variables?.value}`);
      
      return { triggered: isTriggered, variables };
    } catch (error) {
      console.error(`Error evaluando condición ${condition_logic}:`, error);
      return { triggered: false, variables, error };
    }
  }
}

export default new PorcentajeEncendidoStrategy();