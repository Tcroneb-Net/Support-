
function fancyFont(text) {
  const base = 'abcdefghijklmnopqrstuvwxyz';
  const fancy = '𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏';

  return text.split('').map(char => {
    const index = base.indexOf(char.toLowerCase());
    return index >= 0 ? fancy[index] : char;
  }).join('');
}

module.exports = { fancyFont };
