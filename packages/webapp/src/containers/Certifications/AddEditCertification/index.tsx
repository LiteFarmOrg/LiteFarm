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

import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CertificationForm, {
  CertificationFormValues,
} from '../../../components/Certifications/CertificationForm';
import { loginSelector } from '../../userFarmSlice';
import {
  useGetCertificationsQuery,
  useAddCertificationMutation,
  useEditCertificationMutation,
} from '../../../store/api/certificationsApi';
import {
  useGetSupportedCertifiersQuery,
  useGetSupportedCertificationSystemTypesQuery,
} from '../../../store/api/certifiersApi';
import {
  toFormSystemTypes,
  toFormCertifiers,
  toCertificationFormValues,
  toCertificationRequestBody,
} from '../utils';

export default function AddEditCertification() {
  const { t } = useTranslation(['translation', 'common']);
  const history = useHistory();
  const { certification_id } = useParams<{ certification_id?: string }>();
  const { farm_id } = useSelector(loginSelector);
  const { data: certifications = [] } = useGetCertificationsQuery();
  const { data: certifiers = [] } = useGetSupportedCertifiersQuery(farm_id!);
  const { data: systemTypes = [] } = useGetSupportedCertificationSystemTypesQuery(farm_id!);
  const [addCertification] = useAddCertificationMutation();
  const [editCertification] = useEditCertificationMutation();

  const certification = certification_id
    ? certifications.find((c) => c.id === certification_id)
    : undefined;

  const defaultValues = certification
    ? toCertificationFormValues(certification, systemTypes, certifiers, t)
    : undefined;

  const onBack = () => {
    // @ts-expect-error: temporary shim, will remove when upgrading to history@5
    history.back();
  };

  const onSubmit = async (data: CertificationFormValues) => {
    const body = toCertificationRequestBody(data, systemTypes);
    if (certification_id) {
      await editCertification({ id: certification_id, body });
    } else {
      await addCertification(body);
    }
    history.push('/certifications', { certificationSaved: true });
  };

  return (
    <CertificationForm
      systemTypes={toFormSystemTypes(systemTypes)}
      certifiers={toFormCertifiers(certifiers)}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onBack={onBack}
    />
  );
}
