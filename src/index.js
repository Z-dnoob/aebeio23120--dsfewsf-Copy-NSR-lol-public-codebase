const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
});

client.commands = new Collection();
const slashCommands = [];

const slashCommandsPath = path.join(__dirname, 'commands/slash');
const slashFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

for (const file of slashFiles) {
  const command = require(path.join(slashCommandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
  } else {
    console.warn(`[⚠️] Slash command file ${file} is missing "data" or "execute".`);
  }
}


require('./events/interactionCreate')(client);
require('./events/messageCreate')(client);


client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    console.log('🔄 Registering global slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: slashCommands }
    );
    console.log('✅ Slash commands registered successfully.');
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
  }

  client.user.setPresence({
    activities: [{ name: 'Naruto', type: 3 }],
    status: 'dnd',
  });
});


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  client.login(process.env.TOKEN); 
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});


// mongodb+srv://nsrdev:EojuRtUG5YAD9LMV@nsrdev.hmp19ai.mongodb.net/?retryWrites=true&w=majority&appName=Nsrdev