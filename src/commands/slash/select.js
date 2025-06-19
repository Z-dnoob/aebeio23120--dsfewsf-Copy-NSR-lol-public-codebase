const { SlashCommandBuilder } = require('discord.js');
const handleCharacterSelection = require('../../handlers/selectHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select')
    .setDescription('Select a character by ID')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Character ID to select')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const charId = interaction.options.getString('id');

    await interaction.deferReply();
    await handleCharacterSelection(userId, charId, content => interaction.editReply(content));
  }
};
