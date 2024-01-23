import { UseControllerProps, useController, useFormContext } from 'react-hook-form';
import NumberInput, { NumberInputProps } from './NumberInput';

type NumberInputRHFProps = {
  name: string;
  rules?: UseControllerProps['rules'];
} & NumberInputProps;

export default function NumberInputRHF({
  name,
  rules,
  onChange,
  onBlur,
  ...props
}: NumberInputRHFProps) {
  const { control, resetField } = useFormContext();
  const { field, fieldState } = useController({ name, control, rules, defaultValue: props.value });

  return (
    <NumberInput
      {...props}
      value={field.value}
      onChange={(value) => {
        field.onChange(isNaN(value) ? null : value);
        onChange?.(value);
      }}
      onBlur={() => {
        field.onBlur();
        onBlur?.();
      }}
      onCrossClick={() => resetField(name)}
      error={fieldState.error?.message}
    />
  );
}
