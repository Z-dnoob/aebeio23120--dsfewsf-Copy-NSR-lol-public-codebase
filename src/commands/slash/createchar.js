const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createchar')
    .setDescription('Create a character JSON snippet and send it to a specific channel (restricted use)')
    .addStringOption(opt => opt.setName('name').setDescription('Character name').setRequired(true))
    .addStringOption(opt => opt.setName('rarity').setDescription('Rarity').setRequired(true))
    .addStringOption(opt => opt.setName('chakra_nature').setDescription('Chakra Nature').setRequired(true))
    .addStringOption(opt => opt.setName('sub_natures').setDescription('Comma-separated sub-natures').setRequired(true))
    .addIntegerOption(opt => opt.setName('hp').setDescription('HP').setRequired(true))
    .addIntegerOption(opt => opt.setName('chakra').setDescription('Chakra').setRequired(true))
    .addIntegerOption(opt => opt.setName('attack').setDescription('Attack').setRequired(true))
    .addIntegerOption(opt => opt.setName('defense').setDescription('Defense').setRequired(true))
    .addIntegerOption(opt => opt.setName('agility').setDescription('Agility').setRequired(true))
    .addAttachmentOption(opt => opt.setName('image').setDescription('Character image attachment').setRequired(true))
    .addStringOption(opt => opt.setName('move1').setDescription('Move 1 name').setRequired(true))
    .addIntegerOption(opt => opt.setName('dmgmove1').setDescription('Move 1 damage').setRequired(true))
    .addStringOption(opt => opt.setName('move2').setDescription('Move 2 name').setRequired(true))
    .addIntegerOption(opt => opt.setName('dmgmove2').setDescription('Move 2 damage').setRequired(true))
    .addStringOption(opt => opt.setName('move3').setDescription('Move 3 name').setRequired(true))
    .addIntegerOption(opt => opt.setName('dmgmove3').setDescription('Move 3 damage').setRequired(true))
    .addStringOption(opt => opt.setName('move4').setDescription('Move 4 name').setRequired(true))
    .addIntegerOption(opt => opt.setName('dmgmove4').setDescription('Move 4 damage').setRequired(true)),

  async execute(interaction) {
    const allowedUsers = ['1277877948711571477', '1213903083197698061', '927606661789675581', '1239065381373476894'];
    if (!allowedUsers.includes(interaction.user.id)) {
      return interaction.reply({ content: '🥲 This command is bugged!', ephemeral: true });
    }

    const name = interaction.options.getString('name');
    const rarity = interaction.options.getString('rarity');
    const chakraNature = interaction.options.getString('chakra_nature');
    const subNatures = interaction.options.getString('sub_natures').split(',').map(s => s.trim());
    const hp = interaction.options.getInteger('hp');
    const chakra = interaction.options.getInteger('chakra');
    const attack = interaction.options.getInteger('attack');
    const defense = interaction.options.getInteger('defense');
    const agility = interaction.options.getInteger('agility');
    const imageAttachment = interaction.options.getAttachment('image');

    const move1 = interaction.options.getString('move1');
    const dmgMove1 = interaction.options.getInteger('dmgmove1');
    const move2 = interaction.options.getString('move2');
    const dmgMove2 = interaction.options.getInteger('dmgmove2');
    const move3 = interaction.options.getString('move3');
    const dmgMove3 = interaction.options.getInteger('dmgmove3');
    const move4 = interaction.options.getString('move4');
    const dmgMove4 = interaction.options.getInteger('dmgmove4');

    const charJson = {
      name,
      rarity,
      chakraNature,
      subNatures,
      stats: {
        hp,
        chakra,
        attack,
        defense,
        agility
      },
      boost: [],
      moves: [
        { name: move1, damage: dmgMove1 },
        { name: move2, damage: dmgMove2 },
        { name: move3, damage: dmgMove3 },
        { name: move4, damage: dmgMove4 }
      ],
      emojis: {
        hp: "<:hp:1105746545032302644>",
        chakra: "<:Chakra:1236963666046484521>",
        attack: "<:attack:1105746308490346508>",
        defense: "<:defense:1105747031978414151>",
        agility: "<:Agility:1236964906591584286>"
      },
      image: imageAttachment.url // 👈 Updated to include the uploaded image URL
    };

    const jsonCode = JSON.stringify(charJson, null, 2);

    const channel = interaction.client.channels.cache.get('1389950204630925372');
    if (!channel) {
      return interaction.reply({ content: '❌ Could not find the output channel.', ephemeral: true });
    }

    // Create attachment object from the URL
    const image = new AttachmentBuilder(imageAttachment.url, { name: `${name.replace(/\s+/g, '_')}.png` });

    await channel.send({
      content: `Stats for **${name}**\n\`\`\`js\n${jsonCode}\n\`\`\``,
      files: [image]
    });

    return interaction.reply({ content: `🎉 JSON for **${name}** has been sent to <#1389950204630925372> with the image!`, ephemeral: true });
  }
};
