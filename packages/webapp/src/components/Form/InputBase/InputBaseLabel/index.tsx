import Infoi from '../../../Tooltip/Infoi';
import { ReactComponent as Leaf } from '../../../../assets/images/signUp/leaf.svg';
import { Label } from '../../../Typography';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { type InputBaseProps } from '../';

export default function InputBaseLabel(
  props: Pick<InputBaseProps, 'label' | 'icon' | 'optional' | 'toolTipContent' | 'hasLeaf'>,
) {
  const { t } = useTranslation();

  return (
    <div className={styles.labelContainer}>
      <Label style={{ position: 'absolute', bottom: 0 }}>
        {props.label}
        {props.optional && (
          <Label sm className={styles.sm} style={{ marginLeft: '4px' }}>
            {t('common:OPTIONAL')}
          </Label>
        )}
        {props.hasLeaf && <Leaf className={styles.leaf} />}
      </Label>
      {props.toolTipContent && (
        <div className={styles.tooltipIconContainer}>
          <Infoi content={props.toolTipContent} />
        </div>
      )}
      {props.icon && <span className={styles.icon}>{props.icon}</span>}
    </div>
  );
}
