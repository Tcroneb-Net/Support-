
function fancyFont(text) {
  return text.split('').map(c => c + '̶').join('');
}

module.exports = { fancyFont };
