module.exports = {
  name: 'shuffle',
  async execute(player, message) {
    try {
      var queue = player.getQueue(message.guildId);
      if (queue) {
        queue.shuffle();
      }
    } catch (error) {
      message.channel.send('hata => ' + error.message);
    }
  },
};
