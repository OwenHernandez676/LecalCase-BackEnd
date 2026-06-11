/**
 * Verificación de sintaxis del proyecto ("build" para JavaScript puro):
 * ejecuta `node --check` sobre cada archivo .js de src/ y test/.
 * Sale con código 1 si algún archivo tiene errores de sintaxis.
 */
const { execFileSync } = require('child_process');
const { readdirSync } = require('fs');
const { join } = require('path');

function listJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJsFiles(full));
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const root = join(__dirname, '..');
const files = [...listJsFiles(join(root, 'src')), ...listJsFiles(join(root, 'test'))];
let failed = 0;

for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failed += 1;
    console.error(`✗ ${file}\n${err.stderr?.toString() ?? err.message}`);
  }
}

console.log(`[check-syntax] ${files.length - failed}/${files.length} archivos OK`);
process.exit(failed > 0 ? 1 : 0);
