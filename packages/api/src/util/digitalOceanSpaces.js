const S3 = require('aws-sdk/clients/s3');
const axios = require('axios');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

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

function getImaginaryUrl({ url, type = 'webp', width, ...imaginaryQueries } = {}, {
  endpoint = 'thumbnail',
  serverUrl = 'https://image.litefarm.org',
} = {}) {
  const reqUrl = new URL(`${serverUrl}/${endpoint}`);
  width && reqUrl.searchParams.append('width', width);
  reqUrl.searchParams.append('type', type);
  url && reqUrl.searchParams.append('url', url);
  for (const key in imaginaryQueries) {
    reqUrl.searchParams.append(key, imaginaryQueries[key]);
  }
  return reqUrl.toString();
}

const DO_ENDPOINT = 'nyc3.digitaloceanspaces.com';

const s3 = new S3({
  endpoint: DO_ENDPOINT,
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
});

async function imaginaryPost({ buffer, originalname }, {
  width,
  type,
  ...imaginaryQueries
} = {}, { endpoint = 'thumbnail', serverUrl = 'https://image.litefarm.org' } = {}) {
  const form = new FormData();
  form.append('file', buffer, { filename: originalname });
  return axios.post(getImaginaryUrl({
    width,
    type,
    ...imaginaryQueries,
  }, { endpoint, serverUrl }), form, {
    headers: {
      'API-Key': process.env.IMAGINARY_TOKEN,
      ...form.getHeaders(),
    },
    responseType: 'arraybuffer',
  });
}

async function imaginaryGet(url, { width, type, ...imaginaryQueries } = {}, {
  endpoint = 'thumbnail',
  serverUrl = 'https://image.litefarm.org',
} = {}) {
  return axios.post(getImaginaryUrl({
    width,
    type,
    url,
    ...imaginaryQueries,
  }, { endpoint, serverUrl }), {
    headers: {
      'API-Key': process.env.IMAGINARY_TOKEN,
    },
    responseType: 'arraybuffer',
  });
}

function getRandomFileName(file) {
  return `${uuidv4()}${path.extname(file.originalname)}`;
}

function getPrivateS3Url() {
  return `https://${getPrivateS3BucketName()}.${DO_ENDPOINT}`;
}

function getPublicS3Url() {
  return `https://${getPublicS3BucketName()}.${DO_ENDPOINT}`;
}

module.exports = {
  getPublicS3BucketName,
  getPrivateS3BucketName,
  getImaginaryUrl,
  s3,
  DO_ENDPOINT,
  imaginaryPost,
  imaginaryGet,
  getRandomFileName,
  getPublicS3Url,
  getPrivateS3Url,
};
