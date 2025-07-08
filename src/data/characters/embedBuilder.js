const { getCharacterData } = require('./character');
const { EmbedBuilder } = require('discord.js');
const path = require('path');

function buildCharacterEmbed(characterData) {
  if (!characterData || !characterData.name) {
    return {
      embed: new EmbedBuilder()
        .setTitle("Character Not Found")
        .setDescription("❌ Could not load character data. Please contact the developers.")
        .setColor("Red"),
      imageFileName: null,
      imagePath: null
    };
  }

  const {
    name, rarity = "Unknown", chakraNature = "Unknown", subNatures = [],
    stats = {}, moves = [], emojis = {}, image
  } = characterData;

  const imageFileName = image || null;
  const imagePath = imageFileName
    ? path.resolve(__dirname, '../../assets/images/characters', imageFileName)
    : null;

  const description = [
    `**__Information__**`,
    `- ⭐ Rarity: ${rarity}`,
    `- ⚡ Chakra Nature: ${chakraNature}`,
    `- 🔥 Chakra Sub-natures: ${subNatures.length ? subNatures.join(', ') : 'None'}`,
    ``,
    `**__Statistics__**`,
    `${emojis.hp || '❤️'} Health: ${stats.hp || 0}`,
    `${emojis.chakra || '🔋'} Chakra: ${stats.chakra || 0}`,
    `${emojis.attack || '⚔️'} Attack Damage: ${stats.attack || 0}`,
    `${emojis.defense || '🛡️'} Defense: ${stats.defense || 0}`,
    `${emojis.agility || '💨'} Agility: ${stats.agility || 0}`,
    ``,
    `**__Moves__**`,
    moves.length
      ? moves.map((m, i) => `${i + 1}. ${m.name}\n↳ <:attack:1105746308490346508> Damage: ${m.damage}`).join('\n')
      : 'No moves available.'
  ].join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`${name}'s Stats`)
    .setDescription(description)
    .setColor("Random");

  if (imageFileName) {
    embed.setImage(`attachment://${imageFileName}`);
  }

  return { embed, imageFileName, imagePath };
}

function buildOwnedCharacterEmbed(character) {
  if (!character || !character.name) {
    return {
      embed: new EmbedBuilder()
        .setTitle("Character Not Found")
        .setDescription("❌ This character could not be loaded. Contact the developers.")
        .setColor("Red"),
      imageFileName: null,
      imagePath: null
    };
  }

  const {
    id, name, level = 1, xp = 0, hp = 0, chakra = 0, attack = 0, defense = 0,
    agility = 0, yin = 0, yang = 0, productionNumber = 0
  } = character;

  // Fallback from character JSON if needed
  const jsonData = getCharacterData(name) || {};
  const rarity = character.rarity || jsonData.rarity || 'Unknown';
  const chakraNature = character.chakraNature || jsonData.chakraNature || 'Unknown';
  const imageFileName = character.image || jsonData.image || null;
  const imagePath = imageFileName
    ? path.resolve(__dirname, '../../assets/images/characters', imageFileName)
    : null;

  const description = [
    `✏️ ID: \`${id}\``,
    ``,
    `**__Information__**`,
    `- ⭐ Rarity: ${rarity}`,
    `- <:Chakra:1236963666046484521> Chakra Nature: ${chakraNature}`,
    ``,
    `**__Boosts__**`,
    `- <:yin:1105757844105613402> Yin: ${yin} (+${yin} Defense)`,
    `- <:yang:1105757876481433762> Yang: ${yang} (+${yang} HP)`,
    ``,
    `**__Statistics__**`,
    `- <:Chakra:1236963666046484521> Chakra Level: ${chakra}`,
    `- 💫 Level: ${level}/100 [ ${xp} ]`,
    `- <:hp:1105746545032302644> Health: ${hp}`,
    `- <:Agility:1236964906591584286> Speed: ${agility}`,
    `- <:attack:1105746308490346508> Damage: ${attack}`,
    `- <:defense:1105747031978414151> Defence: ${defense}`
  ].join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`${name}'s Stats!`)
    .setDescription(description)
    .setFooter({ text: `Production Number: #${productionNumber}` })
    .setColor("Random");

  if (imageFileName) {
    embed.setImage(`attachment://${imageFileName}`);
  }

  return { embed, imageFileName, imagePath };
}
module.exports = {
  buildCharacterEmbed,
  buildOwnedCharacterEmbed
};
