const fs = require("fs");
const path = require("path");

function normalizeName(name) {
  if (typeof name !== "string") return "";
  return name.toLowerCase().replace(/[^a-z]/gi, "");
}

function getCharacterData(rawName) {
  const characterDir = path.join(__dirname, "../characters");
  const files = fs.readdirSync(characterDir);
  const normalizedInput = normalizeName(rawName);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const characterPath = path.join(characterDir, file);
      const characterData = JSON.parse(fs.readFileSync(characterPath, "utf8"));
      const fileName = path.parse(file).name;
      if (normalizeName(fileName) === normalizedInput) {
        return characterData;
      }
    }
  }

  return null;
}

function getAllCharacters() {
  const characterDir = path.join(__dirname, "../characters");
  const files = fs.readdirSync(characterDir);

  const characters = {};
  for (const file of files) {
    if (file.endsWith(".json")) {
      const characterData = JSON.parse(fs.readFileSync(path.join(characterDir, file), "utf8"));
      const fileName = path.parse(file).name;
      characters[normalizeName(fileName)] = characterData;
    }
  }
  return characters;
}

function getDisplayNameById(id, characters = null) {
  characters = characters || getAllCharacters();
  const data = characters[id];
  return data?.name?.split(" ")[0] || id;
}

module.exports = {
  getCharacterData,
  characterUtil: {
    normalizeName,
    getAllCharacters,
    getDisplayNameById
  }
};
