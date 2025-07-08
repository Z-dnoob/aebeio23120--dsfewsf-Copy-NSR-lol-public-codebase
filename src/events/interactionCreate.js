const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/database');
const characterUtil = require('../data/characters/character');
const bannerManager = require('../utils/bannerManager');

module.exports = (client) => {
  client.on('interactionCreate', async interaction => {
    try {
      const userId = interaction.user.id;

      // Slash commands
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
      }

      // Buttons
      else if (interaction.isButton()) {
        // Start button logic
        if (interaction.customId.startsWith('start_')) {
          const name = interaction.customId.split('_')[1];
          const character = await characterUtil.getCharacterData(name);
          if (!character) {
            return interaction.reply({ content: 'Character not found!', ephemeral: true });
          }

          await db.addCharacter(userId, character.name);
          await db.addRyo(userId, 75000);

          const embed = new EmbedBuilder()
            .setTitle('Success!')
            .setDescription(`You've acquired **${character.name}**!\nHere is <:RyoCoins:1105741695087284234> 75k ryo to help in your journey!`)
            .setColor('Green')
            .setImage('https://media.discordapp.net/attachments/1374374212990533723/1374375157937733774/start.png?width=473&height=378');

          return interaction.update({ embeds: [embed], components: [] });
        }

        // Pagination logic
        const [prefix, action, pageStr] = interaction.customId.split('_');
        if (prefix === 'char' && (action === 'prev' || action === 'next')) {
          const page = parseInt(pageStr);
          const allChars = await db.getCharacters(userId);
          const perPage = 15;
          const totalPages = Math.ceil(allChars.length / perPage);
          let newPage = action === 'prev' ? page - 1 : page + 1;

          const charsToShow = allChars.slice(newPage * perPage, (newPage + 1) * perPage);
          const embed = new EmbedBuilder()
            .setTitle('Characters')
            .setColor('Orange')
            .setDescription(`You have **${allChars.length}** character(s)!`)
            .addFields(charsToShow.map((char, idx) => ({
              name: `#${newPage * perPage + idx + 1}`,
              value: char.name,
              inline: true
            })));

          const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`char_prev_${newPage}`)
              .setLabel('<<')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(newPage === 0),
            new ButtonBuilder()
              .setCustomId('char_page')
              .setLabel(`${newPage + 1}/${totalPages}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId(`char_next_${newPage}`)
              .setLabel('>>')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(newPage + 1 >= totalPages)
          );

          return interaction.update({
            embeds: [embed],
            components: [buttons]
          });
        }

        // Banner buy button logic
        if (interaction.customId.startsWith('buy_')) {
          const index = parseInt(interaction.customId.split('_')[1]);
          const banner = bannerManager.getBanner();
          const charData = banner.characters[index];

          if (!charData) {
            return interaction.reply({ content: '⛔ This character is no longer available!', ephemeral: true });
          }

          const confirmEmbed = new EmbedBuilder()
            .setTitle('🤔 Confirm Purchase')
            .setDescription(`Are you sure you want to buy **${charData.name}** for **${charData.price} ryo**?`)
            .setColor('Red');

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`confirmbuy_yes_${index}`)
              .setLabel('Yes')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`confirmbuy_no`)
              .setLabel('No')
              .setStyle(ButtonStyle.Danger)
          );

          return interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });
        }

        // Confirm purchase
        if (interaction.customId.startsWith('confirmbuy_yes_')) {
          const index = parseInt(interaction.customId.split('_')[2]);
          const banner = bannerManager.getBanner();
          const charData = banner.characters[index];

          if (!charData) {
            return interaction.update({ content: '🥲 Character no longer available!', embeds: [], components: [] });
          }

          const balance = await db.getBalance(userId);
          if (balance.ryo < charData.price) {
            return interaction.update({ content: '💸 You do not have enough ryo to buy this character.', embeds: [], components: [] });
          }

          await db.subtractRyo(userId, charData.price);
          await db.addCharacter(userId, charData.name);

          return interaction.update({ content: `⚔️ You successfully bought **${charData.name}** for ${charData.price} ryo!`, embeds: [], components: [] });
        }

        // Cancel purchase
        if (interaction.customId === 'confirmbuy_no') {
          return interaction.update({ content: '⛔ Purchase cancelled.', embeds: [], components: [] });
        }
      }

    } catch (error) {
      console.error('❌ Error handling interaction:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'There was an error processing this interaction.', ephemeral: true });
      }
    }
  });
};
