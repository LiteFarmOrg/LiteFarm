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

import ReleaseBadge from '../../components/ReleaseBadge';
import { componentDecorators } from '../Pages/config/Decorators';
import { Main } from '../../components/Typography';
import styles from './styles.module.scss';

export default {
  title: 'Components/ReleaseBadge',
  component: ReleaseBadge,
  decorators: componentDecorators,
};

const Wrapper = ({ children }) => <div className={styles.wrapper}>{children}</div>;

const Template = (args) => (
  <Wrapper>
    <Main>Resize window to see mobile / desktop view</Main>
    <ReleaseBadge {...args} className={styles.badge} />
  </Wrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  releaseNotesLink: 'https://www.litefarm.org/post/an-investment-in-finances',
};
