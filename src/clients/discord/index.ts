import Discord, { TextChannel } from 'discord.js';

import { config } from '../../config';

const client = new Discord.Client();

if (config.ENV === 'prod') {
  client.login(config.discord.BOT_TOKEN);
}

export function sendToDiscordAdmins(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getAdminPing()} ${message}`;
  }
  sendToChannel(message, config.discord.ADMIN_CHANNEL_ID);
}

export function sendToDiscordMods(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getModPing()} ${message}`;
  }
  sendToChannel(message, config.discord.MOD_CHANNEL_ID);
}

function sendToChannel(message: string, channelId: string): void {
  const channel = client.channels.cache.get(channelId) as TextChannel;

  if (config.ENV === 'prod') {
    channel.send(message);
  }
}

function getAdminPing(): string {
  return `<@&${config.discord.ADMIN_ROLE_ID}>`;
}

function getModPing(): string {
  return `<@&${config.discord.MOD_ROLE_ID}>`;
}
