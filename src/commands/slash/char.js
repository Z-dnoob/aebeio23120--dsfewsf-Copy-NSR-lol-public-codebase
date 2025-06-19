const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { getUser } = require('../../utils/database');
const { getCharacterData } = require('../../data/characters/character');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('char')
    .setDescription('Show all owned characters'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const userData = await getUser(userId);

    if (!userData || !userData.characters || userData.characters.length === 0) {
      return interaction.reply({ content: "You don't own any characters yet.", ephemeral: true });
    }

    const charactersPerPage = 15;
    let currentPage = 0;
    const totalPages = Math.ceil(userData.characters.length / charactersPerPage);

    const generateEmbed = (page) => {
      const start = page * charactersPerPage;
      const end = start + charactersPerPage;
      const currentCharacters = userData.characters.slice(start, end);

      const embed = new EmbedBuilder()
        .setTitle('⚡ Your Characters ⚡')
        .setDescription(`You have ${userData.characters.length} character(s)!`)
        .setColor('Gold');

      for (let i = 0; i < currentCharacters.length; i++) {
        const char = currentCharacters[i];
        if (!char?.id || !char?.name) continue;

        const data = getCharacterData(char.name);
        const displayName = data?.name || char.name;
        const level = char.level || 1;
        const xp = char.xp || 0;
        const prodNum = char.productionNumber ?? 0;

        embed.addFields({
          name: `#${start + i + 1} - ${displayName}`,
          value: `✏️ ID : \`${char.id}\`\n🔢 Production ID: \`${prodNum}\` \n⭐ Level: ${level} | 🧪 XP: ${xp}`,
          inline: false
        });
      }

      embed.setFooter({ text: `Page ${page + 1} of ${totalPages}` });
      return embed;
    };

    const buildButtons = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('<<')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('>>')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages - 1)
    );

    await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [buildButtons()],
      ephemeral: true
    });

    const replyMsg = await interaction.fetchReply();

    const collector = replyMsg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (btnInt) => {
      if (btnInt.user.id !== userId) {
        return btnInt.reply({ content: "These buttons aren’t for you.", ephemeral: true });
      }

      if (btnInt.customId === 'prev' && currentPage > 0) currentPage--;
      if (btnInt.customId === 'next' && currentPage < totalPages - 1) currentPage++;

      await btnInt.update({
        embeds: [generateEmbed(currentPage)],
        components: [buildButtons()]
      });
    });

    collector.on('end', () => {
      replyMsg.edit({ components: [] }).catch(() => {});
    });
  }
};
