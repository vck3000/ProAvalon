export function timeConverterToMinSec(time: string) : string {
    let milliseconds: number = parseInt(time);

    let minutes: number = Math.floor(milliseconds/ (1000 * 60) );
    let seconds: number = Math.floor((milliseconds / 1000) % 60);
    let formattedSeconds: string;

    if (seconds < 10) {
        formattedSeconds = "0" + seconds;
    } else {
        formattedSeconds = seconds.toString();
    }

    return minutes + ":" + formattedSeconds;
}