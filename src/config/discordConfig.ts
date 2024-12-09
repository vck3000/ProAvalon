import { getRequiredEnvVariable, getRequiredProdEnvVariable } from './utils';

export type DiscordConfigType = {
  BOT_TOKEN?: string;
  ADMIN_CHANNEL_ID?: string;
  MOD_CHANNEL_ID?: string;
  ADMIN_ROLE_ID?: string;
  MOD_ROLE_ID?: string;
};

export const DiscordConfig: Readonly<DiscordConfigType> = Object.freeze({
  BOT_TOKEN: getRequiredProdEnvVariable('discord_bot_token'),
  ADMIN_CHANNEL_ID: getRequiredProdEnvVariable('discord_admin_channel_id'),
  MOD_CHANNEL_ID: getRequiredProdEnvVariable('discord_mod_channel_id'),
  ADMIN_ROLE_ID: getRequiredProdEnvVariable('discord_admin_role_id'),
  MOD_ROLE_ID: getRequiredProdEnvVariable('discord_mod_role_id'),
});
