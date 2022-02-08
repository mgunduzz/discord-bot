const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/Client');
const config = require('./config.json');
const {Player} = require('discord-player');
const express = require('express');
const app = express();
const {QueryType} = require('discord-player');
const play = require('./_commands/play');
const {GuildMember} = require('discord.js');

app.listen(process.env.PORT || 5000);

const client = new Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

__prefix = '@q';
__djRole = 'dj';

console.log({__prefix});

console.log(client.commands);

const player = new Player(client);

player.on('error', (queue, error) => {
  console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});

player.on('connectionError', (queue, error) => {
  console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});

player.on('trackStart', (queue, track) => {
  queue.metadata.send(`▶ | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
});

player.on('trackAdd', (queue, track) => {
  queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
});

player.on('botDisconnect', queue => {
  queue.metadata.send('❌ | I was manually disconnected from the voice channel, clearing queue!');
});

player.on('channelEmpty', queue => {
  queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
});

player.on('queueEnd', queue => {
  queue.metadata.send('✅ | Queue finished!');
});

client.once('ready', async () => {
  console.log('Ready!');
});

client.on('ready', function () {
  client.user.setActivity(config.activity, {type: config.activityType});
});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!client.application?.owner) await client.application?.fetch();

  if (message.content.startsWith(__prefix)) {
    let djRole = message.guild.roles.cache.map(o => o.name).find(o => o == __djRole);

    if (!djRole) {
      await message.guild.roles.create({
        name: __djRole,
      });
    }

    let allowAuthor = message.member.roles.cache.map(o => o.name).find(o => o == __djRole);

    if (!allowAuthor) message.reply(`[${__djRole}] rolün yok.`);
    else {
      console.log(message.content);
      // await message.guild.commands
      //   .set(client.commands)
      //   .then(() => {
      //     message.reply('s.a');
      //   })
      //   .catch(err => {
      //     message.reply('Could not deploy commands! Make sure the bot has the application.commands permission!');
      //     console.error(err);
      //   });

      if (!(message.member instanceof GuildMember) || !message.member.voice.channel) {
        return void message.reply({
          content: 'You are not in a voice channel!',
          ephemeral: true,
        });
      }

      if (message.guild.me.voice.channelId && message.member.voice.channelId !== message.guild.me.voice.channelId) {
        return void message.reply({
          content: 'You are not in my voice channel!',
          ephemeral: true,
        });
      }

      let _msg = message.content.replace(/\s\s+/g, ' ');
      let splits = _msg.split(' ').filter(o => o != __prefix);

      let query = splits.join(' ');

      if (query.length >= 3) {
        play.execute(query, player, message);
      } else message.reply('en az 3 harf olmalı...');
    }
  }
});

client.on('interactionCreate', async interaction => {
  const command = client.commands.get(interaction.commandName.toLowerCase());

  try {
    if (interaction.commandName == 'ban' || interaction.commandName == 'userinfo') {
      command.execute(interaction, client);
    } else {
      command.execute(interaction, player);
    }
  } catch (error) {
    console.error(error);
    interaction.followUp({
      content: 'There was an error trying to execute that command!',
    });
  }
});

let tokenBase64 = config.token;
let token = Buffer.from(tokenBase64, 'base64').toString('utf-8');

client.login(token);
