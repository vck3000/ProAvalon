import S3Controller from '../S3Controller';
import { S3Agent } from '../S3Agent';

jest.mock('../S3Controller');
const mockS3ControllerClass = jest.mocked(S3Controller);

describe('S3Agent', () => {
  let s3Agent: S3Agent;
  let mockS3Controller: jest.Mocked<S3Controller>;

  beforeEach(() => {
    mockS3ControllerClass.mockClear();

    s3Agent = new S3Agent();
    mockS3Controller = mockS3ControllerClass.mock
      .instances[0] as jest.Mocked<S3Controller>;
  });

  it('approves avatars', async () => {
    await s3Agent.approveAvatarRequest({
      resLink: 'pending_avatars/pronub_res_1.png',
      spyLink: 'pending_avatars/pronub_spy_1.png',
    });

    expect(mockS3Controller.moveFile).toHaveBeenCalledWith(
      'pending_avatars/pronub_res_1.png',
      'approved_avatars/pronub_res_1.png',
    );
    expect(mockS3Controller.moveFile).toHaveBeenCalledWith(
      'pending_avatars/pronub_spy_1.png',
      'approved_avatars/pronub_spy_1.png',
    );
  });

  it('stops approving avatar if invalid link', async () => {
    let errorCaught = false;
    await s3Agent
      .approveAvatarRequest({
        resLink: 'asdf_avatars/pronub_res_1.png',
        spyLink: 'asdf_avatars/pronub_spy_1.png',
      })
      .catch(() => {
        errorCaught = true;
      });

    expect(errorCaught).toEqual(true);
  });
});
