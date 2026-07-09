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

import { Meta, StoryObj } from '@storybook/react';
import { Suspense, useState } from 'react';
import Button from '../../components/Form/Button';
import DeleteConfirmationModal from '../../components/Modals/DeleteConfirmationModal';

function Wrapper({ isLoading }: { isLoading?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Suspense fallback="loading">
      <Button color="secondary" onClick={() => setOpen(true)} sm>
        Open modal
      </Button>
      {open && (
        <DeleteConfirmationModal
          subject="this certification"
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          isLoading={isLoading}
        />
      )}
    </Suspense>
  );
}

const meta: Meta<typeof Wrapper> = {
  title: 'Components/Certifications/DeleteConfirmationModal',
  component: Wrapper,
};

export default meta;

type Story = StoryObj<typeof Wrapper>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isLoading: true },
  render: () => (
    <Suspense fallback="loading">
      <DeleteConfirmationModal
        subject="this certification"
        onClose={() => {}}
        onConfirm={() => {}}
        isLoading
      />
    </Suspense>
  ),
};
