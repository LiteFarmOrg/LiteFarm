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

import { TFunction } from 'i18next';
import {
  Certification,
  SupportedCertifier,
  SupportedCertificationSystemType,
} from '../../store/api/types';

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

export const getCertifierOptions = (
  certifications: Certification[],
  systemTypes: SupportedCertificationSystemType[],
  certifiers: SupportedCertifier[],
  t: TFunction,
) => {
  const systemTypesMap = systemTypes.reduce<Record<number, SupportedCertificationSystemType>>(
    (map, systemType) => {
      map[systemType.certification_id] = systemType;
      return map;
    },
    {},
  );
  const certifiersMap = certifiers.reduce<Record<number, SupportedCertifier>>((map, certifier) => {
    map[certifier.certifier_id] = certifier;
    return map;
  }, {});

  const certifierByUniqueKey: Record<string, Certification> = {};
  for (const certification of certifications) {
    const key = getCertifierKey(certification);
    if (!(key in certifierByUniqueKey)) {
      certifierByUniqueKey[key] = certification;
    }
  }

  return Object.entries(certifierByUniqueKey)
    .map(([key, certification]) => ({
      value: key,
      label: formatCertifierLabel(certification, systemTypesMap, certifiersMap, t),
    }))
    .filter((option) => option.label)
    .sort((a, b) => a.label.localeCompare(b.label));
};

const formatCertifierLabel = (
  certification: Certification,
  systemTypesMap: Record<number, SupportedCertificationSystemType>,
  certifiersMap: Record<number, SupportedCertifier>,
  t: TFunction,
) => {
  const systemType = certification?.system_type_id && systemTypesMap[certification.system_type_id];
  const systemTypeName = systemType
    ? t(`certifications:${systemType.certification_translation_key}`)
    : certification.requested_system_type;

  let certifierName;
  if (certification.certifier_id) {
    const certifier = certifiersMap[certification.certifier_id];
    certifierName = certifier?.certifier_acronym;
  } else {
    certifierName = certification.other_certifier;
  }

  return systemTypeName ? `${certifierName} - ${systemTypeName}` : certifierName ?? '';
};
