export const calculatePorcentageOn = (array, tiempoAtras) => {  
    //tiempoAtras viene en segundos
    return array.map((obj, index, arr) => {
      let sumaTotal = 0;
      let sumaEncendido = 0;
  
      // Recorremos hacia atrás desde el elemento actual para sumar los tiempos
      for (let i = index; i >= 0; i--) {
        sumaTotal += arr[i].tiempo_total;
        sumaEncendido += arr[i].tiempo_encendido;
  
        // Si la suma acumulada del tiempo total excede tiempoAtras, dejamos de sumar
        if (sumaTotal > tiempoAtras) {
          // Descontamos el último agregado que hace que la sumaTotal exceda tiempoAtras
          sumaTotal -= arr[i].tiempo_total;
          sumaEncendido -= arr[i].tiempo_encendido;
          break;
        }
      }
  
      // Calculamos el porcentaje de encendido
      const porcentajeEncendido = parseFloat(((sumaEncendido / sumaTotal) * 100).toFixed(2));
  
      // Devolvemos el objeto original con el nuevo atributo
      return {
        ...obj,
        porcentaje_encendido: porcentajeEncendido || 0 // Evitamos NaN si sumaTotal es 0
      };
    });
  }; 