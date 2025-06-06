const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start your journey in the Naruto world!'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const userId = interaction.user.id;
    const characters = await db.getCharacters(userId);

    if (characters.length > 0) {
      return interaction.editReply("You've already started your journey and chosen your characters!");
    }

    const embed = new EmbedBuilder()
      .setTitle('Select a starting character!')
      .setDescription('Get a starting character to help you in the Naruto world!')
      .setColor('Orange')
      .setImage('https://media.discordapp.net/attachments/1374374212990533723/1374375157937733774/start.png?width=473&height=378');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('start_naruto').setLabel('Naruto').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('start_sakura').setLabel('Sakura').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('start_sasuke').setLabel('Sasuke').setStyle(ButtonStyle.Success)
    );

    await interaction.editReply({ embeds: [embed], components: [row], ephemeral: false });
  }
};
