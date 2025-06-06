const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'balance',
  description: 'Check your current balance',

  async execute(message) {
    const user = await db.getUser(message.author.id);

    const embed = new EmbedBuilder()
      .setTitle(`${message.author.username}'s balance`)
      .setThumbnail(message.author.displayAvatarURL())
      .setDescription(
        `- <:RyoCoins:1105741695087284234> Ryo - ${user.ryo}\n` +
        `- <a:cinnabarelixir:1251196412201402482> Cinnabar Elixir - ${user.cinnabarElixir}\n` +
        `- <:Hiddenscrolls:1237084469974925462> Hidden Scroll - ${user.hiddenScroll}`
      )
      .setColor('Green');

    await message.channel.send({ embeds: [embed] });
  }
};
