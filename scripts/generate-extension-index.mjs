#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const extensionsDir = path.join(projectRoot, 'public', 'extensions');
const indexPath = path.join(extensionsDir, 'index.json');

async function main() {
  try {
    await fs.mkdir(extensionsDir, { recursive: true });
    const entries = await fs.readdir(extensionsDir, { withFileTypes: true });
    const files = entries
      .filter(entry => entry.isFile())
      .map(entry => entry.name)
      .filter(name => name.toLowerCase().endsWith('.json'))
      .filter(name => name !== 'manifest.json' && name !== 'index.json')
      .sort((a, b) => a.localeCompare(b));

    const payload = JSON.stringify(files, null, 2);
    await fs.writeFile(indexPath, `${payload}\n`, 'utf8');

    console.log(`Generated extensions index with ${files.length} file(s) at ${path.relative(projectRoot, indexPath)}`);
  } catch (error) {
    console.error('Failed to generate extensions index:', error);
    process.exitCode = 1;
  }
}

main();
