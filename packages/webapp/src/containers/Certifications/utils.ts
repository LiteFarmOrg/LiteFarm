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
import { getDateInputFormat } from '../../util/moment';
import {
  Certification,
  SupportedCertifier,
  SupportedCertificationSystemType,
} from '../../store/api/types';
import type { CertificationItem } from '../../components/Certifications/types';
import type {
  CertificationFormValues,
  Certifier as FormCertifier,
  SystemType as FormSystemType,
} from '../../components/Certifications/CertificationForm';

const PGS_TRANSLATION_KEY = 'PGS';

// TODO LF-5379: SupportedCertificationSystemType's certification_id/certification_type/
// certification_translation_key and SupportedCertifier's certification_id are shimmed
// names from the pre-LF-5379 legacy shim in certificationSystemTypeModel.js/certifierModel.js
// (real columns: id/name/translation_key and system_type_id, respectively). Every read of
// those fields in this file — buildSystemTypesMap, formatCertifierLabel, toCertificationItems,
// toFormSystemTypes, toFormCertifiers, toCertificationFormValues, toCertificationRequestBody —
// needs updating to the real column names once that shim is removed.
const buildSystemTypesMap = (systemTypes: SupportedCertificationSystemType[]) =>
  systemTypes.reduce<Record<number, SupportedCertificationSystemType>>((map, systemType) => {
    map[systemType.certification_id] = systemType;
    return map;
  }, {});

const buildCertifiersMap = (certifiers: SupportedCertifier[]) =>
  certifiers.reduce<Record<number, SupportedCertifier>>((map, certifier) => {
    map[certifier.certifier_id] = certifier;
    return map;
  }, {});

// Unified certifier identity key (dedup grouping, Select value, parsed back for export).
// System type is included so the same certifier/name under a different system type
// isn't treated as the same identity. Free-text parts are encodeURIComponent-escaped
// so a stray ':' inside them can't be confused with our own separators.
export function getCertifierKey({
  certifier_id,
  other_certifier,
  system_type_id,
  requested_system_type,
}: {
  certifier_id?: number | null;
  other_certifier?: string | null;
  system_type_id?: number | null;
  requested_system_type?: string | null;
}): string {
  const systemType = encodeURIComponent(system_type_id || requested_system_type || '');
  return certifier_id
    ? `ID:${certifier_id}:${systemType}`
    : `OTHER:${encodeURIComponent(other_certifier ?? '')}:${systemType}`;
}

export function parseCertifierKey(key: string): { type: string; value: string } {
  const [type, encodedValue] = key.split(':');
  return { type, value: decodeURIComponent(encodedValue) };
}

export const getCertifierOptions = (
  certifications: Certification[],
  systemTypes: SupportedCertificationSystemType[],
  certifiers: SupportedCertifier[],
  t: TFunction,
) => {
  const systemTypesMap = buildSystemTypesMap(systemTypes);
  const certifiersMap = buildCertifiersMap(certifiers);

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

export const toCertificationItems = (
  certifications: Certification[],
  systemTypes: SupportedCertificationSystemType[],
  certifiers: SupportedCertifier[],
): CertificationItem[] => {
  const systemTypesMap = buildSystemTypesMap(systemTypes);
  const certifiersMap = buildCertifiersMap(certifiers);

  return certifications.map((certification) => {
    const systemType = certification.system_type_id
      ? systemTypesMap[certification.system_type_id]
      : undefined;
    const certifier = certification.certifier_id
      ? certifiersMap[certification.certifier_id]
      : undefined;

    return {
      id: certification.id,
      systemTypeTranslationKey: systemType?.certification_translation_key ?? '',
      requestedSystemType: certification.requested_system_type ?? undefined,
      certifierName: certifier?.certifier_name ?? certification.other_certifier ?? '',
      certifierAcronym: certifier?.certifier_acronym,
      certificateNumber: certification.certificate_number,
      certificateMemberId: certification.certificate_member_id,
      isActive: certification.is_active,
      expiryDate: certification.valid_until,
    };
  });
};

export const toFormSystemTypes = (
  systemTypes: SupportedCertificationSystemType[],
): FormSystemType[] =>
  systemTypes.map((systemType) => ({
    id: systemType.certification_id,
    name: systemType.certification_type,
    translation_key: systemType.certification_translation_key,
  }));

export const toFormCertifiers = (certifiers: SupportedCertifier[]): FormCertifier[] =>
  certifiers.map((certifier) => ({
    certifier_id: certifier.certifier_id,
    system_type_id: certifier.certification_id,
    certifier_name: certifier.certifier_name,
  }));

export const toCertificationFormValues = (
  certification: Certification,
  systemTypes: SupportedCertificationSystemType[],
  certifiers: SupportedCertifier[],
  t: TFunction,
): Partial<CertificationFormValues> => {
  const systemTypesMap = buildSystemTypesMap(systemTypes);
  const certifiersMap = buildCertifiersMap(certifiers);

  const systemType = certification.system_type_id
    ? systemTypesMap[certification.system_type_id]
    : undefined;
  const isPgs = systemType?.certification_translation_key === PGS_TRANSLATION_KEY;

  const certifier = certification.certifier_id
    ? {
        value: certification.certifier_id,
        label: certifiersMap[certification.certifier_id]?.certifier_name ?? '',
      }
    : { value: 0, label: t('common:OTHER') };

  return {
    system_type_id: certification.system_type_id,
    is_active: certification.is_active,
    certification_type: certification.certification_type,
    certifier,
    other_certifier: certification.other_certifier ?? '',
    certificationIdentifier:
      (isPgs ? certification.certificate_member_id : certification.certificate_number) ?? '',
    // The API returns date-typed fields as 'YYYY-MM-DDT00:00:00.000'[Z] (see server.ts's
    // custom json replacer), which a native <input type="date"> silently rejects — it
    // requires exactly 'YYYY-MM-DD'.
    issue_date: certification.issue_date ? getDateInputFormat(certification.issue_date) : null,
    valid_until: certification.valid_until ? getDateInputFormat(certification.valid_until) : null,
  };
};

export const toCertificationRequestBody = (
  data: CertificationFormValues,
  systemTypes: SupportedCertificationSystemType[],
): Partial<Certification> => {
  const systemTypesMap = buildSystemTypesMap(systemTypes);
  const systemType = data.system_type_id ? systemTypesMap[data.system_type_id] : undefined;
  const isPgs = systemType?.certification_translation_key === PGS_TRANSLATION_KEY;
  const isOtherCertifier = data.certifier?.value === 0;

  return {
    system_type_id: data.system_type_id,
    certifier_id: isOtherCertifier ? null : data.certifier?.value ?? null,
    other_certifier: isOtherCertifier ? data.other_certifier.trim() : null,
    is_active: data.is_active,
    certification_type: data.certification_type,
    certificate_number: data.is_active && !isPgs ? data.certificationIdentifier.trim() : null,
    certificate_member_id: data.is_active && isPgs ? data.certificationIdentifier.trim() : null,
    issue_date: data.is_active ? data.issue_date : null,
    valid_until: data.is_active ? data.valid_until : null,
  };
};
