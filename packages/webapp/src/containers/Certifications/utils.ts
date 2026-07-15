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

// Unified certifier identity key: used for dedup grouping, the certifier Select's
// value (ReportingPeriod), and parsed back into certifier_id/other_certifier for
// the export request body (Survey). indexOf/slice (not split) so a free-text
// other_certifier value containing ':' still parses correctly.
export function getCertifierKey({
  certifier_id,
  other_certifier,
}: {
  certifier_id?: number | null;
  other_certifier?: string | null;
}): string {
  return certifier_id ? `ID:${certifier_id}` : `OTHER:${other_certifier}`;
}

export function parseCertifierKey(key: string): { type: string; value: string } {
  const separatorIndex = key.indexOf(':');
  return { type: key.slice(0, separatorIndex), value: key.slice(separatorIndex + 1) };
}
