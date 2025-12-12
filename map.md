# mapas mentales. Ideas y estado de cosas.

Consulta del endpoint: GET {{api}}/data/getporcentages/cocina/d3/7200/720 
Devuelve algo asi:
```
{
  "success": true,
  "message": "Data Founded",
  "count": 1382,
  "data": [
    {
      "fecha": "2025-12-07T01:49:39.000Z",
      "tiempo_total": 300,
      "tiempo_encendido": 300,
      "cantidad": 1,
      "estado": 1,
      "servicio": 0,
      "energia": 0,
      "texto": "Trama ok",
      "porcentaje_encendido": 100
    },
```
1- El controlador 'getPorcentagesOn' pide a la BD, los datos, de cada registro dentro de un periodo solicitado ( dataModel.findDataFromDigitalChannel )
2 - Ya con los datos, 'calculatePorcentageOn'  reorganiza para que en cada elemento del array tenga el promedio de tiempo de funcionamiento. Calculando ese porcentaje entre los x registros para atras, dentro de un periodo de tiempo.
