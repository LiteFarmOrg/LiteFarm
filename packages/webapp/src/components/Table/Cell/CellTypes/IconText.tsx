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
import clsx from 'clsx';
import Icon, { IconName } from '../../../Icons';
import styles from '../styles.module.scss';

export type IconTextProps = {
  iconName: IconName;
  iconBorder?: boolean;
  text?: string | number | null;
  subtext?: string | number | null;
  highlightedText?: string | number | null;
  photoUrl?: string | null;
  removed?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const IconText = ({
  iconName,
  iconBorder = false,
  text,
  subtext,
  highlightedText,
  removed,
  photoUrl,
  className,
  style,
}: IconTextProps) => {
  return (
    <div className={clsx(styles.iconTextContainer, className)} style={style}>
      {photoUrl && iconName !== 'REMOVED_ANIMAL' ? (
        <img src={photoUrl} className={styles.photoUrl} />
      ) : (
        <Icon
          iconName={iconName}
          className={clsx(styles.iconTextIcon, iconBorder && styles.iconBorder)}
        />
      )}
      <div className={clsx(styles.text, styles.overflowText, subtext && styles.withSubtextText)}>
        <div className={clsx(styles.mainText, removed && styles.removed)}>
          <div
            className={clsx(
              styles.overflowText,
              subtext && styles.withSubtextMainText,
              removed && styles.removed,
            )}
          >
            {text}
          </div>
          {highlightedText && (
            <div className={clsx(styles.highlightedText, styles.overflowHidden)}>
              <p>{highlightedText}</p>
            </div>
          )}
        </div>
        <div
          className={clsx(
            styles.overflowText,
            subtext && styles.withSubtextSubtext,
            removed && styles.removed,
          )}
        >
          {subtext}
        </div>
      </div>
    </div>
  );
};

export default IconText;
