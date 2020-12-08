import styles from './styles.scss';
import Logo from '../../assets/images/signUp/logo.svg';
import LineBreak from '../../assets/images/signUp/lineBreak.svg';
import Button from '../Form/Button';
import Input from '../Form/Input';
import React from 'react';
import Footer from '../Footer';
import GoogleLoginButton from '../../containers/GoogleLoginButton';

export default function PureCustomSignUp({ inputs = [{}], ssoSignUp, onSubmit, disabled }) {
  var color = '';
  disabled ? (color = '#D4DAE3') : (color = '#FCE38D');

  return (
    <>
      <div className={styles.home}>
        <div className={styles.lander}>
          <div className={styles.greetContainer}>
            <img src={Logo} />
            <div className={styles.ssoButton}>
              <GoogleLoginButton />
            </div>
            <div className={styles.lineBreak}>
              <img src={LineBreak} />
            </div>

            <div className={styles.continueButton}>
              <Input
                style={{ width: 312 }}
                className={styles.manualInputContainer}
                {...inputs[0]}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer
        style={{ position: 'sticky', bottom: '0' }}
        children={
          <>
            <div className={styles.bottomButton}>
              <Button
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
                onClick={onSubmit}
              />
            </div>
          </>
        }
      ></Footer>
    </>
  );
}
