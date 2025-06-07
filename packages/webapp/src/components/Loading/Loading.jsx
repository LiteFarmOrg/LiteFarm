import { ReactComponent as LoadingAnimation } from '../../assets/images/signUp/animated_loading_farm.svg';
import { colors } from '../../assets/theme';

export function Loading({ children = <LoadingAnimation />, style, ...props }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        backgroundColor: colors.grey400,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
