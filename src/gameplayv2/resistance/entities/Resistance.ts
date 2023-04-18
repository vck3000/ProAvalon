class Resistance {
    public static role: string = 'Resistance';
    public static alliance: string = 'Resistance';
    public description: string = 'A standard Resistance member.';

    constructor(){

    }
  
    public see(): undefined {
      return undefined;
    }
  
    public checkSpecialMove(): void {
      // leave empty or remove entirely if not needed
    }
  }