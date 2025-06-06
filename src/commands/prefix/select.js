const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');
const { getCharacterData } = require('../../data/characters/character');


const selectedCharacters = new Map();

module.exports = {
  name: 'select',
  description: 'Select a character by ID. Usage: char select <charId>',
  async execute(message, args) {
    const userId = message.author.id;
    const charId = args[0];

    if (!charId) {
      return message.reply('❌ Please provide a character ID.\nExample: `char select 1a2b3c`');
    }

    const characters = await db.getCharacters(userId); 
    const selected = characters.find(c => c.id === charId);

    if (!selected) {
      return message.reply('🚫 You do not own a character with that ID.');
    }

    const charData = getCharacterData(selected.name);
    const charName = charData?.name || selected.name;
    const image = charData?.image || null;

    selectedCharacters.set(userId, selected);

    const embed = new EmbedBuilder()
      .setTitle('You\'ve selected')
      .setDescription(`${charName} 🎉!\nRun \`nrinfo ${charName}\` to get info!`)
      .setColor('Random');

    if (image) embed.setImage(image);

    message.reply({ embeds: [embed] });
  },

  getSelectedCharacter(userId) {
    return selectedCharacters.get(userId);
  }
};
