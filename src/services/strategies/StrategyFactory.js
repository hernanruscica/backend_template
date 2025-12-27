import PorcentajeEncendidoStrategy from './PorcentajeEncendidoStrategy.js';
import FalloComunicacionStrategy from './FalloComunicacionStrategy.js';

const strategies = {
  'porcentage_on': PorcentajeEncendidoStrategy,
  'comunication_failure': FalloComunicacionStrategy
};

export const getStrategy = (type) => {
  return strategies[type] || null;
};