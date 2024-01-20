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
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control, rules });

  return (
    <NumberInput
      {...props}
      value={field.value}
      onChange={(value) => {
        field.onChange(value);
        onChange?.(value);
      }}
      onBlur={() => {
        field.onBlur();
        onBlur?.();
      }}
      errors={fieldState.error?.message}
    />
  );
}
