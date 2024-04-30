// Global settings that can be controlled through commands

class Settings {
  private disableRegistration = false;

  getDisableRegistration(): boolean {
    return this.disableRegistration;
  }

  toggleDisableRegistration() {
    this.disableRegistration = !this.disableRegistration;
  }
}

const settingsSingleton = new Settings();

export default settingsSingleton;
