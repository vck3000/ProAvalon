export function timeConverterToMinSec(milliseconds: number) : string {

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