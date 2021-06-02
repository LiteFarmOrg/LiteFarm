import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label } from '../Typography';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../ProgressBar';
import Radio from '../Form/Radio';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import Infoi from '../Tooltip/Infoi';

export default function Transplant({
    onSubmit,
    isCoverCrop,
    onCancel,
    onGoBack,
    useHookFormPersist,
    persistedFormData,
    match,
}) {

    const { t } = useTranslation(['translation', 'common', 'crop']);

    const progress = 12.5;

    const {
        register,
        handleSubmit,
        getValues,
        formState: { isValid },
    } = useForm({
        mode: 'onChange',
        shouldUnregister: true,
        defaultValues: { ...persistedFormData },
    });

    // TODO - Add path
    const persistedPath = [`/crop/${match.params.variety_id}/choose_planting_location`];
    useHookFormPersist(persistedPath, getValues);

    const disabled = !isValid;

    const TRANSPLANT = 'needs_transplant';
    const COVER = 'for_cover';

    const transplant_register = register(TRANSPLANT, { required: true });
    const cover_register = register(COVER, { required: isCoverCrop ? true : false });

    return (
        <Form
            buttonGroup={
                <Button disabled={disabled} fullLength>
                    {t('common:CONTINUE')}
                </Button>
            }
            onSubmit={handleSubmit(onSubmit)}
        >
            <PageTitle onGoBack={onGoBack} onCancel={onCancel} title={t('CROP_MANAGEMENT.ADD_MANAGEMENT_PLAN')} />
            <div
                style={{
                    marginBottom: '24px',
                    marginTop: '16px',
                }}
            >
                <ProgressBar value={progress} />
            </div>
            <div>
                <div style={{ marginBottom: '18px' }}>
                    <Label
                        style={{
                            paddingRight: '10px',
                            fontSize: '16px',
                            lineHeight: '20px',
                            display: 'inline-block',
                        }}
                    >
                        {t('CROP_MANAGEMENT.TRANSPLANT')}
                    </Label>
                </div>
                <div>
                    <Radio label={t('Yes')} value={true} hookFormRegister={transplant_register} />
                </div>
                <div>
                    <Radio label={t('No')} value={false} hookFormRegister={transplant_register} />
                </div>
            </div>
            <div>
                {isCoverCrop && (
                    <div>
                        <div style={{ marginTop: '16px', marginBottom: '18px' }}>
                            <Label
                                style={{
                                    paddingRight: '10px',
                                    fontSize: '16px',
                                    lineHeight: '20px',
                                    display: 'inline-block',
                                }}
                            >
                                {t('CROP_MANAGEMENT.COVER_OR_HARVEST')}
                                {
                                    <Infoi
                                        style={{ marginLeft: '8px' }}
                                        content={t('CROP_MANAGEMENT.COVER_INFO')}
                                    />
                                }
                            </Label>
                        </div>
                        <div>
                            <Radio label={t('CROP_MANAGEMENT.AS_COVER_CROP')} value={true} hookFormRegister={cover_register} />
                        </div>
                        <div>
                            <Radio label={t('CROP_MANAGEMENT.FOR_HARVEST')} value={false} hookFormRegister={cover_register} />
                        </div>
                    </div>
                )}
            </div>

        </Form>
    );
}

Transplant.prototype = {
    isCoverCrop: PropTypes.bool,
    onSubmit: PropTypes.func,
    onGoBack: PropTypes.func,
    onCancel: PropTypes.func,
    persistedFormData: PropTypes.func,
    useHookFormPersist: PropTypes.func,
    match: PropTypes.object,
};