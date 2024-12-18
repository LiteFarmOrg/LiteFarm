/*
 *  Copyright 2024 LiteFarm.org
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
import { IconButton } from '@mui/material';
import { BsChevronRight } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.scss';

export type RightChevronLinkProps = {
  path: string;
};

const RightChevronLink = ({ path }: RightChevronLinkProps) => {
  let navigate = useNavigate();
  return (
    <IconButton color="info" className={styles.rightChevronLink} onClick={() => navigate(path)}>
      <BsChevronRight />
    </IconButton>
  );
};

export default RightChevronLink;
