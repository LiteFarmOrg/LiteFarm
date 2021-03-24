import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import TitleLayout from "../../Layout/TitleLayout";
import Unit from "../../Form/Unit";
import { fieldEnum as areaEnum } from "../../../containers/fieldSlice";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { measurementSelector } from "../../../containers/userFarmSlice";
import Button from "../../Form/Button";
import { Title } from "../../Typography";
import BackArrow from "../../../assets/images/miscs/arrow.svg";

export default function PureLineBox({ children, className, ...props }) {
  const { register, handleSubmit, watch, errors, setValue, getValues, setError, control, formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const system = useSelector(measurementSelector);
  return (
    <div className={clsx(styles.box, className)} {...props}>
      <div style={{flexOrder: 1}}>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <img
            src={BackArrow}
            style={{ cursor: 'pointer', flexOrder: 1}}
          />
          <div style={{flexOrder: 2, flexGrow: '5', marginTop: '15px'}}>
            <Title> What's the width ? </Title>
          </div>
        </div>
      </div>
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={'Buffer zone Width'}
          name={'width'}
          displayUnitName={areaEnum.perimeter_unit}
          // defaultValue={defaultArea}
          errors={'Possible error'}
          from={'m'}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFormSetError={setError}
          control={control}
          required
        />
    </div>
  );
}
