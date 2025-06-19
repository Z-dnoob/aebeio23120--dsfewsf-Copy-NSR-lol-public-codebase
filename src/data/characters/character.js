const fs = require("fs");
const path = require("path");

function normalizeName(name) {
  if (typeof name !== "string") return "";
  return name.toLowerCase().replace(/[^a-z]/gi, "");
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

function getCharacterData(rawName) {
  const characterDir = path.join(__dirname, "../characters");
  const files = fs.readdirSync(characterDir);
  const normalizedInput = normalizeName(rawName);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const characterPath = path.join(characterDir, file);
      const characterData = JSON.parse(fs.readFileSync(characterPath, "utf8"));

      const fullName = characterData.name || "";
      const normalizedFullName = normalizeName(fullName);
      const normalizedFirstName = normalizeName(fullName.split(" ")[0]);

      if (
        normalizedInput === normalizedFullName ||
        normalizedInput === normalizedFirstName
      ) {
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
      const normalizedName = normalizeName(characterData.name);
      characters[normalizedName] = characterData;
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
