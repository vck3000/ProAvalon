class Entity{
    static nextId = 0;
    protected components: any[];
    public role: string;
    public alliance: string;
    public description: string;

    constructor() {
        this.components = [];
        this.role;
        this.alliance;
        this.description;
    }

    public addComponent(component: any): void {
        this.components.push(component);
    }

    public addComponents(...components: any[]): void {
        components.forEach((component) => this.addComponent(component));
    }
      
    public removeComponent(component: any): void {
        const componentIndex = this.components.findIndex((c) => c.constructor.name === component.constructor.name);
        if (componentIndex !== -1) {
            this.components.splice(componentIndex, 1);
        }
    }
      
    public getComponent(componentClass: any): any {
        return this.components.find((c) => c.constructor.name === componentClass.name);
    }

    public static getNextID(): number {
        return Entity.nextId++;
    }
}
