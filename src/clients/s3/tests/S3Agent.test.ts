import { IS3Controller, S3Agent } from '../S3Agent';

class MockS3Controller implements IS3Controller {
  listObjectKeys = jest.fn();
  uploadFile = jest.fn();
  deleteFile = jest.fn();
  moveFile = jest.fn();
  transformKeyToLink = jest.fn();

  clear() {
    this.listObjectKeys.mockClear();
    this.uploadFile.mockClear();
    this.deleteFile.mockClear();
    this.moveFile.mockClear();
  }
}

describe('S3Agent', () => {
  let s3Agent: S3Agent;
  const mockS3Controller = new MockS3Controller();

  beforeEach(() => {
    mockS3Controller.clear();

    s3Agent = new S3Agent(mockS3Controller);
  });

  it('uploads avatars', async () => {
    const mockResAvatar = Buffer.from('resAvatar');
    const mockSpyAvatar = Buffer.from('SpyAvatar');

    mockS3Controller.listObjectKeys.mockResolvedValueOnce([
      'userexample_res_1.png',
      'userexample_spy_1.png',
    ]);
    mockS3Controller.uploadFile.mockResolvedValueOnce(
      'publicFileLinkPrefix.com/userexample_res_2.png',
    );
    mockS3Controller.uploadFile.mockResolvedValueOnce(
      'publicFileLinkPrefix.com/userexample_spy_2.png',
    );

    const result = await s3Agent.uploadAvatarRequestImages(
      'userexample',
      mockResAvatar,
      mockSpyAvatar,
    );

    expect(result).toStrictEqual({
      avatarSetId: 2,
      resLink: 'publicFileLinkPrefix.com/userexample_res_2.png',
      spyLink: 'publicFileLinkPrefix.com/userexample_spy_2.png',
    });
    expect(mockS3Controller.uploadFile).toHaveBeenCalledWith(
      'pending_avatars/userexample/userexample_res_2.png',
      mockResAvatar,
      'image/png',
    );
    expect(mockS3Controller.uploadFile).toHaveBeenCalledWith(
      'pending_avatars/userexample/userexample_spy_2.png',
      mockSpyAvatar,
      'image/png',
    );
  });

  it('deletes first uploaded avatar if second upload fails', async () => {
    const mockResAvatar = Buffer.from('resAvatar');
    const mockSpyAvatar = Buffer.from('SpyAvatar');

    mockS3Controller.listObjectKeys.mockResolvedValueOnce([]);
    mockS3Controller.uploadFile.mockResolvedValueOnce(
      'publicFileLinkPrefix.com/userexample_res_1.png',
    );
    mockS3Controller.uploadFile.mockRejectedValueOnce(
      new Error('Upload failed'),
    );

    let errorCaught = false;
    await s3Agent
      .uploadAvatarRequestImages('userexample', mockResAvatar, mockSpyAvatar)
      .catch(() => {
        errorCaught = true;
      });

    expect(errorCaught).toEqual(true);

    expect(mockS3Controller.uploadFile).toHaveBeenCalledWith(
      'pending_avatars/userexample/userexample_res_1.png',
      mockResAvatar,
      'image/png',
    );

    expect(mockS3Controller.uploadFile).toHaveBeenCalledWith(
      'pending_avatars/userexample/userexample_spy_1.png',
      mockSpyAvatar,
      'image/png',
    );

    expect(mockS3Controller.deleteFile).toHaveBeenCalledWith(
      'publicFileLinkPrefix.com/userexample_res_1.png',
    );
  });

  it('approves avatars', async () => {
    await s3Agent.approveAvatarRequest({
      avatarSetId: 1,
      resLink: 'pending_avatars/userexample_res_1.png',
      spyLink: 'pending_avatars/userexample_spy_1.png',
    });

    expect(mockS3Controller.moveFile).toHaveBeenCalledWith(
      'pending_avatars/userexample_res_1.png',
      'approved_avatars/userexample_res_1.png',
    );
    expect(mockS3Controller.moveFile).toHaveBeenCalledWith(
      'pending_avatars/userexample_spy_1.png',
      'approved_avatars/userexample_spy_1.png',
    );
  });

  it('stops approving avatar if invalid link', async () => {
    let errorCaught = false;
    await s3Agent
      .approveAvatarRequest({
        avatarSetId: 1,
        resLink: 'asdf/userexample_res_1.png',
        spyLink: 'asdf/userexample_spy_1.png',
      })
      .catch(() => {
        errorCaught = true;
      });

    expect(errorCaught).toEqual(true);
    expect(mockS3Controller.moveFile).not.toHaveBeenCalled();
  });

  it('reverts overall avatar approval if one fails', async () => {
    mockS3Controller.moveFile.mockResolvedValueOnce(undefined);
    mockS3Controller.moveFile.mockRejectedValueOnce(
      new Error('Move File failed'),
    );

    let errorCaught = false;
    await s3Agent
      .approveAvatarRequest({
        avatarSetId: 1,
        resLink: 'pending_avatars/userexample_res_1.png',
        spyLink: 'pending_avatars/userexample_spy_1.png',
      })
      .catch(() => {
        errorCaught = true;
      });

    expect(errorCaught).toEqual(true);
    expect(mockS3Controller.moveFile).toHaveBeenCalledWith(
      'pending_avatars/userexample_res_1.png',
      'approved_avatars/userexample_res_1.png',
    );
    expect(mockS3Controller.moveFile).toHaveBeenCalledWith(
      'pending_avatars/userexample_spy_1.png',
      'approved_avatars/userexample_spy_1.png',
    );

    // Move it back from approved to pending due to failed spy avatar move.
    expect(mockS3Controller.moveFile).toHaveBeenCalledWith(
      'approved_avatars/userexample_res_1.png',
      'pending_avatars/userexample_res_1.png',
    );
  });

  it('rejects avatars', async () => {
    await s3Agent.rejectAvatarRequest({
      avatarSetId: 1,
      resLink: 'pending_avatars/userexample_res_1.png',
      spyLink: 'pending_avatars/userexample_spy_1.png',
    });

    expect(mockS3Controller.deleteFile).toHaveBeenCalledWith(
      'pending_avatars/userexample_res_1.png',
    );
    expect(mockS3Controller.deleteFile).toHaveBeenCalledWith(
      'pending_avatars/userexample_spy_1.png',
    );
  });

  it('does not reject non-pending avatars', async () => {
    let errorCaught = false;
    await s3Agent
      .rejectAvatarRequest({
        avatarSetId: 1,
        resLink: 'approved_avatars/userexample_res_1.png',
        spyLink: 'approved_avatars/userexample_spy_1.png',
      })
      .catch(() => {
        errorCaught = true;
      });

    expect(errorCaught).toEqual(true);
    expect(mockS3Controller.deleteFile).not.toHaveBeenCalled();
  });

  it('gets the approved avatar IDs for a user in ascending order', async () => {
    mockS3Controller.listObjectKeys.mockResolvedValueOnce([
      'approved_avatars/usernamelower/usernamelower_res_1.png',
      'approved_avatars/usernamelower/usernamelower_res_11.png',
      'approved_avatars/usernamelower/usernamelower_res_2.png',
      'approved_avatars/usernamelower/usernamelower_res_3.png',
    ]);

    const result1 = await s3Agent.getApprovedAvatarIdsForUser('usernamelower');

    expect(result1).toEqual([1, 2, 3, 11]);

    expect(mockS3Controller.listObjectKeys).toHaveBeenCalledWith([
      `approved_avatars/usernamelower/usernamelower_res_`,
    ]);
  });

  it('returns an empty array for users with no approved avatars', async () => {
    mockS3Controller.listObjectKeys.mockResolvedValueOnce([]);

    const result1 = await s3Agent.getApprovedAvatarIdsForUser('usernamelower');

    expect(result1).toEqual([]);

    expect(mockS3Controller.listObjectKeys).toHaveBeenCalledWith([
      `approved_avatars/usernamelower/usernamelower_res_`,
    ]);
  });
});
