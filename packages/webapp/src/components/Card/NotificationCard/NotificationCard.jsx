import Card from '../index';
import { Semibold, Text } from '../../Typography';
import cardStyles from '../card.module.scss';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ReactComponent as AlertIcon } from '../../../assets/images/alert.svg';
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
      className={clsx(
        status === 'Read' ? cardStyles.notificationRead : cardStyles.notificationUnread,
        styles.notificationCard,
      )}
      classes={{ card: styles.card }}
      onClick={onClick}
    >
      <div>
        <div className={styles.date}>{created_at}</div>
        {Icon && <Icon className={styles.icon} />}
      </div>

      <div>
        <Semibold className={styles.title}>
          {title.translation_key ? t(title.translation_key) : title[currentLang]}
          {alert && <AlertIcon className={styles.alertIcon} />}
        </Semibold>
        <Text className={styles.body}>
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
