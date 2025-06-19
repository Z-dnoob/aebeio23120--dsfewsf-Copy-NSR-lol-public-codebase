const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const db = require('../../utils/database');
const { getCharacterData } = require('../../data/characters/character');
const { setSelectedCharacter } = require('../../state/selectedCharacter');

module.exports = {
  name: 'select',
  description: 'Select a character by ID. Usage: nrselect <charId>',
  async execute(message, args) {
    const userId = message.author.id;
    const charId = args[0];

    if (!charId) {
      return message.reply('❌ Please provide a character ID.\nExample: `nrselect 1a2b3c`');
    }

    const characters = await db.getCharacters(userId);
    const selected = characters.find(c => c.id === charId);

    if (!selected) {
      return message.reply('🚫 You do not own a character with that ID.');
    }

    // Save selected character
    setSelectedCharacter(userId, selected);

    const charData = getCharacterData(selected.name);
    const charName = charData?.name || selected.name;
    const imageFileName = charData?.image || null;

    const embed = new EmbedBuilder()
      .setTitle('You\'ve selected')
      .setDescription(`${charName} 🎉!\nRun \`nrinfo ${charName}\` to get info!`)
      .setColor('Orange');

    if (imageFileName) {
      const imagePath = path.join(__dirname, '../../assets/images/characters', imageFileName);
      const attachment = new AttachmentBuilder(imagePath);
      embed.setImage(`attachment://${imageFileName}`);
      return message.reply({ embeds: [embed], files: [attachment] });
    } else {
      return message.reply({ embeds: [embed] });
    }
  }
};
