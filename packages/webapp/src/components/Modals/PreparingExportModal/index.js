import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.scss';
import { ReactComponent as Leaf } from '../../../assets/images/export/email/Email.svg';

export default function PreparingExportModal({ dismissModal }) {
	const { t } = useTranslation();

	return (
		<ModalComponent
			dismissModal={dismissModal}
			title={t('EXPORT.PREPARING')}
			icon={true}
		>

		</ModalComponent>
	)
}