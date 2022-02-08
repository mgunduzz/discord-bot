module.exports = {
  name: 'play',
  async execute(query, player, message) {
    try {
      const searchResult = await player
        .search(query, {
          searchEngine: 0,
        })
        .catch(() => {});

      if (!searchResult || !searchResult.tracks.length) message.channel.send('şarkı veya liste bulunamadı.');

      const queue = await player.createQueue(message.guild, {
        ytdlOptions: {
          quality: 'highest',
          filter: 'audioonly',
          highWaterMark: 1 << 25,
          dlChunkSize: 0,
        },
        metadata: message.channel,
      });

      try {
        if (!queue.connection) await queue.connect(message.member.voice.channel);
      } catch {
        void player.deleteQueue(message.guildId);
        message.channel.send('Could not join your voice channel!');
      }

      message.channel.send(`⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...`);
      searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
      if (!queue.playing) await queue.play();
    } catch (error) {
      message.channel.send('hata => ' + error.message);
    }
  },
};
