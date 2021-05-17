import Button from '../../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Underlined, Label, Info } from '../../Typography';
import PageTitle from '../../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../../ProgressBar';
import Form from '../../Form';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';
import Radio from '../../Form/Radio';
import Infoi from '../../Tooltip/Infoi';

export default function ComplianceInfo({
  history,
  disabled,
  onSubmit,
  onGoBack,
  onCancel,
  organicRegister,
  organic,
  onSetOrganic,
  commAvailRegister,
  geneticEngRegister,
  treatedRegister,
}) {

  const { t } = useTranslation(['translation', 'common', 'crop']);

  const labelStyle = {
    paddingRight: '10px',
    fontSize: '16px',
    lineHeight: '20px',
    display: 'inline-block',
  };


  const progress = 66;

  const setReqTrue = (reg) => {
    reg.required = true;
    return reg;
  };

  return (
    <Form
      buttonGroup={
        <Button
          disabled={disabled}
          fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={onSubmit}
    >

      <PageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        title={"Add a crop"}
      />
      <div style={{
        marginBottom: '23px',
        marginTop: '8px',
      }}>
        <ProgressBar value={progress} />
      </div>
      <div>
        <div style={{ marginBottom: '16px' }}>
          <Label
            style={labelStyle}
          >
            {"Is the crop certified organic?"}
          </Label>
          <img src={Leaf} style={{ display: 'inline-block' }} />
        </div>
      </div>
      <div>
        <Radio
          label={'Yes'}
          hookFormRegister={organicRegister}
          value={'true'}
          onChange={console.log(organic)}
        />
        <Radio
          style={{ marginLeft: '29px' }}
          label={'No'}
          hookFormRegister={organicRegister}
          value={'false'}
          onChange={onSetOrganic}
        />
      </div>
      <div>
        {organic === 'false' && (
          <div>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Label
                  style={labelStyle}
                >
                  {"Did you perform a commercial availability search?"}
                </Label>
                <img src={Leaf} style={{ display: 'inline-block' }} />
                <Infoi content={"Your certifier may ask for documentation supporting your search."}/>
              </div>
            </div>
            <div>
              <Radio
                label={'Yes'}
                hookFormRegister={commAvailRegister}
                value={true}
                onChange={console.log(organic)}
              />
              <Radio
                style={{ marginLeft: '29px' }}
                label={'No'}
                hookFormRegister={commAvailRegister}
                value={false}
                onChange={onSetOrganic}
              />
            </div>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Label
                  style={labelStyle}
                >
                  {"Is the crop genectically engineered?"}
                </Label>
                <img src={Leaf} style={{ display: 'inline-block' }} />
                <Infoi content={"Your certifier may ask for documentation supporting your claim this crop isn't genetically engineered."}/>
              </div>
            </div>
            <div>
              <Radio
                label={'Yes'}
                hookFormRegister={setReqTrue(geneticEngRegister)}
                value={true}
                onChange={console.log(organic)}
              />
              <Radio
                style={{ marginLeft: '29px' }}
                label={'No'}
                hookFormRegister={setReqTrue(geneticEngRegister)}
                value={false}
                onChange={onSetOrganic}
              />
            </div>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Label
                  style={labelStyle}
                >
                  {"Have the seeds for this crop been treated?"}
                </Label>
                <img src={Leaf} style={{ display: 'inline-block' }} />
                <Infoi content={"Your certifier may ask for documentation describing any treatments. "}/>
              </div>
            </div>
            <div>
              <Radio
                label={'Yes'}
                hookFormRegister={treatedRegister}
                value={true}
                onChange={console.log(organic)}
              />
              <Radio
                style={{ marginLeft: '29px' }}
                label={'No'}
                hookFormRegister={treatedRegister}
                value={false}
                onChange={onSetOrganic}
              />
            </div>
          </div>
        )}
      </div>
      <div>
        {organic === 'true' && (
          <div>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Label
                  style={labelStyle}
                >
                  {"Have the seeds for this crop been treated?"}
                </Label>
                <img src={Leaf} style={{ display: 'inline-block' }} />
                <Infoi content={"Your certifier may ask for documentation describing any treatments. "}/>
              </div>
            </div>
            <div>
              <Radio
                label={'Yes'}
                hookFormRegister={treatedRegister}
                value={true}
                onChange={console.log(organic)}
              />
              <Radio
                style={{ marginLeft: '29px' }}
                label={'No'}
                hookFormRegister={treatedRegister}
                value={false}
                onChange={onSetOrganic}
              />
            </div>
          </div>
        )}
      </div>


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
        onClick={() => { }}
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
