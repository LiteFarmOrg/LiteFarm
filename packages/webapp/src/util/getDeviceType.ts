/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

export type DeviceType = 'android' | 'ios' | 'desktop';

interface NavigatorUAData {
  platform: string;
  mobile: boolean;
}

function getDeviceType(): DeviceType {
  // Modern: User-Agent Client Hints API (Chrome, Edge, Opera — not yet Safari as of early 2026)
  const uaData = (navigator as unknown as { userAgentData?: NavigatorUAData }).userAgentData;
  if (uaData?.platform) {
    const platform = uaData.platform.toLowerCase();
    if (platform === 'android') {
      return 'android';
    }
    if (platform === 'ios') {
      return 'ios';
    }
    return 'desktop';
  }

  // Fallback: UA string parsing (Safari and older browsers)
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) {
    return 'android';
  }
  // iPadOS spoofs its UA as "Macintosh" but exposes 5 touch points.
  // Real Macs report 0 touch points.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }

  return 'desktop';
}

export default getDeviceType;
