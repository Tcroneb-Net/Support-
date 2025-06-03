
const proUsers = new Set();

function activatePro(id) {
  proUsers.add(id);
}

function isPro(id) {
  return proUsers.has(id);
}

module.exports = { activatePro, isPro };
