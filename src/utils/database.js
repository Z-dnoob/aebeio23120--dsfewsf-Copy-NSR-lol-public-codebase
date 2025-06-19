const User = require("../database/models/User");
const { getCharacterData } = require("../data/characters/character");
const Production = require("./Production");

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getUser(userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({
      userId,
      ryo: 0,
      cinnabarElixir: 0,
      hiddenScroll: 0,
      characters: []
    });
    await user.save();
  }
  return user;
}

async function getNextProductionNumber() {
  let record = await Production.findOne();
  if (!record) {
    record = new Production({ count: 1 });
    await record.save();
    return 0;
  } else {
    const current = record.count;
    record.count += 1;
    await record.save();
    return current;
  }
}

async function addCurrency(userId, type, amount) {
  const user = await getUser(userId);
  const amt = Number(amount);
  if (isNaN(amt)) throw new Error("Invalid amount");
  user[type] += amt;
  await user.save();
  return user[type];
}

async function subtractCurrency(userId, type, amount) {
  const user = await getUser(userId);
  const amt = Number(amount);
  if (isNaN(amt)) throw new Error("Invalid amount");
  user[type] = Math.max(user[type] - amt, 0);
  await user.save();
  return user[type];
}

const addRyo = (userId, amt) => addCurrency(userId, "ryo", amt);
const subtractRyo = (userId, amt) => subtractCurrency(userId, "ryo", amt);
const addCinnabarElixir = (userId, amt) => addCurrency(userId, "cinnabarElixir", amt);
const subtractCinnabarElixir = (userId, amt) => subtractCurrency(userId, "cinnabarElixir", amt);
const addHiddenScroll = (userId, amt) => addCurrency(userId, "hiddenScroll", amt);
const subtractHiddenScroll = (userId, amt) => subtractCurrency(userId, "hiddenScroll", amt);

const getNextCharId = (chars) => {
  const ids = chars.map(c => parseInt(c.id)).filter(n => !isNaN(n));
  return (Math.max(0, ...ids) + 1).toString();
};

async function addCharacter(userId, charName) {
  const user = await getUser(userId);
  const base = getCharacterData(charName);
  if (!base) throw new Error("Character data not found");

  const yin = getRandomInt(0, 50);
  const yang = getRandomInt(0, 50);
  const productionNumber = await getNextProductionNumber();

  const newChar = {
    id: getNextCharId(user.characters),
    name: base.name,
    level: 1,
    xp: 0,
    yin,
    yang,
    hp: (base.stats.hp || 0) + yang,
    chakra: base.stats.chakra || 0,
    attack: base.stats.attack || 0,
    defense: (base.stats.defense || 0) + yin,
    agility: base.stats.agility || 0,
    rarity: base.rarity || "Unknown",
    chakraNature: base.chakraNature || "Unknown",
    image: base.image || null,
    productionNumber
  };

  user.characters.push(newChar);
  await user.save();
  return newChar;
}

async function removeCharacter(userId, charId) {
  const user = await getUser(userId);
  const index = user.characters.findIndex(c => c.id === charId);
  if (index !== -1) {
    user.characters.splice(index, 1);
    await user.save();
    return true;
  }
  return false;
}

async function getCharacters(userId) {
  const user = await getUser(userId);
  return user.characters;
}

async function getCharacterById(userId, charId) {
  const user = await getUser(userId);
  return user.characters.find(c => c.id === charId) || null;
}

async function getCharacterCount(userId) {
  const user = await getUser(userId);
  return user.characters.length;
}

async function hasPickedTwoCharacters(userId) {
  return (await getCharacterCount(userId)) >= 2;
}

async function getBalance(userId) {
  const user = await getUser(userId);
  return {
    ryo: user.ryo,
    cinnabarElixir: user.cinnabarElixir,
    hiddenScroll: user.hiddenScroll,
    characters: user.characters,
    characterCount: user.characters.length
  };
}

function getXpForNextLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

async function addXpToCharacter(userId, charId, xpGain) {
  const user = await getUser(userId);
  const char = user.characters.find(c => c.id === charId);
  if (!char) return false;

  char.xp += xpGain;

  let leveledUp = false;
  let levels = 0;

  while (char.xp >= getXpForNextLevel(char.level)) {
    char.xp -= getXpForNextLevel(char.level);
    char.level++;
    levels++;
    leveledUp = true;

    char.hp += 10 + (char.yang || 0);
    char.attack += 5;
    char.defense += 5 + (char.yin || 0);
    char.agility += 5;
    char.chakra += 10;
  }

  await user.save();
  return { character: char, leveledUp, levelsGained: levels };
}

module.exports = {
  getUser,
  addRyo,
  subtractRyo,
  addCinnabarElixir,
  subtractCinnabarElixir,
  addHiddenScroll,
  subtractHiddenScroll,
  addCharacter,
  removeCharacter,
  getCharacters,
  getCharacterById,
  addXpToCharacter,
  getCharacterCount,
  hasPickedTwoCharacters,
  getBalance
};
