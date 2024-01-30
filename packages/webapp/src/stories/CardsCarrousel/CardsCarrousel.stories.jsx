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
import React from 'react';
import { expect } from '@storybook/jest';
import { within, userEvent, waitForElementToBeRemoved } from '@storybook/testing-library';
import CardsCarrousel from '../../components/CardsCarrousel';
import { componentDecorators } from '../Pages/config/Decorators';
import LabourIcon from '../../assets/images/finance/Labour-icn.svg';
import SeedsIcon from '../../assets/images/finance/Seeds-icn.svg';
import UtilitesIcon from '../../assets/images/finance/Utilities-icn.svg';

export default {
  title: 'Components/CardsCarrousel',
  component: CardsCarrousel,
  decorators: componentDecorators,
};

const ICON_LABELS = ['first-icon', 'second-icon', 'third-icon'];

const CONTENTS = [
  'First card random content',
  'Second card random content',
  'Third card random content',
];

const MOCK_CARDS = [
  {
    id: 'first-card',
    label: 'first-card',
    inactiveBackgroundColor: 'var(--teal900)',
    inactiveIcon: <LabourIcon aria-label={ICON_LABELS[0]} />,
    activeContent: <p>{CONTENTS[0]}</p>,
    note: 'Note for first card',
    noteColor: 'var(--teal700)',
  },
  {
    id: 'second-card',
    label: 'second-card',
    inactiveBackgroundColor: 'var(--teal700)',
    inactiveIcon: <SeedsIcon aria-label={ICON_LABELS[1]} />,
    activeContent: <p>{CONTENTS[1]}</p>,
    note: 'Note for second card',
    noteColor: 'var(--teal600)',
  },
  {
    id: 'third-card',
    label: 'third-card',
    inactiveBackgroundColor: 'var(--teal600)',
    inactiveIcon: <UtilitesIcon aria-label={ICON_LABELS[2]} />,
    activeContent: <p>{CONTENTS[2]}</p>,
    note: 'Note for third card',
    noteColor: 'var(--teal900)',
  },
];

export const Carrousel = {
  render: () => <CardsCarrousel cards={MOCK_CARDS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const getCardContent = (cardIndex) => canvas.queryByText(CONTENTS[cardIndex]);
    const getCardIcon = (cardIndex) => canvas.queryByLabelText(ICON_LABELS[cardIndex]);
    const getCardNote = (cardIndex) => canvas.queryByText(MOCK_CARDS[cardIndex].note);

    for (let i = 0; i < MOCK_CARDS.length; i++) {
      const inactiveIndices = [0, 1, 2].filter((index) => index !== i);
      expect(getCardContent(i)).toBeVisible();
      expect(getCardIcon(i)).toBeNull();
      expect(getCardNote(i)).toBeVisible();
      inactiveIndices.forEach((index) => {
        expect(getCardContent(index)).toBeNull();
        expect(getCardIcon(index)).toBeVisible();
        expect(getCardNote(index)).toBeNull();
      });
      // Switch to next card (unless it's the last one)
      if (i !== MOCK_CARDS.length - 1) {
        userEvent.click(canvas.getByLabelText(MOCK_CARDS[i + 1].label));
        await waitForElementToBeRemoved(getCardContent(i));
      }
    }
  },
};
