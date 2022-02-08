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
const disconnect = require('./_commands/disconnect');
const skip = require('./_commands/skip');
const shuffle = require('./_commands/shuffle');
const queue = require('./_commands/queue');
const guard = require('./_commands/guard');

app.listen(process.env.PORT || 5000);

const client = new Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const __prefix = '.';
const __playPrefix = __prefix + 'q';

console.log({__playPrefix});

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

  if (message.content == __prefix + 'n') guard.check(message).then(() => skip.execute(player, message));
  if (message.content == __prefix + 'dc') guard.check(message).then(() => disconnect.execute(player, message));
  if (message.content == __prefix + 'shuffle') guard.check(message).then(() => shuffle.execute(player, message));
  if (message.content == __prefix + 'que') guard.check(message).then(() => queue.execute(player, message));
  else if (message.content.startsWith(__playPrefix)) {
    guard.check(message).then(() => {
      let _msg = message.content.replace(/\s\s+/g, ' ');
      let splits = _msg.split(' ').filter(o => o != __playPrefix);

      let query = splits.join(' ');

      switch (query) {
        default:
          if (query.length >= 3) {
            play.execute(query, player, message);
          } else message.reply('şarkı adı en az 3 harf olmalı...');
          break;
      }
    });
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
