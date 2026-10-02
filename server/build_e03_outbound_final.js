import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.join(__dirname, 'test_e03_osrm_outbound.json');
const outputPath = path.join(__dirname, 'e03_outbound_final_data.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

if (
  source.route !== 'E03' ||
  source.direction !== 'outbound' ||
  source.inputStopCount !== 42 ||
  source.waypointCount !== 42 ||
  source.stops?.length !== 42
) {
  throw new Error('Expected the validated 42-stop E03 outbound OSRM result.');
}

if (
  !source.stops.every(
    (stop, index) =>
      stop.order === index + 1 &&
      typeof stop.name === 'string' &&
      Number.isFinite(stop.lat) &&
      Number.isFinite(stop.lng) &&
      JSON.stringify(Object.keys(stop)) === JSON.stringify(['name', 'order', 'lat', 'lng'])
  )
) {
  throw new Error('E03 stops must retain the exact name/order/lat/lng structure and sequence.');
}

if (
  source.geometry?.type !== 'LineString' ||
  !Array.isArray(source.geometry.coordinates) ||
  source.geometry.coordinates.length === 0 ||
  !source.geometry.coordinates.every(
    (coordinate) =>
      Array.isArray(coordinate) &&
      coordinate.length === 2 &&
      coordinate.every(Number.isFinite)
  )
) {
  throw new Error('E03 geometry must be a valid GeoJSON LineString with [lng, lat] coordinates.');
}

const output = {
  outbound: {
    stops: source.stops,
    geometry: source.geometry,
  },
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

const written = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
if (
  JSON.stringify(written.outbound.stops) !== JSON.stringify(source.stops) ||
  JSON.stringify(written.outbound.geometry) !== JSON.stringify(source.geometry)
) {
  throw new Error('Final import fixture differs from the OSRM source data.');
}

console.log(`Input stops: ${written.outbound.stops.length}`);
console.log(`Geometry: ${written.outbound.geometry.type} (${written.outbound.geometry.coordinates.length} coordinates)`);
console.log(`Output: ${outputPath}`);
