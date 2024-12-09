// Global settings that can be controlled through commands

class Settings {
  private disableRegistration = false;

  public getDisableRegistration(): boolean {
    return this.disableRegistration;
  }

  public toggleDisableRegistration() {
    this.disableRegistration = !this.disableRegistration;
  }
}

export const settingsSingleton = new Settings();
