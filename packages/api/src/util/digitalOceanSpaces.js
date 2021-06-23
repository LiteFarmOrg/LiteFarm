const S3 = require('aws-sdk/clients/s3');

function getPrivateS3BucketName() {
  const node_env = process.env.NODE_ENV;
  if (node_env === 'production') return 'litefarm-app-secret';
  if (node_env === 'integration') return 'litefarm-beta-secret';
  return 'litefarm-dev-secret';
}

function getPublicS3BucketName() {
  const node_env = process.env.NODE_ENV;
  if (node_env === 'production') return 'litefarmapp';
  if (node_env === 'integration') return 'litefarmbeta';
  return 'litefarm';
}

function getImaginaryThumbnailUrl(imgSrc, { format = 'webp', width, ...props } = {}) {
  const url = new URL('https://image.litefarm.org/thumbnail');
  width && url.searchParams.append('width', width);
  url.searchParams.append('type', format);
  url.searchParams.append('url', encodeURIComponent(imgSrc));
  for (const key in props) {
    url.searchParams.append(key, props.key);
  }
  return url.toString();
}

const DO_ENDPOINT = 'nyc3.digitaloceanspaces.com';

const s3 = new S3({
  endpoint: DO_ENDPOINT,
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
});

module.exports = { getPublicS3BucketName, getPrivateS3BucketName, getImaginaryThumbnailUrl, s3, DO_ENDPOINT };
