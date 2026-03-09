# Módulo de productos: importación y exportación

## Qué se agregó
- Nueva pantalla: `/dashboard/productos`
- Importación de archivos `.csv`, `.xlsx` y `.xls`
- Exportación a CSV y Excel
- Plantilla de ejemplo para que el cliente cargue su catálogo
- Catálogo por empresa con 3 listas de precios fijas

## SQL a ejecutar en Supabase
Ejecutar el contenido de:
- `scripts/002_products_catalog.sql`

## Formato esperado del archivo
Columnas soportadas:
- `codigo` o `code` o `sku`
- `nombre` o `producto` o `descripcion`
- `unidad`
- `precio_1`
- `precio_2`
- `precio_3`

## Importante
En esta primera versión, al importar un archivo se reemplaza el catálogo actual de la empresa.
