import PorcentajeEncendidoStrategy from './PorcentajeEncendidoStrategy.js';
import FalloComunicacionStrategy from './FalloComunicacionStrategy.js';

const strategies = {
  'PORCENTAJE_ENCENDIDO': PorcentajeEncendidoStrategy,
  'FALLO_COMUNICACION': FalloComunicacionStrategy
};

export const getStrategy = (type) => {
  return strategies[type] || null;
};