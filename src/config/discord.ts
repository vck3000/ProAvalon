export type DiscordConfigType = {
  BOT_TOKEN: string;
  ADMIN_CHANNEL_ID: string;
  MOD_CHANNEL_ID: string;
  ADMIN_ROLE_ID: string;
  MOD_ROLE_ID: string;
};

export const DiscordConfig: Readonly<DiscordConfigType> = Object.freeze({
  BOT_TOKEN: process.env.discord_bot_token,
  ADMIN_CHANNEL_ID: process.env.discord_admin_channel_id,
  MOD_CHANNEL_ID: process.env.discord_mod_channel_id,
  ADMIN_ROLE_ID: process.env.discord_admin_role_id,
  MOD_ROLE_ID: process.env.discord_mod_role_id,
});
