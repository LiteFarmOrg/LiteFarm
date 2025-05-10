const input = $('#url')[0];
const frame = $('iframe')[0];
const submit = $('#submit')[0];

let url = '';
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const pageUrl = new URL(tabs[0].url);
  const url = pageUrl.protocol + '//' + pageUrl.hostname + ':' + 5173;

  input.value = url;
})

on('click', () => {
  var url = input.value;
  frame.src = input.value + '/popup';

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { url });
  })
})(submit)
