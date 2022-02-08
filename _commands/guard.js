const {GuildMember} = require('discord.js');
const __djRole = 'dj';

module.exports = {
  async check(message) {
    return new Promise((resolve, reject) => {
      try {
        if (!(message.member instanceof GuildMember) || !message.member.voice.channel) {
          message.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
          });

          reject();
        }

        if (message.guild.me.voice.channelId && message.member.voice.channelId !== message.guild.me.voice.channelId) {
          message.reply({
            content: 'You are not in my voice channel!',
            ephemeral: true,
          });
          reject();
        }

        let djRole = message.guild.roles.cache.map(o => o.name).find(o => o == __djRole);

        if (!djRole) {
          message.guild.roles.create({
            name: __djRole,
          });
        }

        let allowAuthor = message.member.roles.cache.map(o => o.name).find(o => o == __djRole);

        if (!allowAuthor) {
          message.reply(`[${__djRole}] rolün yok.`);
          reject();
        }

        resolve();
      } catch (error) {
        message.channel.send('hata => ' + error.message);
        reject();
      }
    });
  },
};
