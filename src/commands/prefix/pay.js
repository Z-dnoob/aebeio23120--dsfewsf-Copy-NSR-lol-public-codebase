const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'pay',
  description: 'Pay another user with selected currency',
  async execute(message, args) {
    const sender = message.author;
    const mention = message.mentions.users.first();
    const amountArg = args.find(arg => !isNaN(arg));
    const amount = parseInt(amountArg);

    const target = mention || args.map(arg => message.mentions.users.get(arg)).find(Boolean);

    if (!target || target.bot || sender.id === target.id || !amount || amount <= 0) {
      return message.reply('❌ Usage: `pay @user <amount>` or `pay <amount> @user`');
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
      .setTitle(`Pay ${target.username}`)
      .setDescription('In which currency would you like to pay?')
      .setThumbnail(sender.displayAvatarURL({ dynamic: true }))
      .setColor('Random');

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`pay_currency_select_${message.id}`)
        .setPlaceholder('Choose currency')
        .addOptions(currencyOptions)
    );

    const sent = await message.reply({
      embeds: [embed],
      components: [row]
    });

    const collector = sent.createMessageComponentCollector({
      time: 15000,
      max: 1,
      filter: (i) =>
        i.user.id === sender.id &&
        i.customId === `pay_currency_select_${message.id}`
    });

    collector.on('collect', async (i) => {
      const selected = i.values[0];

      const senderBalance = (await db.getBalance(sender.id))[selected];
      if (senderBalance < amount) {
        return i.update({
          content: `❌ You don't have enough ${selected} to complete this transaction.`,
          embeds: [],
          components: []
        });
      }

      // Proceed with payment
      await db[`subtract${capitalize(selected)}`](sender.id, amount);
      await db[`add${capitalize(selected)}`](target.id, amount);

      const currency = currencyOptions.find(c => c.value === selected);

      const successEmbed = new EmbedBuilder()
        .setTitle(`${currency.emoji} Payment Successful!`)
        .setDescription(`Very generous move! ${sender} paid ${target} ${currency.emoji} ${currency.label} \`${amount}\`!`)
        .setColor('Random')
        .setFooter({ text: new Date().toLocaleString() });

      await i.update({
        embeds: [successEmbed],
        components: []
      });

      // Logging
      const logEmbed = new EmbedBuilder()
        .setTitle(`${sender.username} -> ${target.username}`)
        .setDescription(`${sender} transferred ${target} ${currency.emoji} ${currency.label} \`${amount}\`!`)
        .setThumbnail(sender.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Transaction recorded on ${new Date().toLocaleString()}` })
        .setColor('Random');

      const logChannel = message.client.channels.cache.get('1260998176455000107') ||
                         await message.client.channels.fetch('1260998176455000107').catch(() => null);

      if (logChannel) {
        logChannel.send({ embeds: [logEmbed] }).catch(console.error);
      } else {
        console.warn('Payment log channel not found or accessible.');
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        sent.edit({ content: '❌ Timed out.', components: [] }).catch(() => {});
      }
    });
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
