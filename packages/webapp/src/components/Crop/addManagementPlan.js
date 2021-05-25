import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label } from '../Typography';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../../components/ProgressBar';
import Radio from '../Form/Radio';
import Form from '../Form';
import { useForm } from 'react-hook-form';


export default function PureAddManagementPlan({
    history,
    match,
    onSubmit,
    onError,
    disabled,
    handleCancel,
    handleGoBack,
}) {

    const { t } = useTranslation(['translation', 'common', 'crop']);

    const progress = 12.5;

    return (
        <Form
            buttonGroup={
                <Button disabled={disabled} fullLength>
                    {t('common:CONTINUE')}
                </Button>
            }
        >
            <PageTitle onGoBack={() => { }} onCancel={() => { }} title={'Add a management plan'} />
            <div
                style={{
                    marginBottom: '24px',
                    marginTop: '8px',
                }}
            >
                <ProgressBar value={progress} />
            </div>
            <div>
                <div style={{ marginBottom: '24px' }}>
                    <Label
                        style={{
                            paddingRight: '10px',
                            fontSize: '16px',
                            lineHeight: '20px',
                            display: 'inline-block',
                        }}
                    >
                        {'Will this crop be transplanted?'}
                    </Label>
                </div>
                <div>
                    <Radio label={t('Yes')} value={true} />
                </div>
                <div>
                    <Radio label={t('No')} value={false} />
                </div>
            </div>

        </Form>
    );
}

PureAddManagementPlan.prototype = {
    history: PropTypes.object,
    match: PropTypes.object,
    onSubmit: PropTypes.func,
    onError: PropTypes.func,
};