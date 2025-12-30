import PorcentajeEncendidoStrategy from './PorcentajeEncendidoStrategy.js';
import FalloComunicacionStrategy from './FalloComunicacionStrategy.js';
import FuncionamientoSimultaneoStrategy from './FuncionamientoSimultaneoStrategy.js';

const strategies = {
  'porcentage_on': PorcentajeEncendidoStrategy,
  'comunication_failure': FalloComunicacionStrategy,
  'simultaneous_on': FuncionamientoSimultaneoStrategy
};

export const getStrategy = (type) => {
  return strategies[type] || null;
};