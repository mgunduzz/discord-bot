module.exports = {
  name: 'queue',
  async execute(player, message) {
    try {
      var queue = player.getQueue(message.guildId);
      if (queue) {
        trimString = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
        return void message.reply({
          embeds: [
            {
              title: 'Now Playing',
              description: trimString(
                `The Current song playing is 🎶 | **${queue.current.title}**! \n 🎶 | **${queue}**! `,
                4095,
              ),
            },
          ],
        });
      }
    } catch (error) {
      message.channel.send('hata => ' + error.message);
    }
  },
};
