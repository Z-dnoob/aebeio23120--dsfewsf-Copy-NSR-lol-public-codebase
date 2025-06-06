const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const db = require('../../utils/database');
const { getCharacterData } = require('../../data/characters/character');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('char')
    .setDescription('Show all your Naruto characters.'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const allChars = await db.getCharacters(userId);

    if (!allChars.length) {
      return interaction.reply({
        content: 'You do not own any characters yet.',
        ephemeral: true
      });
    }

    const perPage = 15;
    let page = 0;
    const totalPages = Math.ceil(allChars.length / perPage);

    const getEmbed = (pageIndex) => {
      const charsToShow = allChars.slice(pageIndex * perPage, (pageIndex + 1) * perPage);
      const embed = new EmbedBuilder()
        .setTitle('Characters')
        .setColor('Orange')
        .setDescription(`You have **${allChars.length}** character(s)!`);

      charsToShow.forEach((char, index) => {
        const data = getCharacterData(char.name);
        const displayName = data?.name || char.name;

        embed.addFields({
          name: `#${pageIndex * perPage + index + 1} - ${displayName}`,
          value: `🆔 \`${char.id}\`\n⭐ Level: ${char.level} | 🧪 XP: ${char.xp}`,
          inline: false
        });
      });

      embed.setFooter({ text: `Page ${pageIndex + 1} of ${totalPages}` });
      return embed;
    };

    const buttons = (pageIndex) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('<<')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === 0),
        new ButtonBuilder()
          .setCustomId('page')
          .setLabel(`${pageIndex + 1}/${totalPages}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('>>')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex + 1 >= totalPages)
      );

    await interaction.reply({
      embeds: [getEmbed(page)],
      components: [buttons(page)],
      ephemeral: false
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id && ['prev', 'next'].includes(i.customId),
      time: 60000
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'prev') page--;
      if (i.customId === 'next') page++;

      await i.update({
        embeds: [getEmbed(page)],
        components: [buttons(page)]
      });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch (_) {}
    });
  }
};
