module.exports = {
  name: 'play',
  async execute(player, message) {
    try {
      var queue = player.getQueue(message.guildId);
      if (queue) {
        queue.destroy();
      }
    } catch (error) {
      message.channel.send('hata => ' + error.message);
    }
  },
};
