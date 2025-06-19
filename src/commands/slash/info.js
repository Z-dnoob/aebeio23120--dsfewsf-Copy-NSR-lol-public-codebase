const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getCharacterData } = require('../../data/characters/character');
const { buildCharacterEmbed, buildOwnedCharacterEmbed } = require('../../data/characters/embedBuilder');
const { getUser, getCharacterById } = require('../../utils/database');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get stats of a Naruto character by name or your owned character ID')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('Character name or your owned character ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const input = interaction.options.getString('input').trim();

    if (!input) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Missing Input")
        .setDescription("Please provide a character name or owned ID.\nExample: `/info Naruto` or `/info 1`")
        .setColor('Red');
      return interaction.editReply({ embeds: [embed] });
    }

    if (!isNaN(input)) {
      const user = await getUser(interaction.user.id);
      const character = await getCharacterById(user.userId, input);

      if (!character) {
        const embed = new EmbedBuilder()
          .setTitle("❌ Character Not Found")
          .setDescription(`You don't have any character with ID \`${input}\`.`)
          .setColor('Red');
        return interaction.editReply({ embeds: [embed] });
      }

      const { embed, imagePath, imageFileName } = buildOwnedCharacterEmbed(character);
      const files = imagePath ? [new AttachmentBuilder(imagePath, { name: imageFileName })] : [];
      return interaction.editReply({ embeds: [embed], files });
    }

    const characterData = getCharacterData(input);
    if (!characterData) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Character Not Found")
        .setDescription(`Couldn't find a character named **${input}**.`)
        .setColor('Red');
      return interaction.editReply({ embeds: [embed] });
    }

    const { embed, imagePath, imageFileName } = buildCharacterEmbed(characterData);
    const files = imagePath ? [new AttachmentBuilder(imagePath, { name: imageFileName })] : [];
    return interaction.editReply({ embeds: [embed], files });
  }
};
