describe('TestDates', () => {
  it('SetMonthBeyond11', () => {
    const a = new Date();

    a.setMonth(11);
    console.log(a);

    a.setMonth(12);
    console.log(a);

    a.setMonth(13);
    console.log(a);
  });
});
