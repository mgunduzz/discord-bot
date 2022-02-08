const {GuildMember} = require('discord.js');
const __djRole = 'djMG';

module.exports = {
  check(message) {
    return new Promise((resolve, reject) => {
      try {
        if (!(message.member instanceof GuildMember) || !message.member.voice.channel) {
          message.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
          });

          resolve(false);
        }

        if (message.guild.me.voice.channelId && message.member.voice.channelId !== message.guild.me.voice.channelId) {
          message.reply({
            content: 'You are not in my voice channel!',
            ephemeral: true,
          });
          resolve(false);
        }

        let djRole = message.guild.roles.cache.map(o => o.name).find(o => o == __djRole);

        if (!djRole) {
          message.guild.roles.create({
            name: __djRole,
          }).then();
        }

        let allowAuthor = message.member.roles.cache.map(o => o.name).find(o => o == __djRole);

        if (!allowAuthor) {
          message.reply(`[${__djRole}] rolün yok.`);
          resolve(false);
        }

        resolve(true);
      } catch (error) {
        message.channel.send('hata => ' + error.message);
        resolve(false);
      }
    });
  },
};
