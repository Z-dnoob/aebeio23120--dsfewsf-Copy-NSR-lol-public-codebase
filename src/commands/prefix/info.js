const { AttachmentBuilder } = require('discord.js');
const { getCharacterData } = require('../../data/characters/character');
const { buildCharacterEmbed } = require('../../data/characters/embedBuilder');

module.exports = {
  name: 'info',
  description: 'Get information about a Naruto character',

  async execute(message, args) {
    const name = args.join(' ').trim();
    if (!name) return message.reply('Please provide a character name!');

    const character = getCharacterData(name);
    if (!character) {
      return message.channel.send('Character not found.');
    }

    const { embed, imagePath, imageFileName } = buildCharacterEmbed(character);
    const attachment = new AttachmentBuilder(imagePath, { name: imageFileName });

    return message.channel.send({ embeds: [embed], files: [attachment] });
  }
};
