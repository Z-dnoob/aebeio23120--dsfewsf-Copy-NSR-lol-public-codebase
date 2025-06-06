const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'start',
  description: 'Start your journey in the Naruto world!',

  async execute(message) {
    const userId = message.author.id;

    const user = await db.getUser(userId);
    if (user.characters.length > 0) {
      return message.reply("You've already started your journey and chosen your characters!");
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

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
