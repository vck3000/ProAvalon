import Discord, { TextChannel } from 'discord.js';
import { configOld } from '../../config/config';

const client = new Discord.Client();

if (configOld.getEnv() === 'prod') {
  client.login(configOld.getDiscordBotToken());
}

export function sendToDiscordAdmins(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getAdminPing()} ${message}`;
  }
  sendToChannel(message, configOld.getDiscordAdminChannelId());
}

export function sendToDiscordMods(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getModPing()} ${message}`;
  }
  sendToChannel(message, configOld.getDiscordModChannelId());
}

function sendToChannel(message: string, channelId: string): void {
  const channel = client.channels.cache.get(channelId) as TextChannel;

  if (configOld.getEnv() === 'prod') {
    channel.send(message);
  }
}

function getAdminPing(): string {
  return `<@&${configOld.getDiscordAdminRoleId()}>`;
}

function getModPing(): string {
  return `<@&${configOld.getDiscordModRoleId()}>`;
}
