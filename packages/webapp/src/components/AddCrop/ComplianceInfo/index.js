import Button from '../../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Underlined, Label, Info } from '../../Typography';
import PageTitle from '../../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../../ProgressBar';
import Form from '../../Form';
import Checkbox from '../../Form/Checkbox';
import { ReactComponent as Leaf } from '../../../assets/images/signUp/leaf.svg';


export default function ComplianceInfo({ 
  history,
  disabled,
  onSubmit,
  onGoBack,
  organicRegister,
  gmoRegister,
  treatedRegister,
}) {
  
  const { t } = useTranslation(['translation', 'common', 'crop']);
  

  const progress = 66;

  return (
    <Form
      buttonGroup={
          <Button 
            disabled={disabled} 
            fullLength>
            {t('common:SAVE')} 
          </Button>
      }
      onSubmit = {onSubmit}
    >
      
      <PageTitle 
        onGoBack = {onGoBack}
        onCancel = {() => history.push(`/crop_add`)}
        title={"Add a crop"}
      />
      <div style={{
        marginBottom: '23px',
        marginTop: '8px',
        }}>
        <ProgressBar value={progress}/>
      </div>
      <div>
        <div style={{ marginBottom: '16px' }}>
              <Label
                style={{
                  paddingRight: '10px',
                  fontSize: '16px',
                  lineHeight: '20px',
                  display: 'inline-block',
                }}
              >
                {"Is the crop any of the following?"}
              </Label>
          </div>
        </div>
        <Checkbox 
          style={{marginBottom: '24px'}} 
          label={'Certified Organic'} 
          hookFormRegister={organicRegister}
          value={true}
        />
        <Checkbox 
          style={{marginBottom: '24px'}} 
          label={'Non-GMO'} 
          hookFormRegister={gmoRegister}
          value={true}
        />
        <Checkbox 
          style={{marginBottom: '24px'}} 
          label={'Non-Treated'} 
          hookFormRegister={treatedRegister}
          value={true}
        />
        <div
            style={{
              marginTop: '17px',
              marginBottom: '3px',
              display: 'flex',
              width: 'fit-content',
              fontSize: '14px',
              color: 'var(--iconActive)',
              lineHeight: '18px',
              cursor: 'pointer',
            }}
            onClick={()=>{}}
        >
            + <Underlined>{"Link to a compliance file"}</Underlined>
        </div>
        <div>
            <Info 
            style={{
                fontSize: '11px',
                lineHeight: '16px',
            }} 
            > 
                {"You can upload files at a later time as well"}
            </Info>
        </div>
    </Form>
  );
}

ComplianceInfo.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  showSpotLight: PropTypes.bool,
};
