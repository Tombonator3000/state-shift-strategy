import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.resolve(rootDir, 'src', 'data', 'core');

async function loadCards(filename) {
  const filePath = path.resolve(dataDir, filename);
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

const SAMPLE_IP_LEVELS = [30, 50, 80, 110];

function computeDamage(flat, percent, ip) {
  const scaled = percent > 0 ? Math.floor(ip * percent) : 0;
  return { flat, scaled, total: flat + scaled };
}

function formatRow(cells) {
  return cells.map(cell => cell.toString().padEnd(18)).join('');
}

(async () => {
  const truth = await loadCards('core_truth_MVP_balanced.json');
  const government = await loadCards('core_government_MVP_balanced.json');
  const cards = [...truth, ...government].filter(card => card.type === 'ATTACK');

  const percentCards = cards.filter(card => {
    const percent = card.effects?.ipDelta?.opponentPercent ?? 0;
    return typeof percent === 'number' && percent > 0;
  });

  if (percentCards.length === 0) {
    console.log('No ATTACK cards with opponentPercent found.');
    return;
  }

  console.log(`ATTACK scaling cards detected: ${percentCards.length}`);
  console.log(formatRow(['Card', 'Faction', 'Rarity', 'Flat', 'Percent', ...SAMPLE_IP_LEVELS.map(ip => `${ip} IP`)]));
  console.log('-'.repeat(18 * (5 + SAMPLE_IP_LEVELS.length)));

  const lateGameIp = 80;
  let totalFlat = 0;
  let totalScaledLate = 0;

  for (const card of percentCards) {
    const flat = card.effects?.ipDelta?.opponent ?? 0;
    const percent = card.effects?.ipDelta?.opponentPercent ?? 0;
    totalFlat += flat;
    totalScaledLate += computeDamage(flat, percent, lateGameIp).total - flat;

    const damages = SAMPLE_IP_LEVELS.map(ip => {
      const { total } = computeDamage(flat, percent, ip);
      return total;
    });

    console.log(
      formatRow([
        card.name.slice(0, 16),
        card.faction,
        card.rarity ?? 'n/a',
        flat,
        `${Math.round(percent * 100)}%`,
        ...damages,
      ]),
    );
  }

  const avgFlat = totalFlat / percentCards.length;
  const avgScaled = totalScaledLate / percentCards.length;
  console.log('\nLate-game (80 IP) average bonus damage from scaling:', avgScaled.toFixed(2));
  console.log('Average flat damage baseline:', avgFlat.toFixed(2));
})();
