const selectedCharacters = new Map();

function setSelectedCharacter(userId, character) {
  selectedCharacters.set(userId, character);
}

function getSelectedCharacter(userId) {
  return selectedCharacters.get(userId);
}

module.exports = {
  setSelectedCharacter,
  getSelectedCharacter
};
