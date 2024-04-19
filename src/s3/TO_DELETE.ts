// import { S3Agent } from '../S3Agent';
//
// jest.mock('../S3Agent');
//
// describe('S3 Client', () => {
//   let s3Agent: S3Agent;
//
//   beforeEach(() => {
//     s3Agent = new S3Agent();
//   });
//
//   it('Uploads files correctly', async () => {
//     const fileContent = 'file content';
//     const key = 'mock/file.txt';
//     const contentType = 'text/plain';
//
//     await s3Agent.uploadFile(key, fileContent, contentType);
//
//     expect(s3Agent.uploadFile).toHaveBeenCalledTimes(1);
//     expect(s3Agent.uploadFile).toHaveBeenCalledWith(
//       key,
//       fileContent,
//       contentType,
//     );
//   });
// });
