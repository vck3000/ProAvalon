import Discord, { TextChannel } from 'discord.js';
import { config } from '../../config';

const client = new Discord.Client();

if (config.getEnv() === 'prod') {
  client.login(process.env.discord_bot_token);
}

export function sendToDiscordAdmins(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getAdminPing()} ${message}`;
  }
  sendToChannel(message, process.env.discord_admin_channel_id);
}

export function sendToDiscordMods(message: string, ping?: boolean): void {
  if (ping) {
    message = `${getModPing()} ${message}`;
  }
  sendToChannel(message, process.env.discord_mod_channel_id);
}

function sendToChannel(message: string, channelId: string): void {
  const channel = client.channels.cache.get(channelId) as TextChannel;

  if (config.getEnv() === 'prod') {
    channel.send(message);
  }
}

function getAdminPing(): string {
  return `<@&${process.env.discord_admin_role_id}>`;
}

function getModPing(): string {
  return `<@&${process.env.discord_mod_role_id}>`;
}
