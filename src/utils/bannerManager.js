const fs = require('fs');
const path = require('path');

const banner = {
  characters: [],
  expiresAt: null,
};

function getWeightForRarity(rarity) {
  switch (rarity.toLowerCase()) {
    case 'common': return 50;
    case 'uncommon': return 40;
    case 'rare': return 25;
    case 'epic': return 15;
    case 'legendary': return 10;
    case 'godly': return 5;
    case 'divine': return 2;
    default: return 10;
  }
}

function getCharacterPrice(rarity) {
  switch (rarity.toLowerCase()) {
    case 'common': return getRandomInt(1000, 2000);
    case 'uncommon': return getRandomInt(2000, 4500);
    case 'rare': return getRandomInt(5000, 7500);
    case 'epic': return getRandomInt(7500, 8000);
    case 'legendary': return getRandomInt(8000, 9500);
    case 'godly': return getRandomInt(10000, 15000);
    case 'divine': return getRandomInt(17000, 20000);
    default: return 3000;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadAllCharacters() {
  const dir = path.join(__dirname, '../data/characters');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const characters = [];

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (data && data.name && data.rarity) {
      characters.push({
        name: data.name,
        rarity: data.rarity,
        image: data.image || null,
      });
    }
  }
  return characters;
}

function buildWeightedPool(chars) {
  let pool = [];
  for (const char of chars) {
    const weight = getWeightForRarity(char.rarity);
    for (let i = 0; i < weight; i++) {
      pool.push(char);
    }
  }
  return pool;
}

function generateBanner(charCount = 4) {
  const allChars = loadAllCharacters();
  let pool = buildWeightedPool(allChars);

  const selected = new Map();

  while (selected.size < charCount && pool.length > 0) {
    const randIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randIndex];
    selected.set(chosen.name, chosen);
    pool = pool.filter(c => c.name !== chosen.name);
  }

  const finalChars = Array.from(selected.values()).map(char => ({
    ...char,
    price: getCharacterPrice(char.rarity),
  }));

  banner.characters = finalChars;
  banner.expiresAt = Date.now() + 30 * 60 * 1000;

  return finalChars;
}

function getBanner() {
  return banner;
}

module.exports = {
  generateBanner,
  getBanner,
};
