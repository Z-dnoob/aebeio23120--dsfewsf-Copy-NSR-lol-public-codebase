const {
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
  name: 'start',
  description: 'Start your Naruto adventure!',

  async execute(message) {
    const userId = message.author.id;
    const user = await db.getUser(userId);

    if (user.characters.length > 0) {
      return message.reply("❌ You've already started your journey!");
    }

    const welcomeEmbed = new EmbedBuilder()
      .setTitle('__Welcome to Naruto Shinobi Reincarnation!__')
      .setDescription('Commonly know as **NSR**, you are about to begin your journey as shinobi!🌀\n To get started,you will need to choose of the the three starter characters:\n- Naruto Uzumaki\n- Sasuke Uchia\n- Sakura Haruno\n Click on each button below to preview their **stats** and **justsus** before making your choice. Choose wisely - your path to becoming a powerful ninja behings now! 🔥🍥⚡ ')
      .setColor('Orange')
      .setImage('https://media.discordapp.net/attachments/1374374212990533723/1374375157937733774/start.png?width=473&height=378');

    const characterButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('char_naruto').setLabel('Naruto').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('char_sasuke').setLabel('Sasuke').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('char_sakura').setLabel('Sakura').setStyle(ButtonStyle.Primary)
    );

    const msg = await message.channel.send({
      embeds: [welcomeEmbed],
      components: [characterButtons],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== userId) {
        return interaction.reply({
          content: "❌ This interaction isn't for you!",
          flags: 64, // Use flags instead of deprecated "ephemeral"
        });
      }

      const id = interaction.customId;

      if (id === 'go_back') {
        await interaction.update({
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

        await interaction.update({
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
          .setImage('https://media.discordapp.net/attachments/1374374212990533723/1374375157937733774/start.png?width=473&height=378');

        await interaction.update({
          embeds: [finalEmbed],
          components: [],
          files: [],
        });

        collector.stop();
      }
    });

    collector.on('end', async () => {
      try {
        await msg.edit({ components: [] }).catch(() => null);
      } catch (_) {}
    });
  },
};
