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

// Mock helpers for getDeviceType() — override navigator.userAgentData in Storybook stories.
// Usage in a story:
//   beforeEach: () => { mockPlatform('macOS'); return restorePlatform; }

const originalUserAgentData = (navigator as unknown as Record<string, unknown>).userAgentData;

export const mockPlatform = (platform: 'macOS' | 'iOS') => {
  Object.defineProperty(navigator, 'userAgentData', {
    value: { platform, mobile: platform !== 'macOS' },
    configurable: true,
  });
};

export const restorePlatform = () => {
  Object.defineProperty(navigator, 'userAgentData', {
    value: originalUserAgentData,
    configurable: true,
  });
};
