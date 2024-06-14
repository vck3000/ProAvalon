// Global settings that can be controlled through commands

class Settings {
  private disableRegistration = false;
  private readonly env: string;

  constructor() {
    this.env = process.env.ENV;
  }

  public getEnv() {
    return this.env;
  }

  public getDisableRegistration(): boolean {
    return this.disableRegistration;
  }

  public toggleDisableRegistration() {
    this.disableRegistration = !this.disableRegistration;
  }
}

export const settingsSingleton = new Settings();
