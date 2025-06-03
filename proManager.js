
const proUsers = new Set();

function activatePro(userId) {
  proUsers.add(userId);
}

function isPro(userId) {
  return proUsers.has(userId);
}

module.exports = { activatePro, isPro };
