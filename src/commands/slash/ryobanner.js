const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getBanner } = require('../../utils/bannerManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ryobanner')
    .setDescription('View the current Ryo Banner and buy characters!'),
  
  async execute(interaction) {
    const banner = getBanner();
    const bannerChars = banner.characters;

    if (!bannerChars.length) {
      return interaction.reply({ content: '❌ No active banner right now!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('<:RyoCoins:1105741695087284234> Ryo Banner')
      .setDescription(
        bannerChars.map((c, i) => `- ${i + 1}. ${c.name} - ${c.price} ryo`).join('\n') +
        `\n\nNext banner <t:${Math.floor(banner.expiresAt / 1000)}:R>`
      )
      .setColor(0xFFA500)
      .setFooter({ text: `NSR | Naruto Shinobi Reincarnated | ${new Date().toLocaleString()}` });

    const buttons = new ActionRowBuilder()
      .addComponents(
        ...bannerChars.map((c, i) =>
          new ButtonBuilder()
            .setCustomId(`buy_${i}`)
            .setLabel(`Buy ${i + 1}`)
            .setStyle(ButtonStyle.Secondary)
        )
      );

    await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
  }
};
