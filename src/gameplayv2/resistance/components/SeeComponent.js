export class SeeComponent{
    //viewer dis seeing the entire details of 'beingviewed', isenabled means the component is enabled
    constructor(viewer, beingViewed, isEnabled){
        this.viewer = viewer;
        this.beingViewed = beingViewed;
        this.isEnabled = isEnabled;
    }

    getViewer(){
        return this.allianceType;
    }

    setViewer(newViewer){
        this.viewer = newViewer;
    }

    getBeingViewed(){
        return this.beingViewed;
    }

    setBeingViewed(newBViewed){
        this.beingViewed = newBViewed;
    }

    getEnabled(){
        return this.isEnabled;
    }

    setViewer(newEnabled){
        this.isEnabled = newEnabled;
    }
}