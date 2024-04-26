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

  it('uploads avatars', async () => {
    const mockResAvatar = Buffer.from('resAvatar');
    const mockSpyAvatar = Buffer.from('SpyAvatar');

    // @ts-ignore
    mockS3Controller.listObjectKeys.mockReturnValueOnce([
      '1_res_1.png',
      '1_res_5.png',
      '1_spy_5.png',
    ]);

    mockS3Controller.uploadFile.mockReturnValueOnce(
      // @ts-ignore
      'publicFileLinkPrefix.com/1_res_6.png',
    );
    mockS3Controller.uploadFile.mockReturnValueOnce(
      // @ts-ignore
      'publicFileLinkPrefix.com/1_spy_6.png',
    );

    const result = await s3Agent.uploadAvatarRequestImages(
      '1',
      mockResAvatar,
      mockSpyAvatar,
    );

    expect(mockS3Controller.uploadFile).toHaveBeenCalledWith(
      'pending_avatars/1/1_res_6.png',
      mockResAvatar,
      'image/png',
    );

    expect(mockS3Controller.uploadFile).toHaveBeenCalledWith(
      'pending_avatars/1/1_spy_6.png',
      mockSpyAvatar,
      'image/png',
    );

    expect(result).toStrictEqual({
      resLink: 'publicFileLinkPrefix.com/1_res_6.png',
      spyLink: 'publicFileLinkPrefix.com/1_spy_6.png',
    });
  });

  it('deletes first uploaded avatar if second upload fails', async () => {
    const mockResAvatar = Buffer.from('resAvatar');
    const mockSpyAvatar = Buffer.from('SpyAvatar');

    // @ts-ignore
    mockS3Controller.listObjectKeys.mockReturnValueOnce([
      '1_res_1.png',
      '1_spy_1.png',
    ]);

    mockS3Controller.uploadFile.mockReturnValueOnce(
      // @ts-ignore
      'publicFileLinkPrefix.com/1_res_2.png',
    );

    // @ts-ignore
    mockS3Controller.uploadFile.mockRejectedValue(new Error('Upload failed'));

    let errorCaught = false;
    await s3Agent
      .uploadAvatarRequestImages('1', mockResAvatar, mockSpyAvatar)
      .catch(() => {
        errorCaught = true;
      });

    expect(mockS3Controller.uploadFile).toHaveBeenCalledWith(
      'pending_avatars/1/1_res_2.png',
      mockResAvatar,
      'image/png',
    );

    expect(mockS3Controller.uploadFile).toHaveBeenCalledWith(
      'pending_avatars/1/1_spy_2.png',
      mockSpyAvatar,
      'image/png',
    );

    expect(mockS3Controller.deleteFile).toHaveBeenCalledWith(
      'publicFileLinkPrefix.com/1_res_2.png',
    );

    expect(errorCaught).toEqual(true);
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

    expect(mockS3Controller.moveFile).not.toHaveBeenCalled();
    expect(errorCaught).toEqual(true);
  });

  it('rejects avatars', async () => {
    await s3Agent.rejectAvatarRequest({
      resLink: 'pending_avatars/pronub_res_1.png',
      spyLink: 'pending_avatars/pronub_spy_1.png',
    });

    expect(mockS3Controller.deleteFile).toHaveBeenCalledWith(
      'pending_avatars/pronub_res_1.png',
    );

    expect(mockS3Controller.deleteFile).toHaveBeenCalledWith(
      'pending_avatars/pronub_spy_1.png',
    );
  });

  it('does not reject non-pending avatars', async () => {
    let errorCaught = false;
    await s3Agent
      .rejectAvatarRequest({
        resLink: 'asdf/pronub_res_1.png',
        spyLink: 'asdf/pronub_spy_1.png',
      })
      .catch(() => {
        errorCaught = true;
      });

    expect(mockS3Controller.deleteFile).not.toHaveBeenCalled();
    expect(errorCaught).toEqual(true);
  });
});
