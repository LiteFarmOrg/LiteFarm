import AWS from 'aws-sdk';

export default function uploadFile(
  blob,
  filename,
  callback,
  {
    isPublic = false,
    onError = (err) => {
      console.log(err);
    },
  },
) {
  const DO_URI = 'nyc3.digitaloceanspaces.com';
  const spacesEndpoint = new AWS.Endpoint(DO_URI);
  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.REACT_APP_DO_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_DO_ACCESS_SECRET_KEY,
  });
  const params = {
    Body: blob,
    Bucket: `${process.env.REACT_APP_DO_BUCKET_NAME}`,
    Key: filename,
  };
  const host = `https://${process.env.REACT_APP_DO_BUCKET_NAME}.${DO_URI}`;
  s3.putObject(params)
    .on('build', (request) => {
      request.httpRequest.headers.Host = host;
      request.httpRequest.headers['Content-Length'] = blob.size;
      request.httpRequest.headers['Content-Type'] = blob.type;
      isPublic && (request.httpRequest.headers['x-amz-acl'] = 'public-read');
    })
    .send((err) => {
      if (err) onError?.(err);
      else {
        const imageUrl = `${host}/${filename}`;
        callback(imageUrl);
      }
    });
}

export async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hash = hashArray.map((b) => b.toString(36)).join('');
  return hash;
}
