import Input, { integerOnKeyDown } from '../Input';
import { Semibold } from '../../Typography';

export default function InputDuration({ label, hookformRegister, style, date }) {
  return (
    <div style={style}>
      <Input onKeyDown={integerOnKeyDown} label={label} hookformRegister={hookformRegister} />
      <Semibold>{date}</Semibold>
    </div>
  );
}
