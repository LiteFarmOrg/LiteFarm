import { Label, Semibold } from '../Typography';
import { colors } from '../../assets/theme';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '../Form/Button';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px',
    width: 'calc(100vw - 48px)',
    background: '#fafafd',
    borderRadius: '7.05466px',
    position: 'relative',
    padding: '16px',
  },
  contentsContainer: {
    display: 'grid',
    gap: '8px',
  },
  buttonGroup: {
    marginTop: '16px',
    display: 'flex',
  },
}));

export default function JoyrideTooltip({
  step: { title, children, contents, isOrdered, list, buttonText, style },
  continuous,
  tooltipProps,
  primaryProps,
  isLastStep,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div className={classes.container} style={style} {...tooltipProps}>
      {!!title && (
        <Semibold
          style={{
            color: colors.teal700,
            marginBottom: '16px',
          }}
        >
          {title}
        </Semibold>
      )}
      <div className={classes.contentsContainer}>
        {contents && !!contents.length && (
          <div className={classes.contentsContainer}>
            {contents?.map((line, index) => (
              <Label style={{ lineHeight: '20px' }} key={index}>
                {line}
              </Label>
            ))}
          </div>
        )}
        {list && !!list.length && (
          <List classes={classes} isOrdered={isOrdered}>
            {list?.map((line, index) => (
              <Label style={{ lineHeight: '20px' }} key={index}>
                <li>{line}</li>
              </Label>
            ))}
          </List>
        )}
      </div>

      {children}
      {
        <div className={classes.buttonGroup}>
          <Button sm id={continuous ? 'next' : 'close'} {...primaryProps}>
            {buttonText || (isLastStep ? t('common:GOT_IT') : t('common:NEXT'))}
          </Button>
        </div>
      }
    </div>
  );
}

function List({ children, isOrdered, classes }) {
  const style = { marginLeft: '20px' };
  return isOrdered ? (
    <ol style={style} className={classes.contentsContainer}>
      {children}
    </ol>
  ) : (
    <ul style={style} className={classes.contentsContainer}>
      {children}
    </ul>
  );
}
