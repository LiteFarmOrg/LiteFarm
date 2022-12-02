import {
  PopoverContentProps,
  StepType,
  TourProps,
  TourProvider,
  ProviderProps,
} from '@reactour/tour';
import React, { ReactNode, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { Label, Semibold } from '../Typography';
import { colors } from '../../assets/theme';
import Button from '../Form/Button';
import { keyframes } from '@emotion/react';

const opositeSide = {
  top: 'bottom',
  bottom: 'top',
  right: 'left',
  left: 'right',
};
type VerticalAlign = 'top' | 'bottom';
type HorizontalAlign = 'left' | 'right';
type Position = VerticalAlign | HorizontalAlign | 'custom' | 'center';

type Style = { [prop: string]: string };

type getStylesProps = {
  arrowOffset: number;
  popoverStyles: Style;
  maskStyles: Style;
  showMaskArea?: boolean;
};

const getStyles = ({
  showMaskArea,
  arrowOffset = 0,
  popoverStyles,
  maskStyles,
}: getStylesProps): TourProps['styles'] => ({
  maskArea: (base, state) => ({ ...base, rx: 8, display: showMaskArea ? undefined : 'none' }),
  popover: (base, state) => {
    const fadein = keyframes`
      0%, 50% {
        opacity: 0;
      }
      100% {
        opacity: 100%;
      }`;
    const baseStyles = {
      borderRadius: 8,
      display: 'flex',
      maxWidth: '500px',
      background: colors.grey100,
      padding: '16px',
      animation: `${fadein} 0.5s ease`,
      ...popoverStyles,
    };
    const position: Position = state?.position;
    if (!position || position === 'custom' || position === 'center') {
      return {
        ...base,
        flexDirection: 'column',
        ...baseStyles,
        width: 'min(500px, calc(100vw - 48px))',
      };
    }

    const width = 32;
    const height = 16;
    const isVertical = position === 'top' || position === 'bottom';
    const verticalAlign: VerticalAlign = state?.verticalAlign;
    const horizontalAlign: HorizontalAlign = state?.horizontalAlign;
    const getPopoverOffset = () => {
      switch (position) {
        case 'top':
          return { top: '-24px' };
        case 'bottom':
          return { top: '12px' };
        default:
          return {};
      }
    };
    return {
      ...base,
      flexDirection: 'column',
      ...baseStyles,
      ...getPopoverOffset(),
      '&::after': {
        content: "''",
        width: 0,
        height: 0,
        position: 'absolute',
        [isVertical ? 'borderLeft' : 'borderTop']: `${width / 2}px solid transparent`,
        [isVertical ? 'borderRight' : 'borderBottom']: `${width / 2}px solid transparent`,
        [`border${position[0].toUpperCase()}${position.substring(
          1,
        )}`]: `${height}px solid ${colors.grey100}`,
        [isVertical ? opositeSide[horizontalAlign] : verticalAlign]: height - 10 + arrowOffset,
        [opositeSide[position]]: -height,
      },
    };
  },
});

type TourContentBodyStep = {
  title?: ReactNode;
  children?: ReactNode;
  contents?: ReactNode[];
  isOrdered?: boolean;
  list?: ReactNode[];
  buttonText?: ReactNode;
  icon?: ReactNode;
  onNext?(): void;
};

type Step = Omit<StepType, 'content'> & TourContentBodyStep & getStylesProps;

type TourProviderWrapperProps = ReactourChildrenWrapperProps &
  Omit<ProviderProps, 'children' | 'steps'> & {
    steps: Step[];
    onFinish?(): void;
  };

export function TourProviderWrapper({
  steps,
  children = <div />,
  open,
  onFinish,
  ...props
}: TourProviderWrapperProps) {
  if (!open) return children;
  const processedSteps = useMemo(() => {
    return steps.map(({ arrowOffset, popoverStyles, maskStyles, ...step }) => {
      return {
        ...step,
        styles: getStyles({
          showMaskArea: !!step.selector,
          arrowOffset,
          popoverStyles,
          maskStyles,
        }),
        content: (props: PopoverContentProps) => (
          <TourContentBody
            onFinish={onFinish}
            isLastStep={steps.length === props.currentStep + 1}
            {...props}
            step={step}
          />
        ),
      };
    });
  }, []);
  return (
    <TourProvider
      onClickMask={({ setCurrentStep, currentStep, setIsOpen }) => {
        if (currentStep === steps.length - 1) {
          setIsOpen(false);
          onFinish?.();
        } else {
          setCurrentStep((s) => (s === steps.length - 1 ? 0 : s + 1));
        }
      }}
      showBadge={false}
      showNavigation={false}
      showCloseButton={false}
      defaultOpen={open}
      steps={processedSteps}
      {...props}
    >
      <ReactourChildrenWrapper open={open}>{children}</ReactourChildrenWrapper>
    </TourProvider>
  );
}

type ReactourChildrenWrapperProps = {
  open: boolean;
  children?: ReactNode;
};

function ReactourChildrenWrapper({ open, children }: ReactourChildrenWrapperProps) {
  return <>{children}</>;
}

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

type TourContentBodyProps = {
  step: TourContentBodyStep;
  continuous?: boolean;
  primaryProps?: object;
  isLastStep?: boolean;
  onFinish?(): void;
  setCurrentStep: PopoverContentProps['setCurrentStep'];
  currentStep: PopoverContentProps['currentStep'];
  setIsOpen: PopoverContentProps['setIsOpen'];
};

export function TourContentBody({
  step: { title, children, contents, isOrdered, list, buttonText, icon, onNext },
  continuous,
  primaryProps,
  isLastStep,
  setCurrentStep,
  currentStep,
  setIsOpen,
  onFinish,
}: TourContentBodyProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const onClick = () => {
    if (isLastStep) {
      setIsOpen(false);
      onFinish?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
    onNext?.();
  };
  return (
    <>
      {!!title && (
        <Semibold
          style={{
            color: colors.teal700,
            marginBottom: '16px',
            display: 'inline-flex',
            gap: '8px',
          }}
        >
          {icon && icon}
          {title}
        </Semibold>
      )}
      <div data-cy="spotlight-contents" className={classes.contentsContainer}>
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
          <Button
            data-cy="spotlight-next"
            onClick={onClick}
            sm
            id={continuous ? 'next' : 'close'}
            {...primaryProps}
          >
            {buttonText || (isLastStep ? t('common:GOT_IT') : t('common:NEXT'))}
          </Button>
        </div>
      }
    </>
  );
}

type ListProps = {
  children?: ReactNode;
  isOrdered?: boolean;
  classes: {
    contentsContainer?: string;
  };
};

function List({ children, isOrdered, classes }: ListProps) {
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
