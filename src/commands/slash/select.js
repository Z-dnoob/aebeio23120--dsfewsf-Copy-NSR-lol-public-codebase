const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');
const { getCharacterData } = require('../../data/characters/character');

const selectedCharacters = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select')
    .setDescription('Select one of your characters by ID.')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Character ID you want to select')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const userId = interaction.user.id;
    const inputId = interaction.options.getString('id');
    const ownedChars = await db.getCharacters(userId); 

    const selectedChar = ownedChars.find(char => char.id === inputId);

    if (!selectedChar) {
      return interaction.editReply({
        content: '🚫 You do not own a character with that ID.'
      });
    }

    const charData = getCharacterData(selectedChar.name);
    const charName = charData?.name || selectedChar.name;
    const imageUrl = charData?.image || null;
    selectedCharacters.set(userId, selectedChar);

    const embed = new EmbedBuilder()
      .setTitle(`You've selected`)
      .setDescription(`${charName} 🎉!\nRun \`/info ${charName}\` to get info!`)
      .setColor('Random');

    if (imageUrl) embed.setImage(imageUrl);

    await interaction.editReply({ embeds: [embed] });
  },

  getSelectedCharacter(userId) {
    return selectedCharacters.get(userId);
  }
};
