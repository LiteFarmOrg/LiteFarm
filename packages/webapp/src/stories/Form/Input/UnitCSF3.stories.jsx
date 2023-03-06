import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

import Unit from '../../../components/Form/Unit';
import { componentDecorators } from '../../Pages/config/Decorators';
import { bufferZoneEnum, fieldEnum, waterValveEnum } from '../../../containers/constants';
import {
  area_perimeter,
  area_total_area,
  crop_age,
  line_width,
  water_valve_flow_rate,
} from '../../../util/convert-units/unit';
import { useForm } from 'react-hook-form';
import { convert } from '../../../util/convert-units/convert';

const UnitWithHookForm = (props) => {
  const {
    register,
    setValue,
    getValues,
    watch,
    setError,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: props.defaultValues,
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Unit
        register={register}
        errors={errors[props.name]}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        {...props}
      />
    </form>
  );
};

export default {
  title: 'Components/Input/Unit in CSF3',
  component: Unit,
  decorators: componentDecorators, // Oh ok, I see. Wrappers. Handy.
  args: {
    label: 'Default',
    name: fieldEnum?.total_area,
    displayUnitName: fieldEnum?.total_area_unit,
    unitType: area_total_area,
    system: 'imperial',
    required: true,
  },
};

export const Default = (args) => <UnitWithHookForm {...args} />;

export const HasLeaf = (args) => <UnitWithHookForm {...args} />;
HasLeaf.args = {
  label: 'Default with leaf',
  hasLeaf: true,
};

export const Disabled = (args) => <UnitWithHookForm {...args} />;
Disabled.args = {
  label: 'Default Disabled',
  disabled: true,
};

export const PerimeterWithConversionMetric = (args) => <UnitWithHookForm {...args} />;
PerimeterWithConversionMetric.args = {
  label: 'Perimeter',
  name: fieldEnum?.perimeter,
  displayUnitName: fieldEnum?.perimeter_unit,
  unitType: area_perimeter,
  system: 'metric',
};
PerimeterWithConversionMetric.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  //   const mainInput = canvas.getByLabelText('Default'); // This would be preferable but there is no label component here at all

  const mainInput = canvas.getAllByRole('spinbutton')[0];

  await userEvent.type(mainInput, '1006');

  const unitSelect = canvas.getByRole('combobox');
  await userEvent.click(unitSelect);
  const km = canvas.getByText(/km/i);
  await userEvent.click(km);

  const updatedValue = canvas.getByDisplayValue('1.006');
  expect(updatedValue).toBeInTheDocument();
};
