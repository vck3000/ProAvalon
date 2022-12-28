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

export default new Settings();
