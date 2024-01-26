// Global settings that can be controlled through commands

class Settings {
  private disableRegistration = true;

  getDisableRegistration(): boolean {
    return this.disableRegistration;
  }

  toggleDisableRegistration() {
    this.disableRegistration = !this.disableRegistration;
  }
}

const settingsSingleton = new Settings();
if (process.env.ENV != 'prod') {
  settingsSingleton.toggleDisableRegistration();
}

export default settingsSingleton;
