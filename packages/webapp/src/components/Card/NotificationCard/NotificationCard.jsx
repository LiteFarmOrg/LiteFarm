import Card from '../index';
import { Semibold, Text } from '../../Typography';
import styles from '../card.module.scss';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { colors } from '../../../assets/theme';
import AlertIcon from '../../../assets/images/alert.svg?react';
import getTaskTypeIcon from '../../util/getTaskTypeIcon';
import getNotificationTypeIcon from '../../util/getNotificationTypeIcon';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';

/**
 * Renders a card containing notification data.
 * @param {NotificationCardConfig} param0
 * @returns {ReactComponent}
 */
export function PureNotificationCard({
  alert,
  status,
  title,
  body,
  variables,
  context,
  created_at,
  onClick,
}) {
  const { t } = useTranslation();
  const currentLang = getLanguageFromLocalStorage();
  // Construct translation options from interpolation variables, translating them as needed.
  const tOptions = variables.reduce((optionsSoFar, currentOption) => {
    let options = { ...optionsSoFar };
    options[currentOption.name] = currentOption.translate
      ? t(currentOption.value)
      : currentOption.value;
    return options;
  }, {});

  let Icon;
  // The "context" can indicate that a particular type of task icon is appropriate.
  if (context?.task_translation_key) Icon = getTaskTypeIcon(context.task_translation_key);
  if (context?.icon_translation_key) Icon = getNotificationTypeIcon(context.icon_translation_key);

  return (
    <Card
      data-cy="notification-card"
      className={clsx(status === 'Read' ? styles.notificationRead : styles.notificationUnread)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
        alignItems: 'center',
        padding: '16px',
        borderTopWidth: '2px',
        borderBottomWidth: '0px',
        borderLeftWidth: '0px',
        borderRightWidth: '0px',
        borderTopRightRadius: '0px',
        borderTopLeftRadius: '0px',
        borderBottomLeftRadius: '0px',
        borderBottomRightRadius: '0px',
        borderColor: '#D4DAE3',
        boxShadow: '0 0 0',
        cursor: 'pointer',
        backgroundColor: 'var(--bgInputListTile)',
      }}
      classes={{
        card: {
          display: 'flex',
          flexDirection: 'row',
          minHeight: '98px',
          width: '100%',
          padding: '160px',
        },
      }}
      onClick={onClick}
    >
      <div>
        <div
          style={{
            width: '49px',
            height: '8px',
            left: '16px',
            top: '313px',
            fontFamily: 'Open Sans',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '10px',
            lineHeight: '16px',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            color: '#66738A',
            marginBottom: '10px',
          }}
        >
          {created_at}
        </div>

        {Icon && (
          <Icon
            style={{
              height: '32px',
              width: '32px',
              marginRight: '16px',
            }}
          />
        )}
      </div>

      <div>
        <Semibold style={{ color: colors.teal700, marginBottom: '12px', lineHeight: '20px' }}>
          {title.translation_key ? t(title.translation_key) : title[currentLang]}
          {alert && <AlertIcon style={{ marginLeft: '8px', marginBottom: '2px' }} />}
        </Semibold>
        <Text style={{ margin: 0, lineHeight: '18px' }}>
          {body.translation_key ? t(body.translation_key, tOptions) : body[currentLang]}
        </Text>
      </div>
    </Card>
  );
}

/**
 * @typedef NotificationCardConfig
 * @desc Configures the presentation of a notification card.
 * @type {object}
 * @property {boolean} alert - Indicates if the card should display an alert indication.
 * @property {userNotificationStatusType} status - The notification's status.
 * @property {string} translation_key - The translation key for the notification, which must contain subkeys for the title and body.
 * @property {InterpolationVariable[]} variables - An array of translation interpolation variables.
 * @property {string} entity_type - The type of entity that the notification refers to, e.g., 'task'.
 * @property {string} entity_id - A unique identifier for the specific entity_type instance that the notification refers to.
 * @property {object} context - A dictionary of context-specific data for the notification.
 * @property {string} created_at - The creation time of the notification.
 */

/**
 * @typedef InterpolationVariable
 * @desc Describes a variable to be interpolated into the translation of a notification's body.
 * @type {object}
 * @property {string} name - A name for the variable.
 * @property {string} value - The variable's value.
 * @property {boolean} translate - Indicates if the value is a key to be translated.
 */
