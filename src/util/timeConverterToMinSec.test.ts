import {timeConverterToMinSec} from "./timeConverterToMinSec";
describe('TimeConverter', () => {
    it('Converts time correctly', () => {

        expect(timeConverterToMinSec("1000")).toEqual(("0:01"));
        expect(timeConverterToMinSec("2050")).toEqual(("0:02"));
        expect(timeConverterToMinSec("30000")).toEqual(("0:30"));
        expect(timeConverterToMinSec("61000")).toEqual("1:01");
    })
});