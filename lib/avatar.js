export function getDiscordAvatarUrl(user) {
  if (user && user.id && user.avatar) {
    const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return 'https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.' + extension + '?size=256';
  }
  let index = 0;
  try {
    if (user && user.discriminator && user.discriminator !== '0') {
      index = Number(user.discriminator) % 5;
    } else if (user && user.id) {
      index = Number((BigInt(user.id) >> 22n) % 6n);
    }
  } catch { index = 0; }
  return 'https://cdn.discordapp.com/embed/avatars/' + index + '.png';
}