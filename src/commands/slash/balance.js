const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your current balance'),

  async execute(interaction) {
    await interaction.deferReply(); 

    const user = await db.getUser(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Balance`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(
        `- <:RyoCoins:1105741695087284234> Ryo: ${user.ryo}\n` +
        `- <a:cinnabarelixir:1251196412201402482> Cinnabar Elixir: ${user.cinnabarElixir}\n` +
        `- <:Hiddenscrolls:1237084469974925462> Hidden Scrolls: ${user.hiddenScrolls || 0}`
      )
      .setColor('Green');

    await interaction.editReply({ embeds: [embed] });
  }
};
