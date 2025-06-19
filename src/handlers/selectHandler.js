const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const db = require('../utils/database');
const { getCharacterData } = require('../data/characters/character');
const { setSelectedCharacter } = require('../state/selectedCharacter');

async function handleCharacterSelection(userId, charId, respondFn) {
  const characters = await db.getCharacters(userId);
  const selected = characters.find(c => c.id === charId);

  if (!selected) {
    return respondFn('🚫 You do not own a character with that ID.');
  }

  const charData = getCharacterData(selected.name);
  const charName = charData?.name || selected.name;
  const imageFileName = charData?.image || null;

  setSelectedCharacter(userId, selected);

  const embed = new EmbedBuilder()
    .setTitle('You\'ve selected')
    .setDescription(`${charName} 🎉!\nRun \`nrinfo ${charName}\` to get info!`)
    .setColor('Random');

  if (imageFileName) {
    const imagePath = path.join(__dirname, '../assets/images/characters', imageFileName);
    const attachment = new AttachmentBuilder(imagePath);
    return respondFn({ embeds: [embed], files: [attachment] });
  } else {
    return respondFn({ embeds: [embed] });
  }
}

module.exports = handleCharacterSelection;
