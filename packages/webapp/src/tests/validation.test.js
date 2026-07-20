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

import { expect, describe, test } from 'vitest';
import { isImageUrl, isFileTypeAllowed } from '../util/validation';

const makeFile = (name, type) => new File(['content'], name, { type });

describe('isImageUrl', () => {
  test('returns true for known image extensions, case-insensitively', () => {
    expect(isImageUrl('https://example.com/uuid-name.jpg')).toBe(true);
    expect(isImageUrl('https://example.com/uuid-name.PNG')).toBe(true);
    expect(isImageUrl('https://example.com/uuid-name.webp')).toBe(true);
  });

  test('returns false for non-image extensions', () => {
    expect(isImageUrl('https://example.com/uuid-name.pdf')).toBe(false);
    expect(isImageUrl('https://example.com/uuid-name.docx')).toBe(false);
  });

  test('returns false for an empty string', () => {
    expect(isImageUrl('')).toBe(false);
  });
});

describe('isFileTypeAllowed', () => {
  test('matches the image/* wildcard against an image mime type', () => {
    expect(isFileTypeAllowed(makeFile('photo.png', 'image/png'), 'image/*')).toBe(true);
  });

  test('rejects a non-image file when only image/* is allowed', () => {
    expect(isFileTypeAllowed(makeFile('cert.pdf', 'application/pdf'), 'image/*')).toBe(false);
  });

  test('matches an exact mime type entry alongside the image/* wildcard', () => {
    expect(
      isFileTypeAllowed(makeFile('cert.pdf', 'application/pdf'), 'image/*,application/pdf'),
    ).toBe(true);
  });

  test('falls back to filename extension for image/* when the browser reports no mime type', () => {
    expect(isFileTypeAllowed(makeFile('photo.jpg', ''), 'image/*')).toBe(true);
  });

  test('does not extension-fallback for exact mime type entries when type is empty', () => {
    expect(isFileTypeAllowed(makeFile('notes.pdf', ''), 'image/*,application/pdf')).toBe(false);
  });

  test('matches a literal extension entry against the filename', () => {
    const docxFile = makeFile(
      'report.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(isFileTypeAllowed(docxFile, 'image/*,.docx')).toBe(true);
  });

  test('is case-insensitive for both accept entries and file properties', () => {
    expect(
      isFileTypeAllowed(makeFile('CERT.PDF', 'APPLICATION/PDF'), 'IMAGE/*,APPLICATION/PDF'),
    ).toBe(true);
  });
});
