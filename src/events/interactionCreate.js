const { EmbedBuilder } = require('discord.js');
const db = require('../utils/database');
const characterUtil = require('../data/characters/character');

module.exports = (client) => {
  client.on('interactionCreate', async interaction => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction);
      }

      else if (interaction.isButton()) {
        const userId = interaction.user.id;

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

        const [prefix, action, pageStr] = interaction.customId.split('_');
        if (prefix === 'char' && (action === 'prev' || action === 'next')) {
          const page = parseInt(pageStr);
          const allChars = await db.getCharacters(userId);
          const charMap = characterUtil.getAllCharacters();

          const perPage = 15;
          const totalPages = Math.ceil(allChars.length / perPage);
          let newPage = action === 'prev' ? page - 1 : page + 1;

          const charsToShow = allChars.slice(newPage * perPage, (newPage + 1) * perPage);
          const embed = new EmbedBuilder()
            .setTitle('Characters')
            .setColor('Orange')
            .setDescription(`You have **${allChars.length}** character(s)!`)
            .addFields(charsToShow.map((charId, idx) => {
              const display = characterUtil.getDisplayNameById(charId, charMap);
              return {
                name: `#${newPage * perPage + idx + 1}`,
                value: display,
                inline: true
              };
            }));

          const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
      }
    } catch (error) {
      console.error('❌ Error handling interaction:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'There was an error processing this interaction.', ephemeral: true });
      }
    }
  });
};
