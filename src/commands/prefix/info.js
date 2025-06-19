const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getCharacterData } = require('../../data/characters/character');
const { buildCharacterEmbed, buildOwnedCharacterEmbed } = require('../../data/characters/embedBuilder');
const { getUser, getCharacterById } = require('../../utils/database');

module.exports = {
  name: 'info',
  description: 'Get detailed stats about a Naruto character by name or ID',

  async execute(message, args) {
    const input = args.join(' ').trim();
    if (!input) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Missing Input")
        .setDescription("Please provide a character name or ID.\n\nExample:\n`nrinfo Naruto`\n`nrinfo 1`")
        .setColor('Red');
      return message.channel.send({ embeds: [embed] });
    }

    // If input is a number, fetch owned character by ID
    if (!isNaN(input)) {
      const user = await getUser(message.author.id);
      const character = await getCharacterById(user.userId, input);

      if (!character) {
        const embed = new EmbedBuilder()
          .setTitle("❌ Character Not Found")
          .setDescription(`You don't have any character with ID \`${input}\`.`)
          .setColor('Red');
        return message.channel.send({ embeds: [embed] });
      }

      const { embed, imagePath, imageFileName } = buildOwnedCharacterEmbed(character);
      const files = imagePath ? [new AttachmentBuilder(imagePath, { name: imageFileName })] : [];
      return message.channel.send({ embeds: [embed], files });
    }

    // Otherwise: fetch base character data by name
    const characterData = getCharacterData(input);
    if (!characterData) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Character Not Found")
        .setDescription(`Couldn't find a character named **${input}**.\nMake sure to use the full or correct name.`)
        .setColor('Red');
      return message.channel.send({ embeds: [embed] });
    }

    const { embed, imagePath, imageFileName } = buildCharacterEmbed(characterData);
    const files = imagePath ? [new AttachmentBuilder(imagePath, { name: imageFileName })] : [];
    return message.channel.send({ embeds: [embed], files });
  }
};
