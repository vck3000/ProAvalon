import { JoinQueueFilter } from '../joinQueueFilter';

// Current settings to block when there are 2 rejects in a 1 minute interval.
describe('JoinQueueFilter', () => {
  let joinQueueFilter: JoinQueueFilter;
  const getTimeFunc = jest.fn();

  beforeEach(() => {
    getTimeFunc.mockClear();
    joinQueueFilter = new JoinQueueFilter(getTimeFunc);
  });

  it("Should let a user join if they haven't rejected N times yet", () => {
    getTimeFunc.mockReturnValueOnce(new Date(0));
    joinQueueFilter.registerReject('1');

    getTimeFunc.mockReturnValueOnce(new Date(2));
    expect(joinQueueFilter.joinQueueRequest('1')).toEqual(true);
  });

  it('Should stop a user after rejecting too many times', () => {
    // Set up two rejects back to back.
    getTimeFunc.mockReturnValueOnce(new Date(0));
    joinQueueFilter.registerReject('1');

    getTimeFunc.mockReturnValueOnce(new Date(1));
    joinQueueFilter.registerReject('1');

    // Can't join queue
    getTimeFunc.mockReturnValueOnce(new Date(3));
    expect(joinQueueFilter.joinQueueRequest('1')).toEqual(false);

    // Right before 1 minute boundary
    getTimeFunc.mockReturnValueOnce(new Date(59 * 1000));
    expect(joinQueueFilter.joinQueueRequest('1')).toEqual(false);

    // Right after 1 minute boundary
    getTimeFunc.mockReturnValueOnce(new Date(61 * 1000));
    expect(joinQueueFilter.joinQueueRequest('1')).toEqual(true);

    // New reject in the future doesn't get affected by old outdated rejects
    getTimeFunc.mockReturnValueOnce(new Date(62 * 1000));
    joinQueueFilter.registerReject('1');

    getTimeFunc.mockReturnValueOnce(new Date(63 * 1000));
    expect(joinQueueFilter.joinQueueRequest('1')).toEqual(true);
  });
});
