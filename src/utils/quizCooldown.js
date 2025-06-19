const cooldowns = new Map();

function canTakeQuiz(userId) {
  const lastTime = cooldowns.get(userId);
  if (!lastTime) return true;
  return Date.now() - lastTime >= 86400000; // 24 hours
}

function setCooldown(userId) {
  cooldowns.set(userId, Date.now());
}

function getNextAvailableTime(userId) {
  const last = cooldowns.get(userId);
  if (!last) return null;
  return new Date(last + 86400000);
}

module.exports = {
  canTakeQuiz,
  setCooldown,
  getNextAvailableTime
};
