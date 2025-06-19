const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../utils/database');
const quizData = require('../../data/other/naruto_questions.json');
const { getSelectedCharacter } = require('../../state/selectedCharacter');
const {
  canTakeQuiz,
  setCooldown,
  getNextAvailableTime
} = require('../../utils/quizCooldown'); 




const cooldowns = new Map();

module.exports = {
  name: 'quiz',
  description: 'Take a Naruto quiz for XP and Ryo!',
  async execute(message) {
    const userId = message.author.id;
    const selected = getSelectedCharacter(userId);

    if (!selected) {
      return message.reply('🥲 Oh-no! Please select a character using `nrselect <id>` first!');
    }

    if (!canTakeQuiz(userId)) {
  const next = getNextAvailableTime(userId);
  return message.reply(`⏱️ You can take the quiz again at ${next.toLocaleString()}.`);
}


    const startEmbed = new EmbedBuilder()
      .setTitle('📝 Naruto Quiz')
      .setDescription('🍥 Test your Naruto knowledge and earn 💫 XP + <:RyoCoins:1105741695087284234> Ryo!')
      .setColor('Orange')
      .setImage('https://media.discordapp.net/attachments/1374374212990533723/1381604296810041344/BCO.png');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('quiz_start')
        .setLabel('✏️ Take Test')
        .setStyle(ButtonStyle.Secondary)
    );

    const quizMsg = await message.channel.send({ embeds: [startEmbed], components: [row] });

    const state = { qIndex: -1, score: 0, questions: [] };

    const collector = quizMsg.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time: 2 * 60 * 1000
    });

    collector.on('collect', async i => {
      await i.deferUpdate();

      if (i.customId === 'quiz_start') {
        const selectedQuestions = quizData.sort(() => Math.random() - 0.5).slice(0, 5);
state.questions = selectedQuestions.map(q => {
  const options = [...q.options].sort(() => Math.random() - 0.5);
  return {
    question: q.question,
    correct: q.correct,
    options
  };
});

        state.qIndex = 0;
        return sendQuestion(i);
      }

      if (i.customId.startsWith('opt_')) {
        const idx = parseInt(i.customId.split('_')[1]);
        const currentQ = state.questions[state.qIndex];
        if (currentQ.options[idx] === currentQ.correct) state.score++;
        state.qIndex++;
        if (state.qIndex < state.questions.length) {
          return sendQuestion(i);
        } else {
          collector.stop();
          return finishQuiz(i);
        }
      }
    });

    collector.on('end', () => setCooldown(userId));

    async function sendQuestion(interaction) {
      const q = state.questions[state.qIndex];
      const embed = new EmbedBuilder()
        .setTitle(`🧠 Question ${state.qIndex + 1}`)
        .setDescription(decodeURIComponent(q.question))
        .setColor('Orange')
        .addFields(
          q.options.map((opt, idx) => ({
            name: `(${String.fromCharCode(65 + idx)})`,
            value: decodeURIComponent(opt),
            inline: true
          }))
        );

      const row = new ActionRowBuilder().addComponents(
        q.options.map((_, idx) =>
          new ButtonBuilder()
            .setCustomId(`opt_${idx}`)
            .setLabel(String.fromCharCode(65 + idx))
            .setStyle(ButtonStyle.Secondary)
        )
      );

      await interaction.editReply({ embeds: [embed], components: [row] });
    }

    async function finishQuiz(interaction) {
      const xp = state.score * 100;
      const ryo = state.score * 100;

      await db.addXpToCharacter(userId, selected.id, xp);
      await db.addRyo(userId, ryo);

      const embed = new EmbedBuilder()
        .setTitle(state.score > 0 ? '🎉 Quiz Complete!' : '🥲 Better luck next time!')
        .setColor(state.score > 0 ? 'Green' : 'Red')
        .setImage(state.score > 0
          ? 'https://media.discordapp.net/attachments/1374374212990533723/1381607075242709033/BCO.png'
          : 'https://media.discordapp.net/attachments/1374374212990533723/1381608326411976775/BCO.png'
        )
        .addFields({
          name: 'Results',
          value: `✅ Correct: ${state.score}\n❌ Wrong: ${5 - state.score}\n💫 XP Earned: ${xp}\n<:RyoCoins:1105741695087284234> Ryo Earned: ${ryo}`
        });

      await interaction.editReply({ embeds: [embed], components: [] });
    }
  }
};
