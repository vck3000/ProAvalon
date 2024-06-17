import Discord, { TextChannel } from 'discord.js';

import { config, configOld } from '../../config/config';

const client = new Discord.Client();

if (configOld.getEnv() === 'prod') {
  client.login(config.discord.botToken);
}

export function sendToDiscordAdmins(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getAdminPing()} ${message}`;
  }
  sendToChannel(message, config.discord.adminChannelId);
}

export function sendToDiscordMods(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getModPing()} ${message}`;
  }
  sendToChannel(message, config.discord.modChannelId);
}

function sendToChannel(message: string, channelId: string): void {
  const channel = client.channels.cache.get(channelId) as TextChannel;

  if (configOld.getEnv() === 'prod') {
    channel.send(message);
  }
}

function getAdminPing(): string {
  return `<@&${config.discord.adminRoleId}>`;
}

function getModPing(): string {
  return `<@&${config.discord.modRoleId}>`;
}
