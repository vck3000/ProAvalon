import Discord, { TextChannel } from 'discord.js';

const client = new Discord.Client();

if (process.env.ENV === 'prod') {
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

  if (process.env.ENV === 'prod') {
    channel.send(message);
  }
}

function getAdminPing(): string {
  return `<@&${process.env.discord_admin_role_id}>`;
}

function getModPing(): string {
  return `<@&${process.env.discord_mod_role_id}>`;
}
