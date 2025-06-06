const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Pay a user a chosen amount in a selected currency.')
    .addUserOption(option =>
      option.setName('user').setDescription('The user to pay').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Amount to pay').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sender = interaction.user;
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (target.bot || sender.id === target.id || amount <= 0) {
      return interaction.editReply({
        content: '❌ Invalid payment request.',
        ephemeral: true
      });
    }

    const currencyOptions = [
      {
        label: 'Ryo',
        emoji: '<:RyoCoins:1105741695087284234>',
        value: 'ryo'
      },
      {
        label: 'Cinnabar Elixir',
        emoji: '<a:cinnabarelixir:1251196412201402482>',
        value: 'cinnabarElixir'
      },
      {
        label: 'Hidden Scrolls',
        emoji: '<:Hiddenscrolls:1237084469974925462>',
        value: 'hiddenScroll'
      }
    ];

    const embed = new EmbedBuilder()
      .setTitle(`Pay ${target.displayName}`)
      .setDescription('In which currency would you like to pay?')
      .setThumbnail(sender.displayAvatarURL({ dynamic: true }))
      .setColor('Random');

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_currency')
        .setPlaceholder('Choose currency')
        .addOptions(
          currencyOptions.map(option => ({
            label: option.label,
            value: option.value,
            emoji: option.emoji
          }))
        )
    );

    const selection = await interaction.editReply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    const collector = selection.createMessageComponentCollector({
      time: 15000,
      max: 1
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== sender.id) {
        return i.reply({ content: "This selection isn't for you.", ephemeral: true });
      }

      const selectedCurrency = i.values[0];
      const senderBalance = (await db.getBalance(sender.id))[selectedCurrency];

      if (senderBalance < amount) {
        return i.update({
          content: `❌ You don't have enough ${selectedCurrency} to pay.`,
          embeds: [],
          components: []
        });
      }

      await db[`subtract${capitalize(selectedCurrency)}`](sender.id, amount);
      await db[`add${capitalize(selectedCurrency)}`](target.id, amount);

      const currency = currencyOptions.find(c => c.value === selectedCurrency);
      const successEmbed = new EmbedBuilder()
        .setTitle(`${currency.emoji} Payment Successful!`)
        .setDescription(`Very generous move! ${sender} paid ${target} ${currency.emoji} ${currency.label} \`${amount}\`!`)
        .setFooter({ text: `Transaction completed` })
        .setColor('Random');

      await i.update({
        embeds: [successEmbed],
        components: []
      });

      const logEmbed = new EmbedBuilder()
        .setTitle(`${sender.username} -> ${target.username}`)
        .setDescription(`${sender} transferred ${target} ${currency.emoji} ${currency.label} \`${amount}\`!`)
        .setThumbnail(sender.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Transaction recorded on ${new Date().toLocaleString()}` })
        .setColor('Random');

      const logChannel = interaction.client.channels.cache.get('1260998176455000107') ||
                         await interaction.client.channels.fetch('1260998176455000107').catch(() => null);

      if (logChannel) {
        logChannel.send({ embeds: [logEmbed] }).catch(console.error);
      } else {
        console.warn('Payment log channel not found or accessible.');
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.editReply({ content: '❌ Timed out.', components: [] });
      }
    });
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
