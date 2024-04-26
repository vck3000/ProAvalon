// Global settings that can be controlled through commands

import { set } from 'mongoose';
import * as process from 'process';

class Settings {
  private disableRegistration = false;

  getDisableRegistration(): boolean {
    return this.disableRegistration;
  }

  toggleDisableRegistration() {
    this.disableRegistration = !this.disableRegistration;
  }

  checkValidSettings() {
    const validEnv = ['local', 'staging', 'prod'];

    if (!validEnv.includes(process.env.ENV)) {
      throw new Error(`Invalid settings: ENV=${process.env.ENV}`);
    }

    if (
      process.env.ENV === 'staging' &&
      process.env.S3_BUCKET_NAME !== 'proavalon-staging'
    ) {
      throw new Error(
        `Invalid settings: ENV=staging S3_BUCKET_NAME=${process.env.S3_BUCKET_NAME}`,
      );
    }

    if (
      process.env.ENV === 'prod' &&
      process.env.S3_BUCKET_NAME !== 'proavalon'
    ) {
      throw new Error(
        `Invalid settings: ENV=prod S3_BUCKET_NAME=${process.env.S3_BUCKET_NAME}`,
      );
    }
  }
}

const settingsSingleton = new Settings();

settingsSingleton.checkValidSettings();

export default settingsSingleton;
