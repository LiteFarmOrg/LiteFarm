function getConfig() {
  return {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('farm_token'),
    },
    responseType: 'arraybuffer',
    method: 'GET',
  };
}

export async function fetchFile(src) {
  return await fetch(src, getConfig());
}
