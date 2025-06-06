const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getCharacterData } = require('../../data/characters/character');
const { buildCharacterEmbed } = require('../../data/characters/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get information about a Naruto character')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the character')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const name = interaction.options.getString('name');
    const character = getCharacterData(name);

    if (!character) {
      return interaction.editReply({ content: 'Character not found.', ephemeral: true });
    }

    const { embed, imagePath, imageFileName } = buildCharacterEmbed(character);
    const attachment = new AttachmentBuilder(imagePath, { name: imageFileName });

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  }
};
