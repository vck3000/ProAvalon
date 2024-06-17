import Discord, { TextChannel } from 'discord.js';
import { config } from '../../config/config';

const client = new Discord.Client();

if (config.getEnv() === 'prod') {
  client.login(config.getDiscordBotToken());
}

export function sendToDiscordAdmins(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getAdminPing()} ${message}`;
  }
  sendToChannel(message, config.getDiscordAdminChannelId());
}

export function sendToDiscordMods(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getModPing()} ${message}`;
  }
  sendToChannel(message, config.getDiscordModChannelId());
}

function sendToChannel(message: string, channelId: string): void {
  const channel = client.channels.cache.get(channelId) as TextChannel;

  if (config.getEnv() === 'prod') {
    channel.send(message);
  }
}

function getAdminPing(): string {
  return `<@&${config.getDiscordAdminRoleId()}>`;
}

function getModPing(): string {
  return `<@&${config.getDiscordModRoleId()}>`;
}
