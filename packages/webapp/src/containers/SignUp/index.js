import React from 'react';
import { connect } from 'react-redux';
import { Control, Errors, Form } from 'react-redux-form';
import axios from 'axios';
import { toastr } from 'react-redux-toastr';
import styles from './styles.scss';
import apiConfig from '../../apiConfig';
import Auth from '../../Auth/Auth';
import Callback from '../../components/Callback';
import InvalidToken from './InvalidToken';

const auth = new Auth();
const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
// MUST pass in component like this per package requirements
const CustomInput = (props) => {
  const { visibilityIcon, onClickToggleVisibility, ...inputProps } = props;
  return (
    <div className={styles.passwordFieldContainer}>
      <input className={styles.passwordField} {...inputProps} />
      <i
        className={`material-icons ${styles.visibilityIconButton}`}
        onClick={onClickToggleVisibility}
      >
        {visibilityIcon}
      </i>
    </div>
  );
};

const signUpFields = [
  {
    key: 'email',
    type: 'text',
    label: 'Email',
    isEditable: false,
    validators: {
      required: (val) => val.length,
      validEmail: (val) => validEmailRegex.test(val),
    },
    errorMessages: {
      required: 'Email cannot be empty',
      validEmail: 'Email must be valid',
    },
  },
  {
    key: 'first_name',
    type: 'text',
    label: 'First Name',
    isEditable: true,
    validators: {
      required: (val) => val.length,
    },
    errorMessages: {
      required: 'First name cannot be empty',
    },
  },
  {
    key: 'last_name',
    type: 'text',
    label: 'Last Name',
    isEditable: true,
    validators: {
      required: (val) => val.length,
    },
    errorMessages: {
      required: 'Last name cannot be empty',
    },
  },
  {
    key: 'password',
    type: 'password',
    label: 'Password',
    isEditable: true,
    validators: {
      length: (val) => val.length >= 8,
      upperCase: (val) => RegExp(/(?=.*[A-Z])/).test(val),
      digit: (val) => RegExp(/(?=.*\d)/).test(val),
      symbol: (val) => RegExp(/(?=.*\W)/).test(val),
    },
    errorMessages: {
      length: 'at least 8 characters',
      upperCase: 'at least one upper case character',
      digit: 'at least one number',
      symbol: 'at least one special character',
    },
  }
];

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    const { match } = props;
    const { params } = match;
    const {
      token,
      user_id,
      farm_id,
      email,
      first_name,
      last_name,
    } = params;

    this.state = {
      tokenStatus: null,
      token,
      user_id,
      farm_id,
      email,
      first_name,
      last_name,
      showPassword: false,
    };
  }

  async componentDidMount() {
    // Make API call to verify token and set tokenStatus's state accordingly
    const { signUpUrl } = apiConfig;
    const { token, farm_id, user_id } = this.state;
    try {
      const header = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const result = await axios.get(signUpUrl + `/verify_token/${token}/farm/${farm_id}/user/${user_id}`, header);
      if (result) {
        if(result.status === 200){
          this.setState({ tokenStatus: 'valid' });
        }
        else if(result.status === 202){
          this.setState({ tokenStatus: 'used' });
          auth.login();
        }
        else if(result.status === 401){
          this.setState({ tokenStatus: 'invalid' });
        }
        
      }
    } catch (error) {
      this.setState({ tokenStatus: 'invalid' });
      if (error.response) {
        console.error(error.response.data);
      } else {
        toastr.error('Token verification failed');
      }
    }
  }

  onClickSubmit = async (form) => {
    const { signUpUrl } = apiConfig;
    const {
      token,
      user_id,
      farm_id,
    } = this.state;
    const {
      first_name,
      last_name,
      password,
    } = form;

    const user = {
      token,
      farm_id,
      first_name,
      last_name,
      password,
    };

    const header = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const result = await axios.patch(signUpUrl + `/${user_id}`, user, header);
      if (result && result.status === 200) {
        toastr.success(result.data);
        auth.login();
        this.setState({ tokenStatus: 'used' });
      }
    } catch (error) {
      if (error.response) {
        toastr.error(error.response.data);
      } else {
        toastr.error('Failed to sign up');
      }
    }
  };

  isDisabled = () => {
    const { profileForms } = this.props;
    const { signUpInfo } = profileForms;
    // If at least one field has errors, return true
    return Object.keys(signUpInfo).some(key => {
      const target = signUpFields.find(field => field.key === key);
      const { validators } = target;
      const textFieldValue = signUpInfo[key];
      return Object.keys(validators).some(validator => !validators[validator](textFieldValue));
    });
  };

  renderControlComponent = (field) => {
    const { key, type, validators, isEditable } = field;
    const { showPassword } = this.state;

    if (key === 'password') {
      const visibilityIcon = showPassword ? 'visibility' : 'visibility_off';
      const onClickToggleVisibility = () => this.setState({ showPassword: !showPassword });

      return (
        <Control
          type={showPassword ? 'text' : 'password'}
          model={`.signUpInfo.${key}`}
          validators={validators}
          defaultValue={this.state[key] || ''}
          disabled={!isEditable}
          component={CustomInput}
          controlProps={{
            visibilityIcon,
            onClickToggleVisibility,
          }}
        />
      );
    }

    return (
      <Control.text
        type={type}
        model={`.signUpInfo.${key}`}
        validators={validators}
        defaultValue={this.state[key] || ''}
        disabled={!isEditable}
      />
    );
  };

  renderErrorComponent = (controlledTextComponent) => {
    const { profileForms } = this.props;
    const { signUpInfo } = profileForms;
    const { password } = signUpInfo;
    const { key, validators, errorMessages } = controlledTextComponent;
    if (key === 'password') {
      // Custom error component that doesn't hide error messages when errorless
      return (
        <div className={styles.criteriaContainer}>
          {
            Object.keys(validators).map(criterion => {
              const isCriterionSatisfied = validators[criterion](password);
              const statusIconStyle = isCriterionSatisfied
                ? styles.satisfiedIcon
                : styles.unsatisfiedIcon;
              const statusIcon = isCriterionSatisfied ? 'done' : 'close';
              const criterionTextStyle = isCriterionSatisfied
                ? styles.satsifiedText
                : styles.unsatisfiedText;
              return (
                <div key={criterion} className={styles.criterionContainer}>
                  <i className={`material-icons ${statusIconStyle}`}>
                    {statusIcon}
                  </i>
                  <div className={criterionTextStyle}>
                    {errorMessages[criterion]}
                  </div>
                </div>
              );
            })
          }
        </div>
      );
    }

    return (
      <Errors
        model={`.signUpInfo.${key}`}
        messages={errorMessages}
        show={field => (field.touched && !field.focus)}
        component={(props) => (
          <div className={styles.errorContainer}>
            <i className="material-icons">error_outline</i>
            <div className={styles.errorText}>{props.children}</div>
          </div>
        )}
      />
    );
  };

  render() {
    const { tokenStatus } = this.state;

    if (tokenStatus === 'invalid') {
      return (
        <InvalidToken/>
      );
    }

    if(tokenStatus === 'valid'){
      return (
        <div className={styles.home}>
          <div className={styles.titleContainer}>
            <h3>Sign Up</h3>
          </div>
          <Form
            model="profileForms"
            onSubmit={(val) => this.onClickSubmit(val.signUpInfo)}
            className={styles.formContainer}
          >
            {
              signUpFields.map(field => {
                const { key, label } = field;
                return (
                  <div key={key}>
                    <div className={styles.inputContainer}>
                      <label>{label}</label>
                      { this.renderControlComponent(field) }
                    </div>
                    { this.renderErrorComponent(field) }
                  </div>
                );
              })
            }
            <button
              type="submit"
              className={styles.signUpButton}
              disabled={this.isDisabled()}
            >
              Sign Up
            </button>
          </Form>
        </div>
      );
    }

    return <Callback />
  }
}

const mapStateToProps = (state) => {
  return {
    profileForms: state.profileForms,
  }
};

export default connect(mapStateToProps)(SignUp);
