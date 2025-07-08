const { generateBanner } = require('../utils/bannerManager');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = (client) => {
  client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const bannerChannel = client.channels.cache.get('1392190809545117836');

    async function postBanner() {
      const bannerChars = generateBanner();

      const embed = new EmbedBuilder()
        .setTitle('<:RyoCoins:1105741695087284234> Ryo Banner')
        .setDescription(
          bannerChars.map((c, i) => `- ${i + 1}. ${c.name} - ${c.price} ryo`).join('\n') +
          `\n\nNext banner <t:${Math.floor((Date.now() + 30 * 60 * 1000) / 1000)}:R>`
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

      await bannerChannel.send({ embeds: [embed], components: [buttons] });
    }

    await postBanner();
    setInterval(postBanner, 30 * 60 * 1000);
  });
};
