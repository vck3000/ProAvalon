export type DiscordConfigType = {
  botToken: string;
  adminChannelId: string;
  modChannelId: string;
  adminRoleId: string;
  modRoleId: string;
};

export const DiscordConfig: Readonly<DiscordConfigType> = Object.freeze({
  botToken: process.env.discord_bot_token,
  adminChannelId: process.env.discord_admin_channel_id,
  modChannelId: process.env.discord_mod_channel_id,
  adminRoleId: process.env.discord_admin_role_id,
  modRoleId: process.env.discord_mod_role_id,
});
