const User = require("../database/models/User");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function getUser(userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({
      userId,
      ryo: 0,
      cinnabarElixir: 0,
      hiddenScroll: 0,
      characters: [],
      startedAt: new Date()
    });
    await user.save();
  }
  return user;
}

async function addRyo(userId, amount) {
  const user = await getUser(userId);
  const numAmount = Number(amount);
  if (isNaN(numAmount)) throw new Error("Amount must be a valid number");
  user.ryo += numAmount;
  await user.save();
  return user.ryo;
}

async function subtractRyo(userId, amount) {
  const user = await getUser(userId);
  const numAmount = Number(amount);
  if (isNaN(numAmount)) throw new Error("Amount must be a valid number");
  user.ryo = Math.max(user.ryo - numAmount, 0);
  await user.save();
  return user.ryo;
}

async function addCinnabarElixir(userId, amount) {
  const user = await getUser(userId);
  const numAmount = Number(amount);
  if (isNaN(numAmount)) throw new Error("Amount must be a valid number");
  user.cinnabarElixir += numAmount;
  await user.save();
  return user.cinnabarElixir;
}

async function subtractCinnabarElixir(userId, amount) {
  const user = await getUser(userId);
  const numAmount = Number(amount);
  if (isNaN(numAmount)) throw new Error("Amount must be a valid number");
  user.cinnabarElixir = Math.max(user.cinnabarElixir - numAmount, 0);
  await user.save();
  return user.cinnabarElixir;
}

async function addHiddenScroll(userId, amount) {
  const user = await getUser(userId);
  const numAmount = Number(amount);
  if (isNaN(numAmount)) throw new Error("Amount must be a valid number");
  user.hiddenScroll += numAmount;
  await user.save();
  return user.hiddenScroll;
}

async function subtractHiddenScroll(userId, amount) {
  const user = await getUser(userId);
  const numAmount = Number(amount);
  if (isNaN(numAmount)) throw new Error("Amount must be a valid number");
  user.hiddenScroll = Math.max(user.hiddenScroll - numAmount, 0);
  await user.save();
  return user.hiddenScroll;
}

const getNextCharId = (characters) => {
  const existingIds = characters.map(c => parseInt(c.id)).filter(n => !isNaN(n));
  const maxId = existingIds.length ? Math.max(...existingIds) : 0;
  return (maxId + 1).toString();
};

async function addCharacter(userId, charName) {
  const user = await getUser(userId);
  const nextCharId = getNextCharId(user.characters);

  const newChar = {
    id: nextCharId,
    name: charName,
    level: 1,
    xp: 0
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

async function addXpToCharacter(userId, charId, xpAmount) {
  const user = await getUser(userId);
  const character = user.characters.find(c => c.id === charId);
  if (!character) return false;

  character.xp += xpAmount;
  await user.save();
  return character;
}

async function levelUpCharacter(userId, charId) {
  const user = await getUser(userId);
  const character = user.characters.find(c => c.id === charId);
  if (!character) return false;

  character.level += 1;
  await user.save();
  return character.level;
}

async function getCharacterCount(userId) {
  const user = await getUser(userId);
  return user.characters.length;
}

async function hasPickedTwoCharacters(userId) {
  const count = await getCharacterCount(userId);
  return count >= 2;
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

const Database = {
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
  levelUpCharacter,
  getCharacterCount,
  hasPickedTwoCharacters,
  getBalance
};

module.exports = Database;
