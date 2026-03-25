/*
 *  Copyright 2026 LiteFarm.org
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

import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import ImageLightbox, { type ImageLightboxProps } from '../../components/ImageLightbox';
import styles from './styles.module.scss';
import { Info } from '../../components/Typography';

const meta: Meta<ImageLightboxProps> = {
  title: 'Components/ImageLightbox',
  component: ImageLightbox,
  decorators: componentDecorators,
  args: {
    src: 'src/stories/ImageLightbox/image_lightbox_sample.png',
    open: true,
    onClose: () => console.log('close'),
  },
};
export default meta;

type Story = StoryObj<typeof ImageLightbox>;

export const Open: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <div className={styles.wrapper}>
        <button type="button" onClick={() => setOpen(true)} className={styles.triggerButton}>
          <img src={args.src} alt="Sample for lightbox" className={styles.previewImage} />
        </button>
        <Info>Click to enlarge</Info>

        <ImageLightbox {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
