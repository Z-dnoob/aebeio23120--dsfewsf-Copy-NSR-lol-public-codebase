const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,              
    GatewayIntentBits.GuildMessages,    
    GatewayIntentBits.MessageContent,
     GatewayIntentBits.GuildMembers      
  ],
  partials: [Partials.Channel]
});

module.exports = client;
