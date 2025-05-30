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
import styles from '../styles.module.scss';
import { Link } from 'react-router-dom';

export type RightChevronLinkProps = {
  path: string;
};

const RightChevronLink = ({ path }: RightChevronLinkProps) => {
  return (
    <Link to={{ pathname: path }}>
      <IconButton color="info" className={styles.rightChevronLink}>
        <BsChevronRight />
      </IconButton>
    </Link>
  );
};

export default RightChevronLink;
