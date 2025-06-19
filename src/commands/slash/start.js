const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  AttachmentBuilder,
  ComponentType,
} = require('discord.js');

const db = require('../../utils/database');
const { getCharacterData } = require('../../data/characters/character');
const { buildCharacterEmbed } = require('../../data/characters/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start your Naruto journey and choose your starter character.'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = await db.getUser(userId);

    if (user.characters.length > 0) {
      return interaction.reply({
        content: "❌ You've already started your journey!",
        ephemeral: true,
      });
    }

    const welcomeEmbed = new EmbedBuilder()
      .setTitle('__Welcome to Naruto Shinobi Reincarnation!__')
      .setDescription(`Commonly know as **NSR**, you are about to begin your journey as shinobi!🌀\n To get started,you will need to choose of the the three starter characters:\n- Naruto Uzumaki\n- Sasuke Uchia\n- Sakura Haruno\n Click on each button below to preview their **stats** and **justsus** before making your choice. Choose wisely - your path to becoming a powerful ninja behings now! 🔥🍥⚡`)
      .setColor('Orange')
      .setImage('https://media.discordapp.net/attachments/1374374212990533723/1382697937020391585/Start.png?ex=684c194d&is=684ac7cd&hm=a536c5cf9fbe9c27c61574b0cc5de9bf13a1900b0db79b6134f8f6f69ef94b15&=&width=525&height=350');

    const characterButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('char_naruto').setLabel('Naruto').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('char_sasuke').setLabel('Sasuke').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('char_sakura').setLabel('Sakura').setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [welcomeEmbed],
      components: [characterButtons],
      ephemeral: false,
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on('collect', async (btn) => {
      if (btn.user.id !== userId) {
        return btn.reply({
          content: '❌ This interaction isn’t for you.',
          ephemeral: true,
        });
      }

      const id = btn.customId;

      if (id === 'go_back') {
        await btn.update({
          embeds: [welcomeEmbed],
          components: [characterButtons],
          files: [],
        });
        return;
      }

      if (id.startsWith('char_')) {
        const chosen = id.split('_')[1];
        const characterData = getCharacterData(chosen);
        if (!characterData) return;

        const { embed, imagePath, imageFileName } = buildCharacterEmbed(characterData);
        const attachment = new AttachmentBuilder(imagePath, { name: imageFileName });

        const confirmRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`confirm_${chosen}`)
            .setLabel('✅ Accept')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('go_back')
            .setLabel('❌ Go Back')
            .setStyle(ButtonStyle.Danger)
        );

        await btn.update({
          embeds: [embed],
          files: [attachment],
          components: [confirmRow],
        });
        return;
      }

      if (id.startsWith('confirm_')) {
        const chosen = id.split('_')[1];
        const characterData = getCharacterData(chosen);
        if (!characterData) return;

        await db.addCharacter(userId, characterData.name);
        await db.addRyo(userId, 75000);

        const finalEmbed = new EmbedBuilder()
          .setTitle('🎉 Congratulations on selecting your character!🎉')
          .setDescription(
            `You've acquired **${characterData.name}**!\nAs a welcoming gift you have been rewarded with <:RyoCoins:1105741695087284234> **75,000 Ryo** to start off your journey!`
          )
          .setColor('Green')
          .setImage('https://media.discordapp.net/attachments/1374374212990533723/1382697937020391585/Start.png?ex=684c194d&is=684ac7cd&hm=a536c5cf9fbe9c27c61574b0cc5de9bf13a1900b0db79b6134f8f6f69ef94b15&=&width=525&height=350');

        await btn.update({
          embeds: [finalEmbed],
          components: [],
          files: [],
        });

        collector.stop();
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] }).catch(() => null);
      } catch (_) {}
    });
  },
};
