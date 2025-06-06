const { EmbedBuilder } = require('discord.js');
const path = require('path');

function buildCharacterEmbed(characterData) {
  const { name, rarity, chakraNature, subNatures, stats, moves, emojis, image } = characterData;

  const imageFileName = image; 
  const imagePath = path.join(__dirname, '../../assets/images/characters', imageFileName); 

  const embed = new EmbedBuilder()
    .setTitle(`${name}'s Stats`)
    .setDescription(
      `__Information__\n` +
      `> Rarity: ${rarity}\n` +
      `> Chakra Nature: ${chakraNature}\n` +
      `> Chakra Sub-natures: ${subNatures.join(', ')}\n\n` +
      `__Statistics__\n` +
      `${emojis.hp} HP: ${stats.hp}\n` +
      `${emojis.chakra} Chakra: ${stats.chakra}\n` +
      `${emojis.attack} Attack Damage: ${stats.attack}\n` +
      `${emojis.defense} Defense: ${stats.defense}\n` +
      `${emojis.agility} Agility: ${stats.agility}\n\n` +
      `__Moves__\n` +
      moves.map((move, i) => `${i + 1}. ${move.name}\n> Damage: ${move.damage}`).join('\n')
    )
    .setImage(`attachment://${imageFileName}`)
    .setColor("Orange");

  return { embed, imageFileName, imagePath };
}

module.exports = { buildCharacterEmbed };
