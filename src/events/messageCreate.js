const fs = require('fs');
const path = require('path');

const prefix = 'nr';

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const commandsPath = path.join(__dirname, '../commands/prefix');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));

      if (command.name && command.name.toLowerCase() === commandName) {
        try {
          await command.execute(message, args);
        } catch (error) {
          console.error(`Error executing command ${commandName}:`, error);
          await message.channel.send('🥲 There was an **error** trying to execute that command.\n⚠️ Report it to the Devs : https://discord.gg/Dz4NJnE4gS ');
        }
        return;
      }
    }

    await message.channel.send('🤔 Command not found!');
  });
};
