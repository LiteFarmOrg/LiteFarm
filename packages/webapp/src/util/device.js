export const TOUCH_DEVICES = ['Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'CriOS'];

export const isTouchDevice = () => {
  console.log(window.navigator.userAgent);
  return !!window.navigator.userAgent.match(new RegExp(TOUCH_DEVICES.join('|')));
};
