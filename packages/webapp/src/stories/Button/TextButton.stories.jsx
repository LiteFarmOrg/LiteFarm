/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import { BsChevronLeft } from 'react-icons/bs';
import TextButton from '../../components/Form/Button/TextButton';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/Button/TextButton',
  component: TextButton,
  decorators: componentDecorators,
};

export const Text = {
  render: () => <TextButton onClick={() => console.log('Clicked!')}>Text Button</TextButton>,
};

export const DisabledText = {
  render: () => (
    <TextButton disabled onClick={() => console.log('Clicked!')}>
      TextButton
    </TextButton>
  ),
};

export const IconText = {
  render: () => (
    <TextButton
      onClick={() => console.log('Clicked!')}
      disabled={false}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <BsChevronLeft />
      back
    </TextButton>
  ),
};

export const DisabledIconText = {
  render: () => (
    <TextButton
      onClick={() => console.log('Clicked!')}
      disabled={true}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <BsChevronLeft />
      back
    </TextButton>
  ),
};
