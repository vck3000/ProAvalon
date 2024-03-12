import {millisToStr} from "./time";
describe('TimeConverter', () => {
    it('Converts time correctly', () => {

        //Test seconds displayed correctly
        expect(millisToStr(1000)).toEqual(("00:01"));
        expect(millisToStr(30000)).toEqual(("00:30"));
        expect(millisToStr(2050)).toEqual(("00:02"));

        //Test minutes displayed correctly
        expect(millisToStr(60000)).toEqual("01:00");
        expect(millisToStr(660000)).toEqual("11:00");
        expect(millisToStr(61005)).toEqual("01:01");

        //Test min + sec displayed correctly
        expect(millisToStr(62000)).toEqual("01:02");
    })
});