module.exports = {
  name: 'skip',
  async execute(player, message) {
    try {
      var queue = player.getQueue(message.guildId);
      if (queue) {
        queue.skip();
      }
    } catch (error) {
      message.channel.send('hata => ' + error.message);
    }
  },
};
