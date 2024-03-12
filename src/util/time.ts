export function millisToStr(millis: number) : string {

    let minutes: number = Math.floor(millis/ (1000 * 60) );
    let seconds: number = Math.floor((millis / 1000) % 60);
    let formattedSeconds: string;
    let formattedMinutes: string;

    if (seconds < 10) {
        formattedSeconds = "0" + seconds.toString();
    } else {
        formattedSeconds = seconds.toString();
    }

    if (minutes < 10) {
        formattedMinutes = "0" + minutes.toString();
    } else {
        formattedMinutes = minutes.toString();
    }

    return `${formattedMinutes}:${formattedSeconds}`;
}