import styles from './styles.scss';
import { ReactComponent as Logo } from '../../assets/images/signUp/logo.svg';
import { ReactComponent as LineBreak } from '../../assets/images/signUp/lineBreak.svg';
import Button from '../Form/Button';
import Input from '../Form/Input';
import React from 'react';
import Footer from '../Footer';
import GoogleLoginButton from '../../containers/GoogleLoginButton';

const inputClasses = {
  container: {
    width: 312,
  },
};

export default function PureCustomSignUp({ inputs = [{}], onSubmit, disabled }) {
  var color = '';

  return (
    <form onSubmit={onSubmit} className={styles.home}>
      <div className={styles.lander}>
        <div className={styles.greetContainer}>
          <Logo />
          <div className={styles.ssoButton}>
            <GoogleLoginButton />
          </div>
          <div className={styles.lineBreak}>
            <LineBreak />
          </div>

          <div className={styles.continueButton}>
            <Input classes={inputClasses} {...inputs[0]} />
          </div>
        </div>
      </div>
      <Footer style={{ position: 'sticky', bottom: 0 }}>
        <div className={styles.bottomButton}>
          <Button
            disabled={disabled}
            style={{
              background: color,
              border: '4px',
              shadow: '0px 2px 8px rgba(102, 115, 138, 0.3)',
              width: 312,
              height: 48,
            }}
            type="submit"
            fullLength
            children="Continue"
          />
        </div>
      </Footer>
    </form>
  );
}
