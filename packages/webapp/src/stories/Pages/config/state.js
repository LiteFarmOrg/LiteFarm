export default {
  toastr: {
    toastrs: [],
    confirm: null
  },
  profileForms: {
    addInfo: {
      first_name: '',
      last_name: '',
      email: '',
      role: 'Worker',
      pay: {
        type: '',
        amount: null
      }
    },
    farm: {
      farm_name: '',
      address: '',
      gridPoints: {},
      unit: 'metric',
      currency: 'CAD',
      date: 'MM/DD/YY',
      sandbox: false
    },
    notification: {
      alert_pest: true,
      alert_weather: true,
      alert_worker_finish: true,
      alert_before_planned_date: true,
      alert_action_after_scouting: true
    },
    userInfo: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      address: '',
      profile_picture: ''
    },
    farmInfo: {
      farm_name: '',
      unit: 'metric',
      currency: 'CAD',
      date: 'MM/DD/YY',
      phone_number: '',
      phone_country: '',
      address: '',
      gridPoints: {}
    },
    editInfo: {
      first_name: '',
      last_name: '',
      email: '',
      role: 'Worker',
      pay: {
        type: 'hourly',
        amount: 0
      }
    },
    signUpInfo: {
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    },
    forms: {
      $form: {
        initialValue: {
          addInfo: {
            first_name: '',
            last_name: '',
            email: '',
            role: 'Worker',
            pay: {
              type: '',
              amount: null
            }
          },
          farm: {
            farm_name: '',
            address: '',
            gridPoints: {},
            unit: 'metric',
            currency: 'CAD',
            date: 'MM/DD/YY',
            sandbox: false
          },
          notification: {
            alert_pest: true,
            alert_weather: true,
            alert_worker_finish: true,
            alert_before_planned_date: true,
            alert_action_after_scouting: true
          },
          userInfo: {
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            address: '',
            profile_picture: ''
          },
          farmInfo: {
            farm_name: '',
            unit: 'metric',
            currency: 'CAD',
            date: 'MM/DD/YY',
            phone_number: '',
            phone_country: '',
            address: '',
            gridPoints: {}
          },
          editInfo: {
            first_name: '',
            last_name: '',
            email: '',
            role: 'Worker',
            pay: {
              type: 'hourly',
              amount: 0
            }
          },
          signUpInfo: {
            first_name: '',
            last_name: '',
            email: '',
            password: ''
          }
        },
        focus: false,
        pending: false,
        pristine: true,
        submitted: false,
        submitFailed: false,
        retouched: false,
        touched: false,
        valid: true,
        validating: false,
        validated: false,
        validity: {},
        errors: {},
        intents: [],
        model: 'profileForms',
        value: {
          addInfo: {
            first_name: '',
            last_name: '',
            email: '',
            role: 'Worker',
            pay: {
              type: '',
              amount: null
            }
          },
          farm: {
            farm_name: '',
            address: '',
            gridPoints: {},
            unit: 'metric',
            currency: 'CAD',
            date: 'MM/DD/YY',
            sandbox: false
          },
          notification: {
            alert_pest: true,
            alert_weather: true,
            alert_worker_finish: true,
            alert_before_planned_date: true,
            alert_action_after_scouting: true
          },
          userInfo: {
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            address: '',
            profile_picture: ''
          },
          farmInfo: {
            farm_name: '',
            unit: 'metric',
            currency: 'CAD',
            date: 'MM/DD/YY',
            phone_number: '',
            phone_country: '',
            address: '',
            gridPoints: {}
          },
          editInfo: {
            first_name: '',
            last_name: '',
            email: '',
            role: 'Worker',
            pay: {
              type: 'hourly',
              amount: 0
            }
          },
          signUpInfo: {
            first_name: '',
            last_name: '',
            email: '',
            password: ''
          }
        }
      },
      addInfo: {
        $form: {
          initialValue: {
            first_name: '',
            last_name: '',
            email: '',
            role: 'Worker',
            pay: {
              type: '',
              amount: null
            }
          },
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.addInfo',
          value: {
            first_name: '',
            last_name: '',
            email: '',
            role: 'Worker',
            pay: {
              type: '',
              amount: null
            }
          }
        },
        first_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.addInfo.first_name',
          value: ''
        },
        last_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.addInfo.last_name',
          value: ''
        },
        email: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.addInfo.email',
          value: ''
        },
        role: {
          initialValue: 'Worker',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.addInfo.role',
          value: 'Worker'
        },
        pay: {
          $form: {
            initialValue: {
              type: '',
              amount: null
            },
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'profileForms.addInfo.pay',
            value: {
              type: '',
              amount: null
            }
          },
          type: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'profileForms.addInfo.pay.type',
            value: ''
          },
          amount: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'profileForms.addInfo.pay.amount',
            value: null
          }
        }
      },
      farm: {
        $form: {
          initialValue: {
            farm_name: '',
            address: '',
            gridPoints: {},
            unit: 'metric',
            currency: 'CAD',
            date: 'MM/DD/YY',
            sandbox: false
          },
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farm',
          value: {
            farm_name: '',
            address: '',
            gridPoints: {},
            unit: 'metric',
            currency: 'CAD',
            date: 'MM/DD/YY',
            sandbox: false
          }
        },
        farm_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farm.farm_name',
          value: ''
        },
        address: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farm.address',
          value: ''
        },
        gridPoints: {
          $form: {
            initialValue: {},
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'profileForms.farm.gridPoints',
            value: {}
          }
        },
        unit: {
          initialValue: 'metric',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farm.unit',
          value: 'metric'
        },
        currency: {
          initialValue: 'CAD',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farm.currency',
          value: 'CAD'
        },
        date: {
          initialValue: 'MM/DD/YY',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farm.date',
          value: 'MM/DD/YY'
        },
        sandbox: {
          initialValue: false,
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farm.sandbox',
          value: false
        }
      },
      notification: {
        $form: {
          initialValue: {
            alert_pest: true,
            alert_weather: true,
            alert_worker_finish: true,
            alert_before_planned_date: true,
            alert_action_after_scouting: true
          },
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.notification',
          value: {
            alert_pest: true,
            alert_weather: true,
            alert_worker_finish: true,
            alert_before_planned_date: true,
            alert_action_after_scouting: true
          }
        },
        alert_pest: {
          initialValue: true,
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.notification.alert_pest',
          value: true
        },
        alert_weather: {
          initialValue: true,
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.notification.alert_weather',
          value: true
        },
        alert_worker_finish: {
          initialValue: true,
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.notification.alert_worker_finish',
          value: true
        },
        alert_before_planned_date: {
          initialValue: true,
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.notification.alert_before_planned_date',
          value: true
        },
        alert_action_after_scouting: {
          initialValue: true,
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.notification.alert_action_after_scouting',
          value: true
        }
      },
      userInfo: {
        $form: {
          initialValue: {
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            address: '',
            profile_picture: ''
          },
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.userInfo',
          value: {
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            address: '',
            profile_picture: ''
          }
        },
        first_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.userInfo.first_name',
          value: ''
        },
        last_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.userInfo.last_name',
          value: ''
        },
        email: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.userInfo.email',
          value: ''
        },
        phone_number: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.userInfo.phone_number',
          value: ''
        },
        address: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.userInfo.address',
          value: ''
        },
        profile_picture: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.userInfo.profile_picture',
          value: ''
        }
      },
      farmInfo: {
        $form: {
          initialValue: {
            farm_name: '',
            unit: 'metric',
            currency: 'CAD',
            date: 'MM/DD/YY',
            phone_number: '',
            phone_country: '',
            address: '',
            gridPoints: {}
          },
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farmInfo',
          value: {
            farm_name: '',
            unit: 'metric',
            currency: 'CAD',
            date: 'MM/DD/YY',
            phone_number: '',
            phone_country: '',
            address: '',
            gridPoints: {}
          }
        },
        farm_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farmInfo.farm_name',
          value: ''
        },
        unit: {
          initialValue: 'metric',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farmInfo.unit',
          value: 'metric'
        },
        currency: {
          initialValue: 'CAD',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farmInfo.currency',
          value: 'CAD'
        },
        date: {
          initialValue: 'MM/DD/YY',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farmInfo.date',
          value: 'MM/DD/YY'
        },
        phone_number: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farmInfo.phone_number',
          value: ''
        },
        phone_country: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farmInfo.phone_country',
          value: ''
        },
        address: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.farmInfo.address',
          value: ''
        },
        gridPoints: {
          $form: {
            initialValue: {},
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'profileForms.farmInfo.gridPoints',
            value: {}
          }
        }
      },
      editInfo: {
        $form: {
          initialValue: {
            first_name: '',
            last_name: '',
            email: '',
            role: 'Worker',
            pay: {
              type: 'hourly',
              amount: 0
            }
          },
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.editInfo',
          value: {
            first_name: '',
            last_name: '',
            email: '',
            role: 'Worker',
            pay: {
              type: 'hourly',
              amount: 0
            }
          }
        },
        first_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.editInfo.first_name',
          value: ''
        },
        last_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.editInfo.last_name',
          value: ''
        },
        email: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.editInfo.email',
          value: ''
        },
        role: {
          initialValue: 'Worker',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.editInfo.role',
          value: 'Worker'
        },
        pay: {
          $form: {
            initialValue: {
              type: 'hourly',
              amount: 0
            },
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'profileForms.editInfo.pay',
            value: {
              type: 'hourly',
              amount: 0
            }
          },
          type: {
            initialValue: 'hourly',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'profileForms.editInfo.pay.type',
            value: 'hourly'
          },
          amount: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'profileForms.editInfo.pay.amount',
            value: 0
          }
        }
      },
      signUpInfo: {
        $form: {
          initialValue: {
            first_name: '',
            last_name: '',
            email: '',
            password: ''
          },
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.signUpInfo',
          value: {
            first_name: '',
            last_name: '',
            email: '',
            password: ''
          }
        },
        first_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.signUpInfo.first_name',
          value: ''
        },
        last_name: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.signUpInfo.last_name',
          value: ''
        },
        email: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.signUpInfo.email',
          value: ''
        },
        password: {
          initialValue: '',
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'profileForms.signUpInfo.password',
          value: ''
        }
      }
    }
  },
  entitiesReducer: {
    loginReducer: {
      farm_id: '5763cdf4-2903-11eb-bf21-d5db06fc85bb',
      user_id: '5fb2fbe57a371e00696833a9'
    },
    userFarmReducer: {
      farmIdUserIdTuple: [
        {
          farm_id: '7dc9b8b4-285e-11eb-b999-abf6755cdebb',
          user_id: '5fb2fbe57a371e00696833a9'
        },
        {
          farm_id: '6920247e-285a-11eb-b999-abf6755cdebb',
          user_id: '5fb2fbe57a371e00696833a9'
        },
        {
          farm_id: '8c9b2c48-285d-11eb-b999-abf6755cdebb',
          user_id: '5fb2fbe57a371e00696833a9'
        },
        {
          farm_id: '52a3c704-28fb-11eb-bf21-d5db06fc85bb',
          user_id: '5fb2fbe57a371e00696833a9'
        },
        {
          farm_id: 'dd092ccc-28fb-11eb-bf21-d5db06fc85bb',
          user_id: '5fb2fbe57a371e00696833a9'
        },
        {
          farm_id: '3b67a638-285f-11eb-b999-abf6755cdebb',
          user_id: '5fb2fbe57a371e00696833a9'
        },
        {
          farm_id: '7dc091f2-285f-11eb-b999-abf6755cdebb',
          user_id: '5fb2fbe57a371e00696833a9'
        },
        {
          farm_id: 'a575e0fc-2860-11eb-b999-abf6755cdebb',
          user_id: '5fb2fbe57a371e00696833a9'
        },
        {
          farm_id: '5763cdf4-2903-11eb-bf21-d5db06fc85bb',
          user_id: '5fb2fbe57a371e00696833a9'
        }
      ],
      byFarmIdUserId: {
        '7dc9b8b4-285e-11eb-b999-abf6755cdebb': {
          '5fb2fbe57a371e00696833a9': {
            user_id: '5fb2fbe57a371e00696833a9',
            farm_id: '7dc9b8b4-285e-11eb-b999-abf6755cdebb',
            role_id: 5,
            has_consent: true,
            created_at: '2020-11-16T22:23:44.702Z',
            status: 'Active',
            consent_version: '3.0',
            wage: {
              type: 'hourly',
              amount: 0
            },
            step_one: true,
            step_one_end: '2020-11-16T22:53:06.741Z',
            step_two: true,
            step_two_end: '2020-11-19T18:04:11.981Z',
            step_three: true,
            step_three_end: '2020-11-19T18:04:14.586Z',
            step_four: true,
            step_four_end: '2020-11-19T18:04:18.693Z',
            step_five: true,
            step_five_end: '2020-11-19T18:04:19.484Z',
            role: 'Extension Officer',
            deleted: false,
            first_name: 'Rafael',
            last_name: 'Davis',
            profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
            email: 'f84039701@nwytg.net',
            phone_number: null,
            address: 'Queen Elizabeth Way, Hamilton, ON, Canada',
            notification_setting: {
              alert_pest: true,
              alert_weather: true,
              alert_worker_finish: true,
              alert_before_planned_date: true,
              alert_action_after_scouting: true
            },
            updated_at: '2020-11-16T22:23:44.702Z',
            farm_name: 'qwq',
            units: {
              currency: 'CAD',
              measurement: 'metric'
            },
            grid_points: {
              lat: 43.2335764,
              lng: -79.7053655
            },
            owner_name: '1 2'
          }
        },
        '6920247e-285a-11eb-b999-abf6755cdebb': {
          '5fb2fbe57a371e00696833a9': {
            user_id: '5fb2fbe57a371e00696833a9',
            farm_id: '6920247e-285a-11eb-b999-abf6755cdebb',
            role_id: 1,
            has_consent: null,
            created_at: '2020-11-16T22:23:44.702Z',
            status: 'Active',
            consent_version: '1.0',
            wage: {
              type: 'hourly',
              amount: 0
            },
            step_one: true,
            step_one_end: '2020-11-16T22:23:54.148Z',
            step_two: false,
            step_two_end: null,
            step_three: false,
            step_three_end: null,
            step_four: false,
            step_four_end: null,
            step_five: false,
            step_five_end: null,
            role: 'Owner',
            deleted: false,
            first_name: 'Rafael',
            last_name: 'Davis',
            profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
            email: 'f84039701@nwytg.net',
            phone_number: null,
            address: 'Epifanio de los Santos Ave, Mandaluyong, Metro Manila, Philippines',
            notification_setting: {
              alert_pest: true,
              alert_weather: true,
              alert_worker_finish: true,
              alert_before_planned_date: true,
              alert_action_after_scouting: true
            },
            updated_at: '2020-11-16T22:23:44.702Z',
            farm_name: 'ws',
            units: {
              currency: 'PHP',
              measurement: 'metric'
            },
            grid_points: {
              lat: 14.5832282,
              lng: 121.0547872
            },
            owner_name: 'Rafael Davis'
          }
        },
        '8c9b2c48-285d-11eb-b999-abf6755cdebb': {
          '5fb2fbe57a371e00696833a9': {
            user_id: '5fb2fbe57a371e00696833a9',
            farm_id: '8c9b2c48-285d-11eb-b999-abf6755cdebb',
            role_id: 1,
            has_consent: null,
            created_at: '2020-11-16T22:23:44.702Z',
            status: 'Active',
            consent_version: '1.0',
            wage: {
              type: 'hourly',
              amount: 0
            },
            step_one: true,
            step_one_end: '2020-11-16T22:46:22.114Z',
            step_two: false,
            step_two_end: null,
            step_three: false,
            step_three_end: null,
            step_four: false,
            step_four_end: null,
            step_five: false,
            step_five_end: null,
            role: 'Owner',
            deleted: false,
            first_name: 'Rafael',
            last_name: 'Davis',
            profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
            email: 'f84039701@nwytg.net',
            phone_number: null,
            address: 'Dweerblöcken, 22393 Hamburg, Germany',
            notification_setting: {
              alert_pest: true,
              alert_weather: true,
              alert_worker_finish: true,
              alert_before_planned_date: true,
              alert_action_after_scouting: true
            },
            updated_at: '2020-11-16T22:23:44.702Z',
            farm_name: '123',
            units: {
              currency: 'EUR',
              measurement: 'metric'
            },
            grid_points: {
              lat: 53.648181,
              lng: 10.1150728
            },
            owner_name: 'Rafael Davis'
          }
        },
        '52a3c704-28fb-11eb-bf21-d5db06fc85bb': {
          '5fb2fbe57a371e00696833a9': {
            user_id: '5fb2fbe57a371e00696833a9',
            farm_id: '52a3c704-28fb-11eb-bf21-d5db06fc85bb',
            role_id: 1,
            has_consent: null,
            created_at: '2020-11-16T22:23:44.702Z',
            status: 'Active',
            consent_version: '1.0',
            wage: {
              type: 'hourly',
              amount: 0
            },
            step_one: true,
            step_one_end: '2020-11-17T17:35:45.345Z',
            step_two: false,
            step_two_end: null,
            step_three: false,
            step_three_end: null,
            step_four: false,
            step_four_end: null,
            step_five: false,
            step_five_end: null,
            role: 'Owner',
            deleted: false,
            first_name: 'Rafael',
            last_name: 'Davis',
            profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
            email: 'f84039701@nwytg.net',
            phone_number: null,
            address: 'Robert F. Kennedy Bridge, The Bronx, NY, USA',
            notification_setting: {
              alert_pest: true,
              alert_weather: true,
              alert_worker_finish: true,
              alert_before_planned_date: true,
              alert_action_after_scouting: true
            },
            updated_at: '2020-11-16T22:23:44.702Z',
            farm_name: 'sdf',
            units: {
              currency: 'USD',
              measurement: 'imperial'
            },
            grid_points: {
              lat: 40.7949503,
              lng: -73.9220452
            },
            owner_name: 'Rafael Davis'
          }
        },
        'dd092ccc-28fb-11eb-bf21-d5db06fc85bb': {
          '5fb2fbe57a371e00696833a9': {
            user_id: '5fb2fbe57a371e00696833a9',
            farm_id: 'dd092ccc-28fb-11eb-bf21-d5db06fc85bb',
            role_id: 2,
            has_consent: true,
            created_at: '2020-11-16T22:23:44.702Z',
            status: 'Active',
            consent_version: '3.0',
            wage: {
              type: 'hourly',
              amount: 0
            },
            step_one: true,
            step_one_end: '2020-11-17T17:39:37.537Z',
            step_two: true,
            step_two_end: '2020-11-17T18:14:49.888Z',
            step_three: true,
            step_three_end: '2020-11-20T18:54:09.721Z',
            step_four: true,
            step_four_end: '2020-11-20T18:54:14.597Z',
            step_five: true,
            step_five_end: '2020-11-20T18:54:15.412Z',
            role: 'Manager',
            deleted: false,
            first_name: 'Rafael',
            last_name: 'Davis',
            profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
            email: 'f84039701@nwytg.net',
            phone_number: null,
            address: 'Wrocławska, 61-001 Poznań, Poland',
            notification_setting: {
              alert_pest: true,
              alert_weather: true,
              alert_worker_finish: true,
              alert_before_planned_date: true,
              alert_action_after_scouting: true
            },
            updated_at: '2020-11-16T22:23:44.702Z',
            farm_name: 'wef',
            units: {
              currency: 'PLN',
              measurement: 'metric'
            },
            grid_points: {
              lat: 52.4061056,
              lng: 16.9329438
            },
            owner_name: null
          }
        },
        '3b67a638-285f-11eb-b999-abf6755cdebb': {
          '5fb2fbe57a371e00696833a9': {
            user_id: '5fb2fbe57a371e00696833a9',
            farm_id: '3b67a638-285f-11eb-b999-abf6755cdebb',
            role_id: 1,
            has_consent: null,
            created_at: '2020-11-16T22:23:44.702Z',
            status: 'Active',
            consent_version: '1.0',
            wage: {
              type: 'hourly',
              amount: 0
            },
            step_one: true,
            step_one_end: '2020-11-16T22:58:24.865Z',
            step_two: false,
            step_two_end: null,
            step_three: false,
            step_three_end: null,
            step_four: false,
            step_four_end: null,
            step_five: false,
            step_five_end: null,
            role: 'Owner',
            deleted: false,
            first_name: 'Rafael',
            last_name: 'Davis',
            profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
            email: 'f84039701@nwytg.net',
            phone_number: null,
            address: 'QD-8, Muni Maya Ram Jain Marg, Block QD, Dakshini Pitampura, Pitampura, Delhi, 110034, India',
            notification_setting: {
              alert_pest: true,
              alert_weather: true,
              alert_worker_finish: true,
              alert_before_planned_date: true,
              alert_action_after_scouting: true
            },
            updated_at: '2020-11-16T22:23:44.702Z',
            farm_name: 'sddgsg',
            units: {
              currency: 'INR',
              measurement: 'metric'
            },
            grid_points: {
              lat: 28.6993428,
              lng: 77.1470987
            },
            owner_name: 'Rafael Davis'
          }
        },
        '7dc091f2-285f-11eb-b999-abf6755cdebb': {
          '5fb2fbe57a371e00696833a9': {
            user_id: '5fb2fbe57a371e00696833a9',
            farm_id: '7dc091f2-285f-11eb-b999-abf6755cdebb',
            role_id: 1,
            has_consent: true,
            created_at: '2020-11-16T22:23:44.702Z',
            status: 'Active',
            consent_version: '3.0',
            wage: {
              type: 'hourly',
              amount: 0
            },
            step_one: true,
            step_one_end: '2020-11-16T23:00:16.181Z',
            step_two: true,
            step_two_end: '2020-11-20T19:19:18.552Z',
            step_three: true,
            step_three_end: '2020-11-20T19:19:22.140Z',
            step_four: true,
            step_four_end: '2020-11-20T19:19:25.875Z',
            step_five: true,
            step_five_end: '2020-11-20T19:19:26.795Z',
            role: 'Owner',
            deleted: false,
            first_name: 'Rafael',
            last_name: 'Davis',
            profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
            email: 'f84039701@nwytg.net',
            phone_number: null,
            address: 'Dastan Chowkdi, Nava Naroda, Ahmedabad, Gujarat 380038, India',
            notification_setting: {
              alert_pest: true,
              alert_weather: true,
              alert_worker_finish: true,
              alert_before_planned_date: true,
              alert_action_after_scouting: true
            },
            updated_at: '2020-11-16T22:23:44.702Z',
            farm_name: 'asd',
            units: {
              currency: 'INR',
              measurement: 'metric'
            },
            grid_points: {
              lat: 23.0662333,
              lng: 72.689436
            },
            owner_name: 'Rafael Davis'
          }
        },
        'a575e0fc-2860-11eb-b999-abf6755cdebb': {
          '5fb2fbe57a371e00696833a9': {
            user_id: '5fb2fbe57a371e00696833a9',
            farm_id: 'a575e0fc-2860-11eb-b999-abf6755cdebb',
            role_id: 1,
            has_consent: null,
            created_at: '2020-11-16T22:23:44.702Z',
            status: 'Active',
            consent_version: '1.0',
            wage: {
              type: 'hourly',
              amount: 0
            },
            step_one: true,
            step_one_end: '2020-11-16T23:08:32.293Z',
            step_two: false,
            step_two_end: null,
            step_three: false,
            step_three_end: null,
            step_four: false,
            step_four_end: null,
            step_five: false,
            step_five_end: null,
            role: 'Owner',
            deleted: false,
            first_name: 'Rafael',
            last_name: 'Davis',
            profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
            email: 'f84039701@nwytg.net',
            phone_number: null,
            address: 'Edel Sauntes Allé, 2100 København, Denmark',
            notification_setting: {
              alert_pest: true,
              alert_weather: true,
              alert_worker_finish: true,
              alert_before_planned_date: true,
              alert_action_after_scouting: true
            },
            updated_at: '2020-11-16T22:23:44.702Z',
            farm_name: 'qwadaf',
            units: {
              currency: 'DKK',
              measurement: 'metric'
            },
            grid_points: {
              lat: 55.70136609999999,
              lng: 12.5643473
            },
            owner_name: 'Rafael Davis'
          }
        },
        '5763cdf4-2903-11eb-bf21-d5db06fc85bb': {
          '5fb2fbe57a371e00696833a9': {
            user_id: '5fb2fbe57a371e00696833a9',
            farm_id: '5763cdf4-2903-11eb-bf21-d5db06fc85bb',
            role_id: 2,
            has_consent: true,
            created_at: '2020-11-16T22:23:44.702Z',
            status: 'Active',
            consent_version: '3.0',
            wage: {
              type: 'hourly',
              amount: 0
            },
            step_one: true,
            step_one_end: '2020-11-17T18:33:09.284Z',
            step_two: true,
            step_two_end: '2020-11-17T18:33:54.319Z',
            step_three: true,
            step_three_end: '2020-11-17T19:14:53.372Z',
            step_four: true,
            step_four_end: '2020-11-20T19:40:58.038Z',
            step_five: true,
            step_five_end: '2020-11-20T19:40:58.813Z',
            role: 'Manager',
            deleted: false,
            first_name: 'Rafael',
            last_name: 'Davis',
            profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
            email: 'f84039701@nwytg.net',
            phone_number: null,
            address: 'Ass Hill, Wimborne BH21, UK',
            notification_setting: {
              alert_pest: true,
              alert_weather: true,
              alert_worker_finish: true,
              alert_before_planned_date: true,
              alert_action_after_scouting: true
            },
            updated_at: '2020-11-16T22:23:44.702Z',
            farm_name: 'das',
            units: {
              currency: 'GBP',
              measurement: 'metric'
            },
            grid_points: {
              lat: 50.8871511,
              lng: -1.9880366
            }
          }
        }
      },
      loading: false,
      error: null
    },
    certifierSurveyReducer: {
      ids: [
        'dd092ccc-28fb-11eb-bf21-d5db06fc85bb',
        '7dc091f2-285f-11eb-b999-abf6755cdebb',
        '5763cdf4-2903-11eb-bf21-d5db06fc85bb'
      ],
      entities: {
        'dd092ccc-28fb-11eb-bf21-d5db06fc85bb': {
          certifiers: [],
          interested: false,
          survey_id: 'c8cee02c-2b61-11eb-a304-6b04f62d88d1',
          farm_id: 'dd092ccc-28fb-11eb-bf21-d5db06fc85bb'
        },
        '7dc091f2-285f-11eb-b999-abf6755cdebb': {
          certifiers: [],
          interested: false,
          survey_id: '4d91fe2c-2b65-11eb-a304-6b04f62d88d1',
          farm_id: '7dc091f2-285f-11eb-b999-abf6755cdebb'
        },
        '5763cdf4-2903-11eb-bf21-d5db06fc85bb': {
          certifiers: [],
          interested: false,
          survey_id: '4fc0d03a-2b68-11eb-a304-6b04f62d88d1',
          farm_id: '5763cdf4-2903-11eb-bf21-d5db06fc85bb'
        }
      },
      loading: false,
      error: null
    },
    rolesReducer: {
      roles: [],
      loading: false
    }
  },
  baseReducer: {
    users: null,
    farm: {
      user_id: '5fb2fbe57a371e00696833a9',
      farm_id: '5763cdf4-2903-11eb-bf21-d5db06fc85bb',
      role_id: 2,
      has_consent: true,
      created_at: '2020-11-16T22:23:44.702Z',
      status: 'Active',
      consent_version: '3.0',
      wage: {
        type: 'hourly',
        amount: 0
      },
      step_one: true,
      step_one_end: '2020-11-17T18:33:09.284Z',
      step_two: true,
      step_two_end: '2020-11-17T18:33:54.319Z',
      step_three: true,
      step_three_end: '2020-11-17T19:14:53.372Z',
      step_four: false,
      step_four_end: null,
      step_five: false,
      step_five_end: null,
      role: 'Manager',
      deleted: false,
      first_name: 'Rafael',
      last_name: 'Davis',
      profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
      email: 'f84039701@nwytg.net',
      phone_number: null,
      address: 'Ass Hill, Wimborne BH21, UK',
      notification_setting: {
        alert_pest: true,
        alert_weather: true,
        alert_worker_finish: true,
        alert_before_planned_date: true,
        alert_action_after_scouting: true
      },
      updated_at: '2020-11-16T22:23:44.702Z',
      farm_name: 'das',
      units: {
        currency: 'GBP',
        measurement: 'metric'
      },
      grid_points: {
        lat: 50.8871511,
        lng: -1.9880366
      },
      owner_name: null
    },
    fields: [
      {
        field_id: 'da04b695-2e3a-4560-a0ab-cf474839a803',
        farm_id: '5763cdf4-2903-11eb-bf21-d5db06fc85bb',
        grid_points: [
          {
            lat: 50.89098179142557,
            lng: -1.9902038248840181
          },
          {
            lat: 50.88313056561407,
            lng: -1.9914912852111666
          },
          {
            lat: 50.88429479644519,
            lng: -1.9815778406921236
          }
        ],
        field_name: '1',
        area: 298387,
        station_id: 7290681,
        deleted: false
      }
    ],
    fieldCrops: [],
    consent_version: null,
    show_spotlight: false
  },
  logReducer: {
    forms: {
      fertLog: {
        fert_id: null,
        quantity_kg: 0,
        notes: '',
        moisture_percentage: 0,
        n_percentage: 0,
        nh4_n_ppm: 0,
        p_percentage: 0,
        k_percentage: 0,
        field: [
          {
            value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
            label: 'gf'
          }
        ]
      },
      fieldWorkLog: {
        type: {
          value: 'ridgeTill',
          label: 'Ridge Till'
        },
        notes: 'wsffftwrt',
        field: [
          {
            value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
            label: 'gf'
          }
        ]
      },
      harvestLog: {
        notes: '',
        field: null
      },
      irrigationLog: {
        activity_kind: 'irrigation',
        type: '',
        notes: '',
        flow_rate: null,
        unit: 'l/min',
        hours: null,
        field: null
      },
      otherLog: {
        notes: '',
        field: null
      },
      pestControlLog: {
        quantity: 0,
        notes: '',
        custom_pesticide_name: '',
        custom_disease_scientific_name: '',
        custom_disease_common_name: '',
        custom_disease_group: 'Other',
        pesticide_id: null,
        disease_id: 1,
        type: '',
        entry_interval: 0,
        harvest_interval: 0,
        active_ingredients: '',
        concentration: 0,
        field: null
      },
      scoutingLog: {
        activity_kind: 'scouting',
        type: '',
        notes: '',
        action_needed: false,
        field: null
      },
      seedLog: {
        space_length: null,
        space_width: null,
        space_unit: null,
        rate: null,
        rate_unit: null,
        field: null
      },
      soilDataLog: {},
      forms: {
        $form: {
          initialValue: {
            fertLog: {
              fert_id: null,
              quantity_kg: 0,
              notes: '',
              moisture_percentage: 0,
              n_percentage: 0,
              nh4_n_ppm: 0,
              p_percentage: 0,
              k_percentage: 0,
              field: null
            },
            fieldWorkLog: {
              type: null,
              notes: '',
              field: null
            },
            harvestLog: {
              notes: '',
              field: null
            },
            irrigationLog: {
              activity_kind: 'irrigation',
              type: '',
              notes: '',
              flow_rate: null,
              unit: 'l/min',
              hours: null,
              field: null
            },
            otherLog: {
              notes: '',
              field: null
            },
            pestControlLog: {
              quantity: 0,
              notes: '',
              custom_pesticide_name: '',
              custom_disease_scientific_name: '',
              custom_disease_common_name: '',
              custom_disease_group: 'Other',
              pesticide_id: null,
              disease_id: 1,
              type: '',
              entry_interval: 0,
              harvest_interval: 0,
              active_ingredients: '',
              concentration: 0,
              field: null
            },
            scoutingLog: {
              activity_kind: 'scouting',
              type: '',
              notes: '',
              action_needed: false,
              field: null
            },
            seedLog: {
              space_length: null,
              space_width: null,
              space_unit: null,
              rate: null,
              rate_unit: null,
              field: null
            },
            soilDataLog: {}
          },
          focus: false,
          pending: false,
          pristine: false,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: true,
          valid: true,
          validating: false,
          validated: false,
          validity: true,
          errors: false,
          intents: [],
          model: 'logReducer.forms',
          value: {
            fertLog: {
              fert_id: null,
              quantity_kg: 0,
              notes: '',
              moisture_percentage: 0,
              n_percentage: 0,
              nh4_n_ppm: 0,
              p_percentage: 0,
              k_percentage: 0,
              field: [
                {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                }
              ]
            },
            fieldWorkLog: {
              type: {
                value: 'ridgeTill',
                label: 'Ridge Till'
              },
              notes: '',
              field: [
                {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                }
              ]
            },
            harvestLog: {
              notes: '',
              field: null
            },
            irrigationLog: {
              activity_kind: 'irrigation',
              type: '',
              notes: '',
              flow_rate: null,
              unit: 'l/min',
              hours: null,
              field: null
            },
            otherLog: {
              notes: '',
              field: null
            },
            pestControlLog: {
              quantity: 0,
              notes: '',
              custom_pesticide_name: '',
              custom_disease_scientific_name: '',
              custom_disease_common_name: '',
              custom_disease_group: 'Other',
              pesticide_id: null,
              disease_id: 1,
              type: '',
              entry_interval: 0,
              harvest_interval: 0,
              active_ingredients: '',
              concentration: 0,
              field: null
            },
            scoutingLog: {
              activity_kind: 'scouting',
              type: '',
              notes: '',
              action_needed: false,
              field: null
            },
            seedLog: {
              space_length: null,
              space_width: null,
              space_unit: null,
              rate: null,
              rate_unit: null,
              field: null
            },
            soilDataLog: {}
          }
        },
        fertLog: {
          $form: {
            initialValue: {
              fert_id: null,
              quantity_kg: 0,
              notes: '',
              moisture_percentage: 0,
              n_percentage: 0,
              nh4_n_ppm: 0,
              p_percentage: 0,
              k_percentage: 0,
              field: null
            },
            focus: false,
            pending: false,
            pristine: false,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: false,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [
              {
                type: 'reset'
              }
            ],
            model: 'logReducer.forms.fertLog',
            value: {
              fert_id: null,
              quantity_kg: 0,
              notes: '',
              moisture_percentage: 0,
              n_percentage: 0,
              nh4_n_ppm: 0,
              p_percentage: 0,
              k_percentage: 0,
              field: [
                {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                }
              ]
            }
          },
          fert_id: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: true,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.fertLog.fert_id',
            value: null
          },
          quantity_kg: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: true,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.fertLog.quantity_kg',
            value: 0
          },
          notes: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [
              {
                type: 'reset'
              }
            ],
            model: 'logReducer.forms.fertLog.notes',
            value: ''
          },
          moisture_percentage: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [
              {
                type: 'reset'
              }
            ],
            model: 'logReducer.forms.fertLog.moisture_percentage',
            value: 0
          },
          n_percentage: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [
              {
                type: 'reset'
              }
            ],
            model: 'logReducer.forms.fertLog.n_percentage',
            value: 0
          },
          nh4_n_ppm: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [
              {
                type: 'reset'
              }
            ],
            model: 'logReducer.forms.fertLog.nh4_n_ppm',
            value: 0
          },
          p_percentage: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [
              {
                type: 'reset'
              }
            ],
            model: 'logReducer.forms.fertLog.p_percentage',
            value: 0
          },
          k_percentage: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [
              {
                type: 'reset'
              }
            ],
            model: 'logReducer.forms.fertLog.k_percentage',
            value: 0
          },
          field: {
            '0': {
              value: {
                initialValue: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                focus: false,
                pending: false,
                pristine: true,
                submitted: false,
                submitFailed: false,
                retouched: false,
                touched: false,
                valid: true,
                validating: false,
                validated: false,
                validity: {},
                errors: {},
                intents: [],
                model: 'logReducer.forms.fertLog.field.0.value',
                value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188'
              },
              label: {
                initialValue: 'gf',
                focus: false,
                pending: false,
                pristine: true,
                submitted: false,
                submitFailed: false,
                retouched: false,
                touched: false,
                valid: true,
                validating: false,
                validated: false,
                validity: {},
                errors: {},
                intents: [],
                model: 'logReducer.forms.fertLog.field.0.label',
                value: 'gf'
              },
              $form: {
                initialValue: {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                },
                focus: false,
                pending: false,
                pristine: false,
                submitted: false,
                submitFailed: false,
                retouched: false,
                touched: false,
                valid: true,
                validating: false,
                validated: false,
                validity: {},
                errors: {},
                intents: [],
                model: 'logReducer.forms.fertLog.field.0',
                value: {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                }
              }
            },
            $form: {
              focus: false,
              pending: false,
              pristine: false,
              submitted: false,
              submitFailed: false,
              touched: false,
              valid: true,
              validating: false,
              validated: false,
              validity: {},
              errors: {},
              intents: [],
              value: [
                {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                }
              ]
            }
          }
        },
        fieldWorkLog: {
          $form: {
            initialValue: {
              type: null,
              notes: '',
              field: null
            },
            focus: false,
            pending: false,
            pristine: false,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: true,
            valid: true,
            validating: false,
            validated: false,
            validity: true,
            errors: false,
            intents: [
              {
                type: 'reset'
              }
            ],
            model: 'logReducer.forms.fieldWorkLog',
            value: {
              type: {
                value: 'ridgeTill',
                label: 'Ridge Till'
              },
              notes: '',
              field: [
                {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                }
              ]
            }
          },
          type: {
            value: {
              initialValue: 'ridgeTill',
              focus: false,
              pending: false,
              pristine: true,
              submitted: false,
              submitFailed: false,
              retouched: false,
              touched: false,
              valid: true,
              validating: false,
              validated: false,
              validity: {},
              errors: {},
              intents: [],
              model: 'logReducer.forms.fieldWorkLog.type.value',
              value: 'ridgeTill'
            },
            label: {
              initialValue: 'Ridge Till',
              focus: false,
              pending: false,
              pristine: true,
              submitted: false,
              submitFailed: false,
              retouched: false,
              touched: false,
              valid: true,
              validating: false,
              validated: false,
              validity: {},
              errors: {},
              intents: [],
              model: 'logReducer.forms.fieldWorkLog.type.label',
              value: 'Ridge Till'
            },
            $form: {
              focus: false,
              pending: false,
              pristine: false,
              submitted: false,
              submitFailed: false,
              touched: false,
              valid: true,
              validating: false,
              validated: true,
              validity: {
                required: true
              },
              errors: {
                required: false
              },
              intents: [],
              value: {
                value: 'ridgeTill',
                label: 'Ridge Till'
              }
            }
          },
          notes: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: false,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: true,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.fieldWorkLog.notes',
            value: 'wsffftwrt'
          },
          field: {
            '0': {
              value: {
                initialValue: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                focus: false,
                pending: false,
                pristine: true,
                submitted: false,
                submitFailed: false,
                retouched: false,
                touched: false,
                valid: true,
                validating: false,
                validated: false,
                validity: {},
                errors: {},
                intents: [],
                model: 'logReducer.forms.fieldWorkLog.field.0.value',
                value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188'
              },
              label: {
                initialValue: 'gf',
                focus: false,
                pending: false,
                pristine: true,
                submitted: false,
                submitFailed: false,
                retouched: false,
                touched: false,
                valid: true,
                validating: false,
                validated: false,
                validity: {},
                errors: {},
                intents: [],
                model: 'logReducer.forms.fieldWorkLog.field.0.label',
                value: 'gf'
              },
              $form: {
                initialValue: {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                },
                focus: false,
                pending: false,
                pristine: false,
                submitted: false,
                submitFailed: false,
                retouched: false,
                touched: false,
                valid: true,
                validating: false,
                validated: false,
                validity: {},
                errors: {},
                intents: [
                  {
                    type: 'validate'
                  }
                ],
                model: 'logReducer.forms.fieldWorkLog.field.0',
                value: {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                }
              }
            },
            $form: {
              focus: false,
              pending: false,
              pristine: false,
              submitted: false,
              submitFailed: false,
              touched: false,
              valid: true,
              validating: false,
              validated: true,
              validity: {
                required: true
              },
              errors: {
                required: false
              },
              intents: [],
              value: [
                {
                  value: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
                  label: 'gf'
                }
              ]
            }
          }
        },
        harvestLog: {
          $form: {
            initialValue: {
              notes: '',
              field: null
            },
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.harvestLog',
            value: {
              notes: '',
              field: null
            }
          },
          notes: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.harvestLog.notes',
            value: ''
          },
          field: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.harvestLog.field',
            value: null
          }
        },
        irrigationLog: {
          $form: {
            initialValue: {
              activity_kind: 'irrigation',
              type: '',
              notes: '',
              flow_rate: null,
              unit: 'l/min',
              hours: null,
              field: null
            },
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.irrigationLog',
            value: {
              activity_kind: 'irrigation',
              type: '',
              notes: '',
              flow_rate: null,
              unit: 'l/min',
              hours: null,
              field: null
            }
          },
          activity_kind: {
            initialValue: 'irrigation',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.irrigationLog.activity_kind',
            value: 'irrigation'
          },
          type: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.irrigationLog.type',
            value: ''
          },
          notes: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.irrigationLog.notes',
            value: ''
          },
          flow_rate: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.irrigationLog.flow_rate',
            value: null
          },
          unit: {
            initialValue: 'l/min',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.irrigationLog.unit',
            value: 'l/min'
          },
          hours: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.irrigationLog.hours',
            value: null
          },
          field: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.irrigationLog.field',
            value: null
          }
        },
        otherLog: {
          $form: {
            initialValue: {
              notes: '',
              field: null
            },
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.otherLog',
            value: {
              notes: '',
              field: null
            }
          },
          notes: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.otherLog.notes',
            value: ''
          },
          field: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.otherLog.field',
            value: null
          }
        },
        pestControlLog: {
          $form: {
            initialValue: {
              quantity: 0,
              notes: '',
              custom_pesticide_name: '',
              custom_disease_scientific_name: '',
              custom_disease_common_name: '',
              custom_disease_group: 'Other',
              pesticide_id: null,
              disease_id: 1,
              type: '',
              entry_interval: 0,
              harvest_interval: 0,
              active_ingredients: '',
              concentration: 0,
              field: null
            },
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog',
            value: {
              quantity: 0,
              notes: '',
              custom_pesticide_name: '',
              custom_disease_scientific_name: '',
              custom_disease_common_name: '',
              custom_disease_group: 'Other',
              pesticide_id: null,
              disease_id: 1,
              type: '',
              entry_interval: 0,
              harvest_interval: 0,
              active_ingredients: '',
              concentration: 0,
              field: null
            }
          },
          quantity: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.quantity',
            value: 0
          },
          notes: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.notes',
            value: ''
          },
          custom_pesticide_name: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.custom_pesticide_name',
            value: ''
          },
          custom_disease_scientific_name: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.custom_disease_scientific_name',
            value: ''
          },
          custom_disease_common_name: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.custom_disease_common_name',
            value: ''
          },
          custom_disease_group: {
            initialValue: 'Other',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.custom_disease_group',
            value: 'Other'
          },
          pesticide_id: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.pesticide_id',
            value: null
          },
          disease_id: {
            initialValue: 1,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.disease_id',
            value: 1
          },
          type: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.type',
            value: ''
          },
          entry_interval: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.entry_interval',
            value: 0
          },
          harvest_interval: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.harvest_interval',
            value: 0
          },
          active_ingredients: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.active_ingredients',
            value: ''
          },
          concentration: {
            initialValue: 0,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.concentration',
            value: 0
          },
          field: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.pestControlLog.field',
            value: null
          }
        },
        scoutingLog: {
          $form: {
            initialValue: {
              activity_kind: 'scouting',
              type: '',
              notes: '',
              action_needed: false,
              field: null
            },
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.scoutingLog',
            value: {
              activity_kind: 'scouting',
              type: '',
              notes: '',
              action_needed: false,
              field: null
            }
          },
          activity_kind: {
            initialValue: 'scouting',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.scoutingLog.activity_kind',
            value: 'scouting'
          },
          type: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.scoutingLog.type',
            value: ''
          },
          notes: {
            initialValue: '',
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.scoutingLog.notes',
            value: ''
          },
          action_needed: {
            initialValue: false,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.scoutingLog.action_needed',
            value: false
          },
          field: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.scoutingLog.field',
            value: null
          }
        },
        seedLog: {
          $form: {
            initialValue: {
              space_length: null,
              space_width: null,
              space_unit: null,
              rate: null,
              rate_unit: null,
              field: null
            },
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.seedLog',
            value: {
              space_length: null,
              space_width: null,
              space_unit: null,
              rate: null,
              rate_unit: null,
              field: null
            }
          },
          space_length: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.seedLog.space_length',
            value: null
          },
          space_width: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.seedLog.space_width',
            value: null
          },
          space_unit: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.seedLog.space_unit',
            value: null
          },
          rate: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.seedLog.rate',
            value: null
          },
          rate_unit: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.seedLog.rate_unit',
            value: null
          },
          field: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.seedLog.field',
            value: null
          }
        },
        soilDataLog: {
          $form: {
            initialValue: {},
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'logReducer.forms.soilDataLog',
            value: {}
          }
        }
      }
    },
    logReducer: {
      logs: [
        {
          first_name: 'Rafael',
          last_name: 'Davis',
          activity_id: 79,
          activity_kind: 'fieldWork',
          date: '2020-11-20T19:02:28.516Z',
          user_id: '5fb2fbe57a371e00696833a9',
          notes: 'wsffftwrt',
          action_needed: false,
          photo: null,
          fieldCrop: [],
          field: [
            {
              field_id: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
              farm_id: 'dd092ccc-28fb-11eb-bf21-d5db06fc85bb',
              grid_points: [
                {
                  lat: 52.41231005264721,
                  lng: 16.932557561901863
                },
                {
                  lat: 52.40804294896428,
                  lng: 16.931141355542
                },
                {
                  lat: 52.40702192430392,
                  lng: 16.940797307995613
                }
              ],
              field_name: 'gf',
              area: 161205,
              station_id: 3088171,
              deleted: false
            }
          ],
          fieldWorkLog: {
            activity_id: 79,
            type: 'ridgeTill'
          }
        }
      ],
      selectedLog: {
        first_name: 'Rafael',
        last_name: 'Davis',
        activity_id: 79,
        activity_kind: 'fieldWork',
        date: '2020-11-20T19:02:28.516Z',
        user_id: '5fb2fbe57a371e00696833a9',
        notes: 'wsffft',
        action_needed: false,
        photo: null,
        fieldCrop: [],
        field: [
          {
            field_id: 'af0a6a6b-b814-4018-a2a9-c8da93ff1188',
            farm_id: 'dd092ccc-28fb-11eb-bf21-d5db06fc85bb',
            grid_points: [
              {
                lat: 52.41231005264721,
                lng: 16.932557561901863
              },
              {
                lat: 52.40804294896428,
                lng: 16.931141355542
              },
              {
                lat: 52.40702192430392,
                lng: 16.940797307995613
              }
            ],
            field_name: 'gf',
            area: 161205,
            station_id: 3088171,
            deleted: false
          }
        ],
        fieldWorkLog: {
          activity_id: 79,
          type: 'ridgeTill'
        }
      }
    },
    fertReducer: {
      fertilizers: [
        {
          fertilizer_id: 1,
          fertilizer_type: 'compost (manure)',
          moisture_percentage: 40,
          n_percentage: 1.5,
          nh4_n_ppm: 0,
          p_percentage: 0.5,
          k_percentage: 0.5,
          farm_id: null,
          mineralization_rate: 0.1,
          deleted: false
        },
        {
          fertilizer_id: 2,
          fertilizer_type: 'compost (HIP)',
          moisture_percentage: 0,
          n_percentage: 2.2,
          nh4_n_ppm: 0,
          p_percentage: 0.9,
          k_percentage: 0.8,
          farm_id: null,
          mineralization_rate: 0.1,
          deleted: false
        },
        {
          fertilizer_id: 3,
          fertilizer_type: 'Beef-feedlot- solid (dry)',
          moisture_percentage: 72,
          n_percentage: 0.42,
          nh4_n_ppm: 44,
          p_percentage: 0.13,
          k_percentage: 0.67,
          farm_id: null,
          mineralization_rate: 0.3,
          deleted: false
        },
        {
          fertilizer_id: 4,
          fertilizer_type: 'Beef-feedlot- solid (moist)',
          moisture_percentage: 77,
          n_percentage: 0.68,
          nh4_n_ppm: 368,
          p_percentage: 0.15,
          k_percentage: 0.3,
          farm_id: null,
          mineralization_rate: 0.3,
          deleted: false
        },
        {
          fertilizer_id: 5,
          fertilizer_type: 'Beef- liquid',
          moisture_percentage: 86,
          n_percentage: 0.28,
          nh4_n_ppm: 77,
          p_percentage: 0.09,
          k_percentage: 0.19,
          farm_id: null,
          mineralization_rate: 0.3,
          deleted: false
        },
        {
          fertilizer_id: 6,
          fertilizer_type: 'Chicken-broiler (general)',
          moisture_percentage: 50,
          n_percentage: 2.26,
          nh4_n_ppm: 3423,
          p_percentage: 0.91,
          k_percentage: 1.14,
          farm_id: null,
          mineralization_rate: 0.55,
          deleted: false
        },
        {
          fertilizer_id: 7,
          fertilizer_type: 'Chicken-broiler (manure aged outdoors)',
          moisture_percentage: 70,
          n_percentage: 1.91,
          nh4_n_ppm: 3095,
          p_percentage: 0.8,
          k_percentage: 1.14,
          farm_id: null,
          mineralization_rate: 0.55,
          deleted: false
        },
        {
          fertilizer_id: 8,
          fertilizer_type: 'Chicken-broiler (manure fresh from barn)',
          moisture_percentage: 25,
          n_percentage: 2.97,
          nh4_n_ppm: 4078,
          p_percentage: 1.05,
          k_percentage: 1.04,
          farm_id: null,
          mineralization_rate: 0.55,
          deleted: false
        },
        {
          fertilizer_id: 9,
          fertilizer_type: 'Chicken-broiler breeder',
          moisture_percentage: 46,
          n_percentage: 1.25,
          nh4_n_ppm: 3096,
          p_percentage: 0.84,
          k_percentage: 1.71,
          farm_id: null,
          mineralization_rate: 0.55,
          deleted: false
        },
        {
          fertilizer_id: 10,
          fertilizer_type: 'Chicken-layer',
          moisture_percentage: 50,
          n_percentage: 2.26,
          nh4_n_ppm: 3889,
          p_percentage: 1.13,
          k_percentage: 1.51,
          farm_id: null,
          mineralization_rate: 0.55,
          deleted: false
        },
        {
          fertilizer_id: 11,
          fertilizer_type: 'Dairy- solid (dry)',
          moisture_percentage: 72,
          n_percentage: 0.76,
          nh4_n_ppm: 317,
          p_percentage: 0.2,
          k_percentage: 0.43,
          farm_id: null,
          mineralization_rate: 0.21,
          deleted: false
        },
        {
          fertilizer_id: 12,
          fertilizer_type: 'Dairy- solid (moist)',
          moisture_percentage: 77,
          n_percentage: 0.39,
          nh4_n_ppm: 797,
          p_percentage: 0.1,
          k_percentage: 0.3,
          farm_id: null,
          mineralization_rate: 0.21,
          deleted: false
        },
        {
          fertilizer_id: 13,
          fertilizer_type: 'Dairy- liquid (thick slurry)',
          moisture_percentage: 86,
          n_percentage: 0.4,
          nh4_n_ppm: 1760,
          p_percentage: 0.08,
          k_percentage: 0.3,
          farm_id: null,
          mineralization_rate: 0.21,
          deleted: false
        },
        {
          fertilizer_id: 14,
          fertilizer_type: 'Dairy- liquid (medium slurry)',
          moisture_percentage: 93.5,
          n_percentage: 0.28,
          nh4_n_ppm: 1450,
          p_percentage: 0.06,
          k_percentage: 0.25,
          farm_id: null,
          mineralization_rate: 0.21,
          deleted: false
        },
        {
          fertilizer_id: 15,
          fertilizer_type: 'Dairy- liquid (quite watery)',
          moisture_percentage: 96.5,
          n_percentage: 0.2,
          nh4_n_ppm: 1110,
          p_percentage: 0.04,
          k_percentage: 0.16,
          farm_id: null,
          mineralization_rate: 0.21,
          deleted: false
        },
        {
          fertilizer_id: 16,
          fertilizer_type: 'Dairy- liquid (very watery)',
          moisture_percentage: 98.5,
          n_percentage: 0.13,
          nh4_n_ppm: 730,
          p_percentage: 0.02,
          k_percentage: 0.12,
          farm_id: null,
          mineralization_rate: 0.21,
          deleted: false
        },
        {
          fertilizer_id: 17,
          fertilizer_type: 'Goat (dairy)',
          moisture_percentage: 65,
          n_percentage: 1.04,
          nh4_n_ppm: 2818,
          p_percentage: 0.28,
          k_percentage: 1.03,
          farm_id: null,
          mineralization_rate: 0.21,
          deleted: false
        },
        {
          fertilizer_id: 18,
          fertilizer_type: 'Hog- liquid',
          moisture_percentage: 82,
          n_percentage: 0.33,
          nh4_n_ppm: 2211,
          p_percentage: 0.1,
          k_percentage: 0.15,
          farm_id: null,
          mineralization_rate: 0.4,
          deleted: false
        },
        {
          fertilizer_id: 19,
          fertilizer_type: 'Hog- solid',
          moisture_percentage: 82,
          n_percentage: 0.86,
          nh4_n_ppm: 525,
          p_percentage: 0.42,
          k_percentage: 0.5,
          farm_id: null,
          mineralization_rate: 0.4,
          deleted: false
        },
        {
          fertilizer_id: 20,
          fertilizer_type: 'Horse',
          moisture_percentage: 83,
          n_percentage: 0.32,
          nh4_n_ppm: 268,
          p_percentage: 0.09,
          k_percentage: 0.25,
          farm_id: null,
          mineralization_rate: 0.2,
          deleted: false
        },
        {
          fertilizer_id: 21,
          fertilizer_type: 'Mink',
          moisture_percentage: 54,
          n_percentage: 3.28,
          nh4_n_ppm: 14151,
          p_percentage: 1.82,
          k_percentage: 0.79,
          farm_id: null,
          mineralization_rate: 0.2,
          deleted: false
        },
        {
          fertilizer_id: 22,
          fertilizer_type: 'Sheep',
          moisture_percentage: 68,
          n_percentage: 0.87,
          nh4_n_ppm: 2784,
          p_percentage: 0.34,
          k_percentage: 0.76,
          farm_id: null,
          mineralization_rate: 0.2,
          deleted: false
        },
        {
          fertilizer_id: 23,
          fertilizer_type: 'Turkey (manure aged >7 weeks out of barn)',
          moisture_percentage: 70,
          n_percentage: 0.87,
          nh4_n_ppm: 1281,
          p_percentage: 0.44,
          k_percentage: 0.59,
          farm_id: null,
          mineralization_rate: 0.55,
          deleted: false
        },
        {
          fertilizer_id: 24,
          fertilizer_type: 'Turkey (manure fresh from barn <7 weeks)',
          moisture_percentage: 33,
          n_percentage: 1.79,
          nh4_n_ppm: 2518,
          p_percentage: 0.79,
          k_percentage: 1.31,
          farm_id: null,
          mineralization_rate: 0.55,
          deleted: false
        },
        {
          fertilizer_id: 25,
          fertilizer_type: 'Biosolids- anaerobically digested & dewatered',
          moisture_percentage: 70,
          n_percentage: 1.47,
          nh4_n_ppm: 2940,
          p_percentage: 0.9,
          k_percentage: 0.03,
          farm_id: null,
          mineralization_rate: 0.18,
          deleted: false
        }
      ]
    },
    pestControlReducer: {
      pesticides: [
        {
          pesticide_id: 1,
          pesticide_name: 'Roundup',
          entry_interval: 0.5,
          harvest_interval: 14,
          active_ingredients: 'glyphosate',
          concentration: 50.2,
          farm_id: null,
          deleted: false
        }
      ],
      diseases: [
        {
          disease_id: 1,
          disease_scientific_name: 'Pectobacterium carotovorum subsp. carotovorum',
          disease_common_name: 'Bacterial Soft Rot of Pepper',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 2,
          disease_scientific_name: 'Xanthomonas axonopodis pv. mangiferaeindicae',
          disease_common_name: 'Bacterial Black Spot of Mango',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 3,
          disease_scientific_name: 'Xanthomonas oryzae pv. oryzae',
          disease_common_name: 'Bacterial Blight of Rice',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 4,
          disease_scientific_name: 'Pseudomonas syringae',
          disease_common_name: 'Angular Leaf Spot Disease',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 5,
          disease_scientific_name: 'Xanthomonas oryzae pv. oryzicola',
          disease_common_name: 'Bacterial Leaf Streak',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 6,
          disease_scientific_name: 'Xanthomonas spp.',
          disease_common_name: 'Bacterial Spot',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 7,
          disease_scientific_name: 'Xanthomonas citri pv. mangiferaeindicae',
          disease_common_name: 'Bacterial Canker of Mango',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 8,
          disease_scientific_name: 'Pseudomonas savastanoi pv. phaseolicola',
          disease_common_name: 'Halo Blight',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 9,
          disease_scientific_name: 'Erwinia amylovora',
          disease_common_name: 'Fire Blight',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 10,
          disease_scientific_name: 'Xanthomonas campestris pv. campestris',
          disease_common_name: 'Black Rot',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 11,
          disease_scientific_name: 'Xanthomonas fragariae',
          disease_common_name: 'Angular Leaf Spot of Strawberry',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 12,
          disease_scientific_name: 'Pseudomonas syringae pv. syringae',
          disease_common_name: 'Bacterial Canker',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 13,
          disease_scientific_name: 'Streptomyces scabies',
          disease_common_name: 'Potato Scab',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 14,
          disease_scientific_name: 'Pseudomonas syringae pv. syringae',
          disease_common_name: 'Blast of Citrus',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 15,
          disease_scientific_name: 'Phytoplasma prunorum',
          disease_common_name: 'Chlorotic Leaf Roll of Apricot',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 16,
          disease_scientific_name: 'Leifsonia xyli',
          disease_common_name: 'Sugarcane Ratoon Stunting Disease',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 17,
          disease_scientific_name: 'Pseudomonas syringae pv. syringae',
          disease_common_name: 'Holcus Spot',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 18,
          disease_scientific_name: 'Pectobacterium atrosepticum',
          disease_common_name: 'Blackleg',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 19,
          disease_scientific_name: 'Ralstonia solanacearum',
          disease_common_name: 'Bacterial Wilt',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 20,
          disease_scientific_name: 'Acidovorax avenae',
          disease_common_name: 'Bacterial Leaf Blight of Sugarcane',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 21,
          disease_scientific_name: 'Spiroplasma citri',
          disease_common_name: 'Citrus Stubborn Disease',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 22,
          disease_scientific_name: 'Xanthomonas citri subsp. malvacearum',
          disease_common_name: 'Bacterial Blight of Cotton',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 23,
          disease_scientific_name: 'Xanthomonas axonopodis pv. citri',
          disease_common_name: 'Citrus Canker',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 24,
          disease_scientific_name: 'Xanthomonas musacearum',
          disease_common_name: 'Banana Xanthomonas Wilt',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 25,
          disease_scientific_name: 'Xanthomonas arboricola',
          disease_common_name: 'Bacterial Spot on Stone Fruits',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 26,
          disease_scientific_name: 'Xanthomonas alfalfae',
          disease_common_name: 'Bacterial Spot of Citrus',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 27,
          disease_scientific_name: 'Pectobacterium carotovorum',
          disease_common_name: 'Bacterial Soft Rot of Banana',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 28,
          disease_scientific_name: 'Xylella fastidiosa',
          disease_common_name: 'Phony Peach Disease',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 29,
          disease_scientific_name: 'Acidovorax citrulli',
          disease_common_name: 'Bacterial Fruit Blotch',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 30,
          disease_scientific_name: 'Clavibacter michiganensis subs. michiganensis',
          disease_common_name: 'Bacterial Canker of Tomato',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 31,
          disease_scientific_name: 'Pseudomonas syringae pv. tomato',
          disease_common_name: 'Bacterial Speck of Tomato',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 32,
          disease_scientific_name: 'Burkholderia spp.',
          disease_common_name: 'Bacterial Panicle Blight',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 33,
          disease_scientific_name: 'Agrobacterium',
          disease_common_name: 'Crown Gall',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 34,
          disease_scientific_name: 'Ralstonia solanacearum',
          disease_common_name: 'Moko Disease',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 35,
          disease_scientific_name: 'Phytoplasma spp.',
          disease_common_name: 'Cassava Phytoplasma Disease',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 36,
          disease_scientific_name: 'Clavibacter michiganensis',
          disease_common_name: 'Goss\'s Wilt',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 37,
          disease_scientific_name: 'Xylella fastidiosa subsp. pauca',
          disease_common_name: 'Citrus Variegated Chlorosis',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 38,
          disease_scientific_name: 'Candidatus Liberibacter',
          disease_common_name: 'Citrus Greening Disease',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 39,
          disease_scientific_name: 'Erwinia chrysanthemi',
          disease_common_name: 'Bacterial Stalk Rot of Maize',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 40,
          disease_scientific_name: 'Pseudomonas savastanoi pv. savastanoi',
          disease_common_name: 'Olive Knot',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 41,
          disease_scientific_name: 'Xanthomonas axonopodis',
          disease_common_name: 'Bacterial Pustule',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 42,
          disease_scientific_name: 'Xanthomonas phaseoli',
          disease_common_name: 'Bacterial Leaf Blight',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 43,
          disease_scientific_name: 'Xanthomonas axonopodis pv. manihotis',
          disease_common_name: 'Cassava Bacterial Blight',
          disease_group: 'Bacteria',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 44,
          disease_scientific_name: 'Phytophthora infestans',
          disease_common_name: 'Tomato Late Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 45,
          disease_scientific_name: 'Oidium mangiferae',
          disease_common_name: 'Powdery Mildew of Mango',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 46,
          disease_scientific_name: 'Mycosphaerella spp.',
          disease_common_name: 'Late and Early Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 47,
          disease_scientific_name: 'Puccinia arachidis',
          disease_common_name: 'Peanut Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 48,
          disease_scientific_name: 'Colletotrichum truncatum',
          disease_common_name: 'Anthracnose of Soybean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 49,
          disease_scientific_name: 'Elsinoe fawcettii',
          disease_common_name: 'Citrus Scab',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 50,
          disease_scientific_name: 'Puccinia sorghi',
          disease_common_name: 'Common Rust of Maize',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 51,
          disease_scientific_name: 'Cochliobolus miyabeanus',
          disease_common_name: 'Brown Spot of Rice',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 52,
          disease_scientific_name: 'Taphrina deformans',
          disease_common_name: 'Peach Leaf Curl',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 53,
          disease_scientific_name: 'Mycosphaerella musicola',
          disease_common_name: 'Yellow  Sigatoka',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 54,
          disease_scientific_name: 'Phytophthora capsici',
          disease_common_name: 'Blight of Pepper',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 55,
          disease_scientific_name: 'Sarocladium oryzae',
          disease_common_name: 'Sheath Rot of Rice',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 56,
          disease_scientific_name: 'Setosphaeria turcica',
          disease_common_name: 'Turcicum Leaf Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 57,
          disease_scientific_name: 'Uromyces appendiculatus',
          disease_common_name: 'Bean Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 58,
          disease_scientific_name: 'Blumeriella jaapii',
          disease_common_name: 'Cherry Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 59,
          disease_scientific_name: 'Cercospora zeae-maydis',
          disease_common_name: 'Corn Grey Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 60,
          disease_scientific_name: 'Alternaria solani',
          disease_common_name: 'Early Blight of Potato',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 61,
          disease_scientific_name: 'Colletotrichum gloeosporioides',
          disease_common_name: 'Anthracnose of Citrus',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 62,
          disease_scientific_name: 'Colletotrichum graminicola',
          disease_common_name: 'Anthracnose Leaf Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 63,
          disease_scientific_name: 'Mycosphaerella fijiensis',
          disease_common_name: 'Black Sigatoka',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 64,
          disease_scientific_name: 'Villosiclava virens',
          disease_common_name: 'False Smut',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 65,
          disease_scientific_name: 'Colletotrichum gloeosporioides',
          disease_common_name: 'Anthracnose of Papaya and Mango',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 66,
          disease_scientific_name: 'Asperisporium caricae',
          disease_common_name: 'Black Spot Disease of Papaya',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 67,
          disease_scientific_name: 'Colletotrichum musae',
          disease_common_name: 'Anthracnose of Banana',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 68,
          disease_scientific_name: 'Phaeosphaeria maydis',
          disease_common_name: 'Phaeosphaeria Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 69,
          disease_scientific_name: 'Alternaria alternata',
          disease_common_name: 'Alternaria Brown Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 70,
          disease_scientific_name: 'Alternaria solani',
          disease_common_name: 'Early Blight of Tomato',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 71,
          disease_scientific_name: 'Erysiphaceae',
          disease_common_name: 'Powdery Mildew',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 72,
          disease_scientific_name: 'Venturia carpophila',
          disease_common_name: 'Peach Scab',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 73,
          disease_scientific_name: 'Cercospora sojina',
          disease_common_name: 'Frogeye Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 74,
          disease_scientific_name: 'Phakopsora pachyrhizi',
          disease_common_name: 'Rust of Soybean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 75,
          disease_scientific_name: 'Venturia inaequalis',
          disease_common_name: 'Apple Scab',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 76,
          disease_scientific_name: 'Corynespora cassiicola',
          disease_common_name: 'Target Spot of Soybean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 77,
          disease_scientific_name: 'Kabatiella zeae',
          disease_common_name: 'Eyespot of Corn',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 78,
          disease_scientific_name: 'Uromyces phaseoli',
          disease_common_name: 'Rust on Blackgram',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 79,
          disease_scientific_name: 'Monographella albescens',
          disease_common_name: 'Leaf Scald of Rice',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 80,
          disease_scientific_name: 'Athelia rolfsii',
          disease_common_name: 'Stem rot of Peanut',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 81,
          disease_scientific_name: 'Rhizoctonia solani',
          disease_common_name: 'Rice Sheath Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 82,
          disease_scientific_name: 'Ustilago maydis',
          disease_common_name: 'Maize Smut',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 83,
          disease_scientific_name: 'Verticillium spp.',
          disease_common_name: 'Verticillium Wilt',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 84,
          disease_scientific_name: 'Magnaporthe oryzae',
          disease_common_name: 'Blast of Rice',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 85,
          disease_scientific_name: 'Glomerella cingulata',
          disease_common_name: 'Anthracnose of Pepper',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 86,
          disease_scientific_name: 'Capnodium, Fumago, Scorias spp',
          disease_common_name: 'Sooty Mold',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 87,
          disease_scientific_name: 'Cercospora canescens',
          disease_common_name: 'Cercospora Leaf Spot of Gram',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 88,
          disease_scientific_name: 'Phyllosticta arachidis-hypogaea',
          disease_common_name: 'Phyllosticta Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 89,
          disease_scientific_name: 'Peronosporales',
          disease_common_name: 'Downy Mildew',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 90,
          disease_scientific_name: 'Phytophthora cactorum',
          disease_common_name: 'Phytophthora Root Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 91,
          disease_scientific_name: 'Phytophthora cactorum',
          disease_common_name: 'Crown Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 92,
          disease_scientific_name: 'Erysiphe diffusa',
          disease_common_name: 'Powdery Mildew of Soybean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 93,
          disease_scientific_name: 'Phomopsis viticola',
          disease_common_name: 'Phomopsis Cane and Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 94,
          disease_scientific_name: 'Parastagonospora nodorum',
          disease_common_name: 'Leaf and Glume Blotch of Wheat',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 95,
          disease_scientific_name: 'Mycovellosiella fulva',
          disease_common_name: 'Leaf Mold of Tomato',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 96,
          disease_scientific_name: 'Fusarium oxysporum',
          disease_common_name: 'Fusarium Wilt',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 97,
          disease_scientific_name: 'Ascochyta sorghi',
          disease_common_name: 'Rough Leaf Spot Of Sorghum',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 98,
          disease_scientific_name: 'Macrophomina phaseolina',
          disease_common_name: 'Root Rot of Cotton',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 99,
          disease_scientific_name: 'Sphacelotheca reiliana',
          disease_common_name: 'Head Smut',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 100,
          disease_scientific_name: 'Fusicladium oleagineum',
          disease_common_name: 'Olive Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 101,
          disease_scientific_name: 'Colletotrichum acutatum',
          disease_common_name: 'Anthracnose of Almond',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 102,
          disease_scientific_name: 'Mycosphaerella gossypina',
          disease_common_name: 'Cercospora Leaf Spot of Cotton',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 103,
          disease_scientific_name: 'Tilletia caries',
          disease_common_name: 'Common Bunt of Wheat',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 104,
          disease_scientific_name: 'Phyllosticta maculata',
          disease_common_name: 'Freckle of Banana',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 105,
          disease_scientific_name: 'Cercospora penniseti',
          disease_common_name: 'Millet Cercospora Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 106,
          disease_scientific_name: 'Pyrenophora tritici-repentis',
          disease_common_name: 'Tan Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 107,
          disease_scientific_name: 'Puccinia striiformis',
          disease_common_name: 'Yellow Stripe Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 108,
          disease_scientific_name: 'Gymnosporangium sabinae',
          disease_common_name: 'European Pear Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 109,
          disease_scientific_name: 'Puccinia porri',
          disease_common_name: 'Leek Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 110,
          disease_scientific_name: 'Magnaporthe salvinii',
          disease_common_name: 'Stem Rot of RIce',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 111,
          disease_scientific_name: 'Botrytis fabae',
          disease_common_name: 'Chocolate Spot of Broad Bean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 112,
          disease_scientific_name: 'Diaporthe phaseolorum var. caulivora',
          disease_common_name: 'Northern Stem Canker',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 113,
          disease_scientific_name: 'Fusarium virguliforme',
          disease_common_name: 'Sudden Death Syndrome',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 114,
          disease_scientific_name: 'Monilinia fructicola',
          disease_common_name: 'Blossom Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 115,
          disease_scientific_name: 'Mycosphaerella angulata',
          disease_common_name: 'Angular Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 116,
          disease_scientific_name: 'Pseudocercospora angolensis',
          disease_common_name: 'Leaf Spot of Citrus',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 117,
          disease_scientific_name: 'Gloeocercospora sorghi',
          disease_common_name: 'Zonate Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 118,
          disease_scientific_name: 'Cercospora beticola',
          disease_common_name: 'Leaf Spot of Beet',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 119,
          disease_scientific_name: 'Alternaria cucumerina',
          disease_common_name: 'Leaf Blight of Cucurbits',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 120,
          disease_scientific_name: 'Claviceps fusiformis',
          disease_common_name: 'Ergot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 121,
          disease_scientific_name: 'Didymella lycopersici',
          disease_common_name: 'Didymella Stem Rot of Tomato',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 122,
          disease_scientific_name: 'Rhizoctonia solani',
          disease_common_name: 'Black Scurf',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 123,
          disease_scientific_name: 'Colletotrichum lindemuthianum',
          disease_common_name: 'Black Spot Disease',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 124,
          disease_scientific_name: 'Phomopsis amygdali',
          disease_common_name: 'Constriction Canker of Peach',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 125,
          disease_scientific_name: 'Olpidium brassicae',
          disease_common_name: 'Lettuce Big-Vein Disease',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 126,
          disease_scientific_name: 'Cercospora melongenae',
          disease_common_name: 'Cercospora Leaf Spot of Eggplant',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 127,
          disease_scientific_name: 'Uromyces pisi-sativi',
          disease_common_name: 'Pea Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 128,
          disease_scientific_name: 'Thanatephorus cucumeris',
          disease_common_name: 'Bottom Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 129,
          disease_scientific_name: 'Unknown Pathogen',
          disease_common_name: 'Bud Necrosis',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 130,
          disease_scientific_name: 'Togninia minima',
          disease_common_name: 'Esca',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 131,
          disease_scientific_name: 'Monilinia spp',
          disease_common_name: 'Jacket Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 132,
          disease_scientific_name: 'Armillaria mellea',
          disease_common_name: 'Armillaria Root Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 133,
          disease_scientific_name: 'Monilinia laxa',
          disease_common_name: 'Brown Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 134,
          disease_scientific_name: 'Venturia pyrina',
          disease_common_name: 'Pear Scab',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 135,
          disease_scientific_name: 'Glomerella gossypii',
          disease_common_name: 'Anthracnose of Cotton',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 136,
          disease_scientific_name: 'Pseudopezicula tetraspora',
          disease_common_name: 'Angular Leaf Scorch',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 137,
          disease_scientific_name: 'Helminthosporium solani',
          disease_common_name: 'Silver Scurf',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 138,
          disease_scientific_name: 'Podosphaera mors-uvae',
          disease_common_name: 'American Gooseberry Mildew',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 139,
          disease_scientific_name: 'Stagonosporopsis cucurbitacearum',
          disease_common_name: 'Gummy Stem Blight of Cucurbits',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 140,
          disease_scientific_name: 'Cladosporium cucumerinum',
          disease_common_name: 'Cucumber Scab',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 141,
          disease_scientific_name: 'Stromatinia cepivora',
          disease_common_name: 'White Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 142,
          disease_scientific_name: 'Tranzschelia pruni spinosae',
          disease_common_name: 'Plum Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 143,
          disease_scientific_name: 'Tilletia indica',
          disease_common_name: 'Karnal Bunt of Wheat',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 144,
          disease_scientific_name: 'Oculimacula yallundae',
          disease_common_name: 'Eyespot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 145,
          disease_scientific_name: 'Plasmopara viticola',
          disease_common_name: 'Downy Mildew on Grape',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 146,
          disease_scientific_name: 'Plasmodiophora brassicae',
          disease_common_name: 'Clubroot of Canola',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 147,
          disease_scientific_name: 'Mycosphaerella fragariae',
          disease_common_name: 'Common Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 148,
          disease_scientific_name: 'Didymella applanata',
          disease_common_name: 'Raspberry Spur Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 149,
          disease_scientific_name: 'Phaeoramularia manihotis',
          disease_common_name: 'White Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 150,
          disease_scientific_name: 'Puccinia polysora',
          disease_common_name: 'Southern Rust of Maize',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 151,
          disease_scientific_name: 'Botrytis  cinerea',
          disease_common_name: 'Botrytis Blight in Lettuce',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 152,
          disease_scientific_name: 'Taphrina pruni',
          disease_common_name: 'Pocket Plum Gall',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 153,
          disease_scientific_name: 'Puccinia hordei',
          disease_common_name: 'Brown Rust of Barley',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 154,
          disease_scientific_name: 'Ceratocystis fimbriata',
          disease_common_name: 'Pomegranate Wilt',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 155,
          disease_scientific_name: 'Phytophthora sojae',
          disease_common_name: 'Stem and Root Rot of Soybean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 156,
          disease_scientific_name: 'Cronartium ribicola',
          disease_common_name: 'White Pine Blister Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 157,
          disease_scientific_name: 'Peyronellaea glomerata',
          disease_common_name: 'Phoma Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 158,
          disease_scientific_name: 'Uromyces viciae-fabae',
          disease_common_name: 'Lentil Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 159,
          disease_scientific_name: 'Monilinia fructigena',
          disease_common_name: 'Brown Rot of Fruits',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 160,
          disease_scientific_name: 'Diplocarpon maculatum',
          disease_common_name: 'Pear Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 161,
          disease_scientific_name: 'Valsa cincta',
          disease_common_name: 'Dieback of Stone Fruit',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 162,
          disease_scientific_name: 'Podosphaera aphanis',
          disease_common_name: 'Powdery Mildew of Strawberry',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 163,
          disease_scientific_name: 'Alternaria brassicae',
          disease_common_name: 'Black Mold',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 164,
          disease_scientific_name: 'Botryotinia squamosa',
          disease_common_name: 'Botrytis Leaf Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 165,
          disease_scientific_name: 'Didymella fabae',
          disease_common_name: 'Ascochyta Blight of Lentil',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 166,
          disease_scientific_name: 'Colletotrichum truncatum',
          disease_common_name: 'Anthracnose of Lentil',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 167,
          disease_scientific_name: 'Rhizoctonia solani',
          disease_common_name: 'Soreshin',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 168,
          disease_scientific_name: 'Apiognomonia erythrostoma',
          disease_common_name: 'Cherry Leaf Scorch',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 169,
          disease_scientific_name: 'Glomerella cingulata',
          disease_common_name: 'Bitter Rot on Apple',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 170,
          disease_scientific_name: 'Spongospora subterranea',
          disease_common_name: 'Powdery Scab',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 171,
          disease_scientific_name: 'Eutypa lata',
          disease_common_name: 'Dead Arm',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 172,
          disease_scientific_name: 'Valsa leucostoma',
          disease_common_name: 'Valsa Disease',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 173,
          disease_scientific_name: 'Neonectria ditissima',
          disease_common_name: 'Fruit Tree Canker',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 174,
          disease_scientific_name: 'Athelia rolfsii',
          disease_common_name: 'Sclerotium Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 175,
          disease_scientific_name: 'Phomopsis amygdali',
          disease_common_name: 'Constriction Canker',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 176,
          disease_scientific_name: 'Erysiphe necator',
          disease_common_name: 'Powdery Mildew of Grape',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 177,
          disease_scientific_name: 'Pyrenophora teres',
          disease_common_name: 'Net Blotch',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 178,
          disease_scientific_name: 'Plenodomus lingam',
          disease_common_name: 'Black Leg of Rapeseed',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 179,
          disease_scientific_name: 'Phytophthora infestans',
          disease_common_name: 'Potato Late Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 180,
          disease_scientific_name: 'Phytophthora nicotianae',
          disease_common_name: 'Black Shank',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 181,
          disease_scientific_name: 'Septoria glycines',
          disease_common_name: 'Brown Spot of Soybean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 182,
          disease_scientific_name: 'Rhizoctonia solani',
          disease_common_name: 'Root Rot of Lentil',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 183,
          disease_scientific_name: 'Magnaporthe oryzae',
          disease_common_name: 'Pyricularia Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 184,
          disease_scientific_name: 'Ramularia beticola',
          disease_common_name: 'Ramularia Leaf Spot of Beet',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 185,
          disease_scientific_name: 'Physopella zeae',
          disease_common_name: 'Tropical Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 186,
          disease_scientific_name: 'Sclerotinia sclerotiorum',
          disease_common_name: 'Sclerotinia Stem Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 187,
          disease_scientific_name: 'Wilsonomyces carpophilus',
          disease_common_name: 'Shothole Disease',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 188,
          disease_scientific_name: 'Glomerella cingulata',
          disease_common_name: 'Anthracnose of Pomegranate',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 189,
          disease_scientific_name: 'Fusarium graminearum',
          disease_common_name: 'Fusarium Head Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 492,
          disease_scientific_name: 'SMV',
          disease_common_name: 'Soybean Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 190,
          disease_scientific_name: 'Alternaria alternata',
          disease_common_name: 'Alternaria Black Spot and Fruit Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 191,
          disease_scientific_name: 'Pseudocercospora punicae',
          disease_common_name: 'Cercospora Fruit and Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 192,
          disease_scientific_name: 'Drepanopeziza ribis',
          disease_common_name: 'Anthracnose of Currant & Gooseberry',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 193,
          disease_scientific_name: 'Claviceps africana',
          disease_common_name: 'Ergot of Sorghum',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 194,
          disease_scientific_name: 'Gibberella fujikuroi',
          disease_common_name: 'Bakanae and Foot Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 195,
          disease_scientific_name: 'Septoria citri',
          disease_common_name: 'Septoria Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 196,
          disease_scientific_name: 'Alternaria spp.',
          disease_common_name: 'Alternaria Leaf Spot of Peanut',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 197,
          disease_scientific_name: 'Neofabraea malicorticis',
          disease_common_name: 'Anthracnose of Apple',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 198,
          disease_scientific_name: 'Macrophomina phaseolina',
          disease_common_name: 'Ashy Stem Blight of Bean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 199,
          disease_scientific_name: 'Chondrostereum purpureum',
          disease_common_name: 'Silver Leaf',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 200,
          disease_scientific_name: 'Trachysphaera fructigena',
          disease_common_name: 'Cigar End Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 201,
          disease_scientific_name: 'Pythium aphanidermatum',
          disease_common_name: 'Chilli Damping-off',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 202,
          disease_scientific_name: 'Sphaerulina oryzina',
          disease_common_name: 'Narrow Brown Leaf Spot of Rice',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 203,
          disease_scientific_name: 'Pseudoperonospora cubensis',
          disease_common_name: 'Downy Mildew on Cucurbits',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 204,
          disease_scientific_name: 'Deightoniella torulosa',
          disease_common_name: 'Black Leaf Spot of Banana',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 205,
          disease_scientific_name: 'Corynespora cassiicola',
          disease_common_name: 'Papaya Brown Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 206,
          disease_scientific_name: 'Rhizoctonia solani',
          disease_common_name: 'Rhizoctonia Root Rot of Olive',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 207,
          disease_scientific_name: 'Cochliobolus carbonum',
          disease_common_name: 'Northern Corn Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 208,
          disease_scientific_name: 'Mycosphaerella citri',
          disease_common_name: 'Greasy Spot of Citrus',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 209,
          disease_scientific_name: 'Macrophomina phaseolina',
          disease_common_name: 'Charcoal Stalk Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 210,
          disease_scientific_name: 'Ustilago tritici',
          disease_common_name: 'Loose Smut',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 211,
          disease_scientific_name: 'Alternaria macrospora',
          disease_common_name: 'Alternaria Leaf Spot of Cotton',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 212,
          disease_scientific_name: 'Mycosphaerella henningsii',
          disease_common_name: 'Brown leaf spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 213,
          disease_scientific_name: 'Epicoccum sorghi',
          disease_common_name: 'Phoma Sorghina in Rice',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 214,
          disease_scientific_name: 'Pyrenophora graminea',
          disease_common_name: 'Leaf Stripe of Barley',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 215,
          disease_scientific_name: 'Phytophthora drechsleri',
          disease_common_name: 'Phytophthora Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 216,
          disease_scientific_name: 'Puccinia melanocephala',
          disease_common_name: 'Sugarcane Common Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 217,
          disease_scientific_name: 'Oidium caricae-papayae',
          disease_common_name: 'Powdery Mildew of Papaya',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 218,
          disease_scientific_name: 'Podosphaera pannosa',
          disease_common_name: 'Rose Mildew',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 219,
          disease_scientific_name: 'Gaeumannomyces graminis',
          disease_common_name: 'Take All',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 220,
          disease_scientific_name: 'Rhizoctonia solani',
          disease_common_name: 'Rhizoctonia Aerial Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 221,
          disease_scientific_name: 'Ceratocystis paradoxa',
          disease_common_name: 'Sugarcane Pineapple Disease',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 222,
          disease_scientific_name: 'Cercospora kikuchii',
          disease_common_name: 'Purple Seed Stain of Soybean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 223,
          disease_scientific_name: 'Colletotrichum lindemuthianum',
          disease_common_name: 'Anthracnose of Blackgram',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 224,
          disease_scientific_name: 'Botryosphaeria dothidea',
          disease_common_name: 'Gummosis',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 225,
          disease_scientific_name: 'Puccinia substriata',
          disease_common_name: 'Millet Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 226,
          disease_scientific_name: 'Cercospora capsici',
          disease_common_name: 'Chilli Cercospora Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 227,
          disease_scientific_name: 'Blumeria graminis',
          disease_common_name: 'Powdery Mildew of Cereals',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 228,
          disease_scientific_name: 'Septoria lycopersici',
          disease_common_name: 'Septoria Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 229,
          disease_scientific_name: 'Diaporthe citri',
          disease_common_name: 'Melanose',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 230,
          disease_scientific_name: 'Puccinia recondita',
          disease_common_name: 'Brown Rust of Rye',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 231,
          disease_scientific_name: 'Pythium aphanidermatum',
          disease_common_name: 'Damping-Off',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 232,
          disease_scientific_name: 'Fusarium oxysporum',
          disease_common_name: 'Vascular Wilt of Banana',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 233,
          disease_scientific_name: 'Uromyces ciceris-arietini',
          disease_common_name: 'Chickpea Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 234,
          disease_scientific_name: 'Phoma tracheiphila',
          disease_common_name: 'Mal Secco',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 235,
          disease_scientific_name: 'Monographella nivalis',
          disease_common_name: 'Snow Mold of Cereals',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 236,
          disease_scientific_name: 'Cordana musae',
          disease_common_name: 'Leaf Blotch of Banana',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 237,
          disease_scientific_name: 'Penicillium spp.',
          disease_common_name: 'Penicillium ear rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 238,
          disease_scientific_name: 'Macrophomina phaseolina',
          disease_common_name: 'Charcoal Rot of Soybean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 239,
          disease_scientific_name: 'Polystigma ochraceum',
          disease_common_name: 'Almond Red Leaf Blotch',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 240,
          disease_scientific_name: 'Mycosphaerella areola',
          disease_common_name: 'Grey Mildew of Cotton',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 241,
          disease_scientific_name: 'Gibberella fujikuroi',
          disease_common_name: 'Wilt Disease of Sugarcane',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 242,
          disease_scientific_name: 'Cochliobolus heterostrophus',
          disease_common_name: 'Southern Corn Leaf Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 243,
          disease_scientific_name: 'Puccinia triticina',
          disease_common_name: 'Wheat Leaf  Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 244,
          disease_scientific_name: 'Puccinia coronata',
          disease_common_name: 'Crown Rust of Grasses',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 245,
          disease_scientific_name: 'Mycosphaerella graminicola',
          disease_common_name: 'Septoria Tritici Blotch',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 246,
          disease_scientific_name: 'Gonatophragmium sp.',
          disease_common_name: 'Red Stripe Disease',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 247,
          disease_scientific_name: 'Ascochyta rabiei',
          disease_common_name: 'Ascochyta Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 248,
          disease_scientific_name: 'Phytophthora',
          disease_common_name: 'Phytophthora Gummosis',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 249,
          disease_scientific_name: 'Glomerella lagenarium',
          disease_common_name: 'Anthracnose of Cucurbits',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 250,
          disease_scientific_name: 'Glomerella acutata',
          disease_common_name: 'Anthracnose of Lime',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 251,
          disease_scientific_name: 'Sporisorium scitamineum',
          disease_common_name: 'Smut of Sugarcane',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 252,
          disease_scientific_name: 'Botrytis cinerea',
          disease_common_name: 'Botrytis Blight',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 253,
          disease_scientific_name: 'Elsinoe ampelina',
          disease_common_name: 'Anthracnose of Grape',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 254,
          disease_scientific_name: 'Fusarium solani f. sp. phaseoli',
          disease_common_name: 'Dry Root Rot of Bean',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 255,
          disease_scientific_name: 'Puccinia graminis',
          disease_common_name: 'Wheat Stem Rust',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 256,
          disease_scientific_name: 'Pseudocercospora cladosporioides',
          disease_common_name: 'Cercospora Leaf Spot of Olive',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 257,
          disease_scientific_name: 'Rhynchosporium secalis',
          disease_common_name: 'Rhynchosporium',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 258,
          disease_scientific_name: 'Phyllosticta citricarpa',
          disease_common_name: 'Citrus Black Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 259,
          disease_scientific_name: 'Botryosphaeria rhodina',
          disease_common_name: 'Mango Dieback Disease',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 260,
          disease_scientific_name: 'Botryosphaeriaceae',
          disease_common_name: 'Botryosphaeria Dieback',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 261,
          disease_scientific_name: 'Fusarium verticillioides',
          disease_common_name: 'Fusarium Ear Rot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 262,
          disease_scientific_name: 'Ramularia collo-cygni',
          disease_common_name: 'Ramularia Leaf Spot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 263,
          disease_scientific_name: 'Magnaporthe oryzae',
          disease_common_name: 'Wheat Blast',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 264,
          disease_scientific_name: 'Plasmodiophora brassicae',
          disease_common_name: 'Clubroot',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 265,
          disease_scientific_name: 'Balansia oryzae-sativae',
          disease_common_name: 'Udbatta Disease of Rice',
          disease_group: 'Fungus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 266,
          disease_scientific_name: 'Paracoccus marginatus',
          disease_common_name: 'Mealybug on Papaya',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 267,
          disease_scientific_name: 'Aphidoidea family',
          disease_common_name: 'Aphid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 268,
          disease_scientific_name: 'Cnaphalocrocis medinalis',
          disease_common_name: 'Rice Leafroller',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 269,
          disease_scientific_name: 'Myzus persicae',
          disease_common_name: 'Green Peach Aphid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 270,
          disease_scientific_name: 'Leptinotarsa decemlineata',
          disease_common_name: 'Potato Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 271,
          disease_scientific_name: 'Hishimonus phycitis',
          disease_common_name: 'Jassids on Eggplant',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 272,
          disease_scientific_name: 'Eriosoma lanigerum',
          disease_common_name: 'Woolly Aphid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 273,
          disease_scientific_name: 'Chilo partellus',
          disease_common_name: 'Spotted Stemborer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 274,
          disease_scientific_name: 'Dicladispa armigera',
          disease_common_name: 'Rice Hispa',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 275,
          disease_scientific_name: 'Procontarinia mangiferae',
          disease_common_name: 'Mango Blister Midge',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 276,
          disease_scientific_name: 'Phyllocnistis citrella',
          disease_common_name: 'Citrus Leaf Miner',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 277,
          disease_scientific_name: 'Toxotrypana curvicauda',
          disease_common_name: 'Papaya Fruit Fly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 278,
          disease_scientific_name: 'Cerotoma trifurcata',
          disease_common_name: 'Bean Leaf Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 279,
          disease_scientific_name: 'Dialeurodes citri',
          disease_common_name: 'Citrus Whitefly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 280,
          disease_scientific_name: 'Agromyzidae spp.',
          disease_common_name: 'Leaf Miner Flies',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 281,
          disease_scientific_name: 'Lyonetia clerkella',
          disease_common_name: 'Apple Leaf Miner',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 282,
          disease_scientific_name: 'Scirpophaga incertulas',
          disease_common_name: 'Yellow Stem Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 283,
          disease_scientific_name: 'Sesamia inferens',
          disease_common_name: 'Violet Stem Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 284,
          disease_scientific_name: 'Ostrinia nubilalis',
          disease_common_name: 'European Corn Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 285,
          disease_scientific_name: 'Helicoverpa zea',
          disease_common_name: 'Corn Earworm',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 286,
          disease_scientific_name: 'Empoasca kerri',
          disease_common_name: 'Jassids on Peanut',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 287,
          disease_scientific_name: 'Pseudococcidae',
          disease_common_name: 'Mealybug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 288,
          disease_scientific_name: 'Icerya purchasi',
          disease_common_name: 'Cottony Cushion Scale',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 289,
          disease_scientific_name: 'Ceratitis cosyra',
          disease_common_name: 'Mango Fruit Fly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 290,
          disease_scientific_name: 'Psylliodes',
          disease_common_name: 'Flea Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 291,
          disease_scientific_name: 'Trialeurodes vaporariorum',
          disease_common_name: 'Greenhouse Whitefly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 292,
          disease_scientific_name: 'Order Thysanoptera',
          disease_common_name: 'Thrips',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 293,
          disease_scientific_name: 'Gryllotalpa africana',
          disease_common_name: 'African Mole Cricket',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 294,
          disease_scientific_name: 'Zonocerus variegatus',
          disease_common_name: 'Variegated Grasshopper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 295,
          disease_scientific_name: 'Agrotis ipsilon',
          disease_common_name: 'Black Cutworm',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 296,
          disease_scientific_name: 'Spodoptera frugiperda',
          disease_common_name: 'Fall Armyworm',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 297,
          disease_scientific_name: 'Drosicha mangiferae',
          disease_common_name: 'Mealybug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 298,
          disease_scientific_name: 'Cryptomyzus ribis',
          disease_common_name: 'Redcurrant Blister Aphid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 299,
          disease_scientific_name: 'Amrasca devastans',
          disease_common_name: 'Cotton Leaf Hopper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 300,
          disease_scientific_name: 'Stenodiplosis sorghicola',
          disease_common_name: 'Sorghum Midge',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 301,
          disease_scientific_name: 'Helicoverpa armigera',
          disease_common_name: 'Helicoverpa on Soybean',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 302,
          disease_scientific_name: 'Autographa nigrisigna',
          disease_common_name: 'Semilooper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 303,
          disease_scientific_name: 'Aspidiotus destructor',
          disease_common_name: 'Banana Scale Insect',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 304,
          disease_scientific_name: 'Lampides boeticus',
          disease_common_name: 'Pea Blue Butterfly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 305,
          disease_scientific_name: 'Bactrocera dorsalis',
          disease_common_name: 'Oriental Fruit Fly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 306,
          disease_scientific_name: 'Oxya intricata',
          disease_common_name: 'Rice Grasshopper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 307,
          disease_scientific_name: 'Amsacta albistriga',
          disease_common_name: 'Red Hairy Caterpillar',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 308,
          disease_scientific_name: 'Altica ampelophaga',
          disease_common_name: 'Vine Flea Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 309,
          disease_scientific_name: 'Pectinophora gossypiella',
          disease_common_name: 'Pink Bollworm',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 310,
          disease_scientific_name: 'Leptocorisa spp.',
          disease_common_name: 'Rice Bug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 311,
          disease_scientific_name: 'Bactrocera oleae',
          disease_common_name: 'Olive Fruit Fly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 312,
          disease_scientific_name: 'Pelopidas mathias',
          disease_common_name: 'Rice Skipper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 313,
          disease_scientific_name: 'Elasmopalpus lignosellus',
          disease_common_name: 'Lesser cornstalk borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 314,
          disease_scientific_name: 'Saissetia oleae',
          disease_common_name: 'Black Scale',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 315,
          disease_scientific_name: 'Stictococcus vayssierei',
          disease_common_name: 'Cassava Root Mealybug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 316,
          disease_scientific_name: 'Mamestra brassicae',
          disease_common_name: 'Cabbage Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 317,
          disease_scientific_name: 'Lepidiota stigma',
          disease_common_name: 'Sugarcane White Grub',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 318,
          disease_scientific_name: 'Spodoptera litura',
          disease_common_name: 'Cut Worm on Banana',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 319,
          disease_scientific_name: 'Hyalopterus pruni',
          disease_common_name: 'Mealy Plum Aphid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 320,
          disease_scientific_name: 'Brevennia rehi',
          disease_common_name: 'Rice Mealybug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 321,
          disease_scientific_name: 'Colaspis hypochlora',
          disease_common_name: 'Banana Fruit-Scarring Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 322,
          disease_scientific_name: 'Sternochetus mangiferae',
          disease_common_name: 'Mango Nut Weevil',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 323,
          disease_scientific_name: 'Nephotettix spp.',
          disease_common_name: 'Green Paddy Leafhoppers',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 324,
          disease_scientific_name: 'Archips argyrospila',
          disease_common_name: 'Fruit Tree Leafroller',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 325,
          disease_scientific_name: 'Hedylepta indicata',
          disease_common_name: 'Bean Leaf Webber',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 326,
          disease_scientific_name: 'Diatraea saccharalis',
          disease_common_name: 'Sugarcane Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 327,
          disease_scientific_name: 'Ceratitis capitata',
          disease_common_name: 'Mediterranean Fruit Fly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 328,
          disease_scientific_name: 'Aleurothrixus floccosus',
          disease_common_name: 'Citrus Wolly Whitefly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 329,
          disease_scientific_name: 'Odoiporus longicollis',
          disease_common_name: 'Pseudostem Weevil',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 330,
          disease_scientific_name: 'Chaetanaphothrips signipennis',
          disease_common_name: 'Banana Rust Thrips',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 331,
          disease_scientific_name: 'Eublemma olivacea',
          disease_common_name: 'Eggplant Leaf Roller',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 332,
          disease_scientific_name: 'Eupoecilia ambiguella',
          disease_common_name: 'Grape Bud Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 333,
          disease_scientific_name: 'Sternechus subsignatus',
          disease_common_name: 'Soybean Stalk Weevil',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 334,
          disease_scientific_name: 'Urbanus proteus',
          disease_common_name: 'Bean Leafroller',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 335,
          disease_scientific_name: 'Aphis spiraecola',
          disease_common_name: 'Green Citrus Aphid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 336,
          disease_scientific_name: 'Frankliniella occidentalis',
          disease_common_name: 'Western Flower Thrips',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 337,
          disease_scientific_name: 'Lygus hesperus',
          disease_common_name: 'Western Plant Bug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 338,
          disease_scientific_name: 'Parlatoria ziziphi',
          disease_common_name: 'Black Parlatoria Scale',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 339,
          disease_scientific_name: 'Euschistus spp.',
          disease_common_name: 'Stink Bugs on Corn, Millet and Sorghum',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 340,
          disease_scientific_name: 'Hydrellia philippina',
          disease_common_name: 'Whorl Maggot',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 341,
          disease_scientific_name: 'Melanitis leda',
          disease_common_name: 'Greenhorned Caterpillars',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 342,
          disease_scientific_name: 'Grapholita molesta',
          disease_common_name: 'Oriental Fruit Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 343,
          disease_scientific_name: 'Lobesia botrana',
          disease_common_name: 'Grape Berry Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 344,
          disease_scientific_name: 'Pericallia ricini',
          disease_common_name: 'Castor Hairy Caterpillar',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 345,
          disease_scientific_name: 'Helicoverpa armigera',
          disease_common_name: 'Tomato Fruit Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 346,
          disease_scientific_name: 'Scirtothrips  spp.',
          disease_common_name: 'Thrips in Mango',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 347,
          disease_scientific_name: 'Rhagoletis cerasi',
          disease_common_name: 'Cherry Fruit Fly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 348,
          disease_scientific_name: 'Nacoleia octasema',
          disease_common_name: 'Banana Scab Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 349,
          disease_scientific_name: 'Scirtothrips citri',
          disease_common_name: 'Citrus Thrips',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 350,
          disease_scientific_name: 'Etiella zinckenella',
          disease_common_name: 'Pea Pod Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 351,
          disease_scientific_name: 'Pieris',
          disease_common_name: 'Small and Large Cabbage White',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 352,
          disease_scientific_name: 'Anthonomus grandis',
          disease_common_name: 'Boll Weevil',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 353,
          disease_scientific_name: 'Metcalfa pruinosa',
          disease_common_name: 'Citrus Flatid Plant Hopper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 354,
          disease_scientific_name: 'Citripestis eutraphera',
          disease_common_name: 'Mango Fruit Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 355,
          disease_scientific_name: 'Phytomyza gymnostoma',
          disease_common_name: 'Onion Leaf Miner',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 356,
          disease_scientific_name: 'Diabrotica spp.',
          disease_common_name: 'Cucumber Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 357,
          disease_scientific_name: 'Opogona sacchari',
          disease_common_name: 'Banana Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 358,
          disease_scientific_name: 'Toxoptera aurantii',
          disease_common_name: 'Black Citrus Aphid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 359,
          disease_scientific_name: 'Hylesinus toranio',
          disease_common_name: 'Olive Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 360,
          disease_scientific_name: 'Deanolis albizonalis',
          disease_common_name: 'Mango Seed Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 361,
          disease_scientific_name: 'Anticarsia gemmatalis',
          disease_common_name: 'Velvetbean Caterpillar',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 362,
          disease_scientific_name: 'Sparganothis pilleriana',
          disease_common_name: 'Grapevine Leafroller',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 363,
          disease_scientific_name: 'Spodoptera mauritia',
          disease_common_name: 'Paddy Swarming Caterpillar',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 364,
          disease_scientific_name: 'Mythimna separata',
          disease_common_name: 'Rice Ear-Cutting Caterpillar',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 365,
          disease_scientific_name: 'Nilaparvata lugens',
          disease_common_name: 'Brown Planthopper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 366,
          disease_scientific_name: 'Scirtothrips dorsalis',
          disease_common_name: 'Pomegranate Thrips',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 367,
          disease_scientific_name: 'Procontarinia pustulata',
          disease_common_name: 'Mango Gall Midge',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 368,
          disease_scientific_name: 'Orseolia oryzae',
          disease_common_name: 'Asian Rice Gall Midge',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 369,
          disease_scientific_name: 'Euphyllura olivina',
          disease_common_name: 'Olive Psyllid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 370,
          disease_scientific_name: 'Aleyrodes proletella',
          disease_common_name: 'Cabbage Whitefly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 371,
          disease_scientific_name: 'Zeugodacus cucurbitae',
          disease_common_name: 'Melon Fruit Fly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 372,
          disease_scientific_name: 'Monosteira unicostata',
          disease_common_name: 'Poplar Lace Bug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 373,
          disease_scientific_name: 'Parapoynx stagnalis',
          disease_common_name: 'Rice Case Worm',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 374,
          disease_scientific_name: 'Phthorimaea operculella',
          disease_common_name: 'Potato Tuber Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 375,
          disease_scientific_name: 'Operophtera brumata',
          disease_common_name: 'Winter Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 376,
          disease_scientific_name: 'Euproctis fraterna',
          disease_common_name: 'Hairy Caterpillars',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 377,
          disease_scientific_name: 'Lacanobia oleracea',
          disease_common_name: 'Bright Line Brown Eye',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 378,
          disease_scientific_name: 'Bemisia tabaci',
          disease_common_name: 'Silverleaf Whitefly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 379,
          disease_scientific_name: 'Chilo infuscatellus',
          disease_common_name: 'Early Shoot Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 380,
          disease_scientific_name: 'Apsylla cistellata',
          disease_common_name: 'Mango Shoot Psyllid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 381,
          disease_scientific_name: 'Coniesta ignefusalis',
          disease_common_name: 'Stem Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 382,
          disease_scientific_name: 'Maruca testulalis',
          disease_common_name: 'Spotted Pod Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 383,
          disease_scientific_name: 'Epinotia aporema',
          disease_common_name: 'Bean Shoot Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 384,
          disease_scientific_name: 'Drepanothrips reuteri',
          disease_common_name: 'Grape Thrips',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 385,
          disease_scientific_name: 'Helicoverpa armigera',
          disease_common_name: 'Gram Pod Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 386,
          disease_scientific_name: 'Trialeurodes packardi',
          disease_common_name: 'Strawberry Whitefly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 387,
          disease_scientific_name: 'Anthonomus rubi',
          disease_common_name: 'Strawberry Blossom Weevil',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 388,
          disease_scientific_name: 'Scolytus mali',
          disease_common_name: 'Fruit Tree Bark Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 389,
          disease_scientific_name: 'Tibraca limbativentris',
          disease_common_name: 'Rice Stalk Stinkbug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 390,
          disease_scientific_name: 'Myzus cerasi',
          disease_common_name: 'Black Cherry Aphid',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 391,
          disease_scientific_name: 'Leucinodes orbonalis',
          disease_common_name: 'Brinjal Fruit Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 392,
          disease_scientific_name: 'Cosmopolites sordidus',
          disease_common_name: 'Root Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 393,
          disease_scientific_name: 'Stenchaetothrips biformis',
          disease_common_name: 'Rice Thrips',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 394,
          disease_scientific_name: 'Helicoverpa armigera',
          disease_common_name: 'Cotton Bollworm',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 395,
          disease_scientific_name: 'Empoasca decipiens',
          disease_common_name: 'Green Leafhopper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 396,
          disease_scientific_name: 'Argyrotaenia ljungiana',
          disease_common_name: 'Grape Tortrix Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 397,
          disease_scientific_name: 'Stephanitis typica',
          disease_common_name: 'Banana Lace Wing Bug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 398,
          disease_scientific_name: 'Chamaepsila rosae',
          disease_common_name: 'Carrot Fly',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 399,
          disease_scientific_name: 'Parlatoria oleae',
          disease_common_name: 'Olive Scale',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 400,
          disease_scientific_name: 'Delia platura',
          disease_common_name: 'Onion Maggots',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 401,
          disease_scientific_name: 'Chlumetia transversa',
          disease_common_name: 'Mango Shoot Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 402,
          disease_scientific_name: 'Otiorhynchus cribricollis',
          disease_common_name: 'Curculio Weevil',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 403,
          disease_scientific_name: 'Euschistus servus',
          disease_common_name: 'Stink Bug on Cotton',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 404,
          disease_scientific_name: 'Scolytus amygdali',
          disease_common_name: 'Almond Bark Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 405,
          disease_scientific_name: 'Empoasca vitis',
          disease_common_name: 'Leafhopper on Grape',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 406,
          disease_scientific_name: 'Phloeotribus scarabaeoides',
          disease_common_name: 'Olive Bark Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 407,
          disease_scientific_name: 'Aonidomytilus albus',
          disease_common_name: 'Cassava scale',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 408,
          disease_scientific_name: 'Yponomeutidae',
          disease_common_name: 'Ermine Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 409,
          disease_scientific_name: 'Idioscopus spp.',
          disease_common_name: 'Mango Hoppers',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 410,
          disease_scientific_name: 'Mythimna separata',
          disease_common_name: 'Oriental Armyworm',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 411,
          disease_scientific_name: 'Spodoptera eridania',
          disease_common_name: 'Southern Armyworm',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 412,
          disease_scientific_name: 'Heliocheilus albipunctella',
          disease_common_name: 'Head Miner',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 413,
          disease_scientific_name: 'Anarsia lineatella',
          disease_common_name: 'Peach Twig Borer',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 414,
          disease_scientific_name: 'Epilachna vigintioctopunctata',
          disease_common_name: 'Leaf Eating Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 415,
          disease_scientific_name: 'Cydia pomonella',
          disease_common_name: 'Codling Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 416,
          disease_scientific_name: 'Spodoptera litura',
          disease_common_name: 'Tobacco Caterpillar',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 417,
          disease_scientific_name: 'Prays oleae',
          disease_common_name: 'Olive Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 418,
          disease_scientific_name: 'Holotrichia spp.',
          disease_common_name: 'White Grub on Peanut',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 419,
          disease_scientific_name: 'Acrosternum hilare',
          disease_common_name: 'Stink Bugs on Soybean',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 420,
          disease_scientific_name: 'Tuta Absoluta',
          disease_common_name: 'Tuta Absoluta',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 421,
          disease_scientific_name: 'Palpita unionalis',
          disease_common_name: 'Jasmine Moth',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 422,
          disease_scientific_name: 'Aspidiotus nerii',
          disease_common_name: 'Oleander Scale',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 423,
          disease_scientific_name: 'Ophiusa melicerta',
          disease_common_name: 'Castor Semilooper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 424,
          disease_scientific_name: 'Oulema melanopus',
          disease_common_name: 'Cereal Leaf Beetle',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 425,
          disease_scientific_name: 'Helicoverpa armigera',
          disease_common_name: 'Bean Bollworm',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 426,
          disease_scientific_name: 'Forficula auricularia',
          disease_common_name: 'European Earwig',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 427,
          disease_scientific_name: 'Gargaphia solani',
          disease_common_name: 'Eggplant Lace Bug',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 428,
          disease_scientific_name: 'Pseudoplusia includens',
          disease_common_name: 'Soybean Looper',
          disease_group: 'Insect',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 429,
          disease_scientific_name: 'Tetranychus urticae',
          disease_common_name: 'Common Red Spider Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 430,
          disease_scientific_name: 'Panonychus ulmi',
          disease_common_name: 'European Red Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 431,
          disease_scientific_name: 'Panonychus citri',
          disease_common_name: 'Citrus Red Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 432,
          disease_scientific_name: 'Raoiella indica',
          disease_common_name: 'Red Palm Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 433,
          disease_scientific_name: 'Calepitrimerus vitis',
          disease_common_name: 'Grape Rust Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 434,
          disease_scientific_name: 'Mononychellus tanajoa',
          disease_common_name: 'Cassava Green Spider Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 435,
          disease_scientific_name: 'Bryobia rubrioculus',
          disease_common_name: 'Brown Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 436,
          disease_scientific_name: 'Eriophyes pyri',
          disease_common_name: 'Pear Leaf Blister Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 437,
          disease_scientific_name: 'Eotetranychus carpini',
          disease_common_name: 'Yellow Vine Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 438,
          disease_scientific_name: 'Aceria sheldoni',
          disease_common_name: 'Citrus Bud Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 439,
          disease_scientific_name: 'Steneotarsonemus spinki',
          disease_common_name: 'Rice Panicle Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 440,
          disease_scientific_name: 'Oxycenus maxwelli',
          disease_common_name: 'Olive Bud Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 441,
          disease_scientific_name: 'Oligonychus mangiferus',
          disease_common_name: 'Mango  Spider Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 442,
          disease_scientific_name: 'Oligonychus oryzae',
          disease_common_name: 'Rice Leaf Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 443,
          disease_scientific_name: 'Colomerus vitis',
          disease_common_name: 'Grape Blister Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 444,
          disease_scientific_name: 'Eriophyidae',
          disease_common_name: 'Gall Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 445,
          disease_scientific_name: 'Polyphagotarsonemus latus',
          disease_common_name: 'Broad Mite',
          disease_group: 'Mite',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 446,
          disease_scientific_name: 'Meloidogyne spp.',
          disease_common_name: 'Root-Knot Nematode',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 447,
          disease_scientific_name: 'Meloidogyne ethiopica',
          disease_common_name: 'Root-Knot Nematode in Soybean',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 448,
          disease_scientific_name: 'Class Gastropoda',
          disease_common_name: 'Slug',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 449,
          disease_scientific_name: 'PLS',
          disease_common_name: 'Physiological Leaf Spot',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 450,
          disease_scientific_name: 'Sagittaria montevidensis',
          disease_common_name: 'Giant Arrowhead',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 451,
          disease_scientific_name: 'Alkalinity',
          disease_common_name: 'Alkalinity',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 452,
          disease_scientific_name: 'Anguina tritici',
          disease_common_name: 'Ear Cockle Eelworm',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 453,
          disease_scientific_name: 'Cricetidae',
          disease_common_name: 'Vole',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 454,
          disease_scientific_name: 'Tylenchulus semipenetrans',
          disease_common_name: 'Citrus Nematode',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 455,
          disease_scientific_name: 'Heterodera glycines',
          disease_common_name: 'Cyst Nematode',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 456,
          disease_scientific_name: 'Biomphalaria spp.',
          disease_common_name: 'Biomphalaria Snails',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 457,
          disease_scientific_name: 'Pratylenchus spp.',
          disease_common_name: 'Lesion Nematode',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 458,
          disease_scientific_name: 'Abiotic Sunburn',
          disease_common_name: 'Abiotic Sunburn',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 459,
          disease_scientific_name: 'Abiotic Sunburn',
          disease_common_name: 'Abiotic Sunburn in Pistachio',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 460,
          disease_scientific_name: 'Nematoda',
          disease_common_name: 'Nematode',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 461,
          disease_scientific_name: 'Fertilizer Burn',
          disease_common_name: 'Fertilizer or Pesticide Burn',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 462,
          disease_scientific_name: 'Cephaleuros virescens',
          disease_common_name: 'Algal Leaf Spot',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 463,
          disease_scientific_name: 'Pomacea canaliculata',
          disease_common_name: 'Golden Apple Snail',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 464,
          disease_scientific_name: 'Healthy',
          disease_common_name: 'Healthy',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 465,
          disease_scientific_name: 'Pesticide Burn',
          disease_common_name: 'Pesticide Burn',
          disease_group: 'Other',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 466,
          disease_scientific_name: 'MYMV',
          disease_common_name: 'Mungbean Yellow Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 467,
          disease_scientific_name: 'ULCV',
          disease_common_name: 'Urd Bean Leaf Crinkle Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 468,
          disease_scientific_name: 'BCMV',
          disease_common_name: 'Bean Common Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 469,
          disease_scientific_name: 'PBND',
          disease_common_name: 'Bud Necrosis Disease',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 470,
          disease_scientific_name: 'PRSV',
          disease_common_name: 'Ring Spot Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 471,
          disease_scientific_name: 'PapMV',
          disease_common_name: 'Papaya Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 472,
          disease_scientific_name: 'CMV',
          disease_common_name: 'Cucumber Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 473,
          disease_scientific_name: 'APMV',
          disease_common_name: 'Apple Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 474,
          disease_scientific_name: 'Watermelon mosaic virus',
          disease_common_name: 'Watermelon mosaic virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 475,
          disease_scientific_name: 'CEVd',
          disease_common_name: 'Citrus Exocortis Viroid',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 476,
          disease_scientific_name: 'PNRSV Prunus necrotic ringspot virus',
          disease_common_name: 'Stecklenberger Disease',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 477,
          disease_scientific_name: 'GLD',
          disease_common_name: 'Grapevine Leafroll Disease',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 478,
          disease_scientific_name: 'PVY',
          disease_common_name: 'Potato Y Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 479,
          disease_scientific_name: 'CCDV',
          disease_common_name: 'Citrus Chlorotic Dwarf Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 480,
          disease_scientific_name: 'PLRV',
          disease_common_name: 'Potato Leafroll Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 481,
          disease_scientific_name: 'BGMV',
          disease_common_name: 'Bean Golden Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 482,
          disease_scientific_name: 'Tobacco Streak Virus',
          disease_common_name: 'Tobacco Streak Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 483,
          disease_scientific_name: 'CGMMV',
          disease_common_name: 'Cucumber Green Mottle Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 484,
          disease_scientific_name: 'MSV',
          disease_common_name: 'Maize Leaf Streak Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 485,
          disease_scientific_name: 'Plum pox virus',
          disease_common_name: 'Plum Pox Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 486,
          disease_scientific_name: 'Banana Streak Virus',
          disease_common_name: 'Banana Streak Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 487,
          disease_scientific_name: 'PVX',
          disease_common_name: 'Potato X Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 488,
          disease_scientific_name: 'CBSV',
          disease_common_name: 'Cassava Brown Streak Disease',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 489,
          disease_scientific_name: 'RTBV',
          disease_common_name: 'Tungro',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 490,
          disease_scientific_name: 'PaLCV',
          disease_common_name: 'Papaya Leaf Curl',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 491,
          disease_scientific_name: 'PPSMV',
          disease_common_name: 'Sterility Mosaic',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 493,
          disease_scientific_name: 'WDV',
          disease_common_name: 'Wheat Dwarf Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 494,
          disease_scientific_name: 'MLND',
          disease_common_name: 'Maize Lethal Necrosis Disease',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 495,
          disease_scientific_name: 'TYLCV',
          disease_common_name: 'Tomato Yellow Leaf Curl Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 496,
          disease_scientific_name: 'CMV',
          disease_common_name: 'Cucumber Mosaic Virus on Banana',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 497,
          disease_scientific_name: 'BBrMV',
          disease_common_name: 'Banana Bract Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 498,
          disease_scientific_name: 'ToMV',
          disease_common_name: 'Tomato Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 499,
          disease_scientific_name: 'Bunchy Top Virus',
          disease_common_name: 'Bunchy Top Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 500,
          disease_scientific_name: 'ACMV',
          disease_common_name: 'Cassava Mosaic Disease',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 501,
          disease_scientific_name: 'CPsV',
          disease_common_name: 'Citrus Psorosis Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 502,
          disease_scientific_name: 'RYMV',
          disease_common_name: 'Rice Yellow Mottle Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 503,
          disease_scientific_name: 'BYMV',
          disease_common_name: 'Bean Yellow Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 504,
          disease_scientific_name: 'TSWV',
          disease_common_name: 'Tomato Spotted Wilt Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 505,
          disease_scientific_name: 'OYDV',
          disease_common_name: 'Onion Yellow Dwarf Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 506,
          disease_scientific_name: 'CTV',
          disease_common_name: 'Citrus Tristeza Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 507,
          disease_scientific_name: 'SCMV',
          disease_common_name: 'Sugarcane Mosaic Virus',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 508,
          disease_scientific_name: 'Citrus leprosis virus sensu lato',
          disease_common_name: 'Citrus Leprosis',
          disease_group: 'Virus',
          farm_id: null,
          deleted: false
        },
        {
          disease_id: 509,
          disease_scientific_name: 'Striga hermonthica',
          disease_common_name: 'Striga',
          disease_group: 'Weed',
          farm_id: null,
          deleted: false
        }
      ]
    }
  },
  shiftReducer: {
    taskTypes: [
      {
        task_id: 1,
        task_name: 'Bed Preparation',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 2,
        task_name: 'Delivery',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 3,
        task_name: 'Sales',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 4,
        task_name: 'Social Event',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 5,
        task_name: 'Seeding',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 6,
        task_name: 'Fertilizing',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 7,
        task_name: 'Scouting',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 8,
        task_name: 'Harvesting',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 9,
        task_name: 'Weeding',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 10,
        task_name: 'Wash and Pack',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 11,
        task_name: 'Pest Control',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 12,
        task_name: 'Other',
        farm_id: null,
        deleted: false
      },
      {
        task_id: 13,
        task_name: '123',
        farm_id: '5763cdf4-2903-11eb-bf21-d5db06fc85bb',
        deleted: false
      }
    ],
    selectedTasks: [
      {
        task_id: 1,
        task_name: 'Bed Preparation',
        farm_id: null,
        deleted: false
      }
    ],
    availableDuration: 1.0000166666666668,
    startEndObj: {
      start: '2020-11-20T11:42:27-08:00',
      end: '2020-11-20T11:43:27-08:00',
      'break': 0,
      shiftUserId: '5fb2fbe57a371e00696833a9',
      wage: 0,
      isMulti: false
    },
    shifts: [
      {
        task_name: 'Bed Preparation',
        task_id: 1,
        shift_id: '8be69fe0-2b68-11eb-a304-6b04f62d88d1',
        is_field: true,
        field_id: 'da04b695-2e3a-4560-a0ab-cf474839a803',
        field_crop_id: null,
        field_name: null,
        crop_id: null,
        crop_common_name: null,
        variety: null,
        area_used: null,
        estimated_production: null,
        estimated_revenue: null,
        start_date: null,
        end_date: null,
        start_time: '2020-11-20T19:42:27.000Z',
        end_time: '2020-11-20T19:43:27.000Z',
        wage_at_moment: 0,
        mood: 'happy',
        break_duration: 0,
        user_id: '5fb2fbe57a371e00696833a9',
        farm_id: '5763cdf4-2903-11eb-bf21-d5db06fc85bb',
        wage: {
          type: 'hourly',
          amount: 0
        },
        first_name: 'Rafael',
        last_name: 'Davis',
        duration: 1,
        tasks: [
          {
            task_id: 1,
            duration: 1,
            field_crop_id: null,
            field_id: 'da04b695-2e3a-4560-a0ab-cf474839a803',
            is_field: true,
            shift_id: '8be69fe0-2b68-11eb-a304-6b04f62d88d1'
          }
        ]
      }
    ],
    selectedShift: {
      task_name: 'Bed Preparation',
      task_id: 1,
      shift_id: '8be69fe0-2b68-11eb-a304-6b04f62d88d1',
      is_field: true,
      field_id: 'da04b695-2e3a-4560-a0ab-cf474839a803',
      field_crop_id: null,
      field_name: null,
      crop_id: null,
      crop_common_name: null,
      variety: null,
      area_used: null,
      estimated_production: null,
      estimated_revenue: null,
      start_date: null,
      end_date: null,
      start_time: '2020-11-20T19:42:27.000Z',
      end_time: '2020-11-20T19:43:27.000Z',
      wage_at_moment: 0,
      mood: 'happy',
      break_duration: 0,
      user_id: '5fb2fbe57a371e00696833a9',
      farm_id: '5763cdf4-2903-11eb-bf21-d5db06fc85bb',
      wage: {
        type: 'hourly',
        amount: 0
      },
      first_name: 'Rafael',
      last_name: 'Davis',
      duration: 1,
      tasks: [
        {
          task_id: 1,
          duration: 1,
          field_crop_id: null,
          field_id: 'da04b695-2e3a-4560-a0ab-cf474839a803',
          is_field: true,
          shift_id: '8be69fe0-2b68-11eb-a304-6b04f62d88d1'
        }
      ]
    }
  },
  fieldReducer: {
    crops: null,
    expiredCrops: null,
    selectedField: null
  },
  insightReducer: {
    cropNutritionData: {
      preview: 0,
      data: []
    },
    soilOMData: {
      preview: 0,
      data: []
    },
    labourHappinessData: {
      preview: 0,
      data: []
    },
    biodiversityData: {
      preview: 0,
      data: []
    },
    pricesData: {
      preview: 0,
      amountOfFarms: 0,
      data: []
    },
    waterBalanceData: {
      preview: 0,
      data: []
    },
    waterBalanceSchedule: {},
    nitrogenBalanceData: {
      preview: 0,
      data: []
    },
    nitrogenFrequencyData: {},
    pricesDistance: 5
  },
  financeReducer: {
    forms: {
      addSale: {
        name: 'r'
      },
      editSale: {},
      expenseDetail: {
        '5c328490-0916-11eb-b91d-a1487041b0dd': [
          {
            note: '1',
            value: '3'
          }
        ]
      },
      date_range: null,
      forms: {
        $form: {
          initialValue: {
            addSale: {
              fieldCrop: null,
              name: null
            },
            editSale: {},
            expenseDetail: {},
            date_range: null
          },
          focus: false,
          pending: false,
          pristine: false,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: true,
          valid: false,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'financeReducer.forms',
          value: {
            addSale: {
              fieldCrop: null,
              name: null
            },
            editSale: {},
            expenseDetail: {
              '5c328490-0916-11eb-b91d-a1487041b0dd': [
                {
                  note: '',
                  value: 0
                }
              ]
            },
            date_range: null
          }
        },
        addSale: {
          $form: {
            initialValue: {
              fieldCrop: null,
              name: null
            },
            focus: false,
            pending: false,
            pristine: false,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: true,
            valid: false,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [
              {
                type: 'reset'
              }
            ],
            model: 'financeReducer.forms.addSale',
            value: {
              fieldCrop: null,
              name: null
            }
          },
          fieldCrop: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: true,
            validity: {},
            errors: {},
            intents: [],
            model: 'financeReducer.forms.addSale.fieldCrop',
            value: null
          },
          name: {
            initialValue: null,
            focus: false,
            pending: false,
            pristine: false,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: true,
            valid: true,
            validating: false,
            validated: false,
            validity: {
              required: true
            },
            errors: {
              required: false
            },
            intents: [],
            model: 'financeReducer.forms.addSale.name',
            value: 'r'
          }
        },
        editSale: {
          $form: {
            initialValue: {},
            focus: false,
            pending: false,
            pristine: true,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: false,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [],
            model: 'financeReducer.forms.editSale',
            value: {}
          }
        },
        expenseDetail: {
          '5c328490-0916-11eb-b91d-a1487041b0dd': {
            '0': {
              note: {
                initialValue: '',
                focus: false,
                pending: false,
                pristine: false,
                submitted: false,
                submitFailed: false,
                retouched: false,
                touched: true,
                valid: true,
                validating: false,
                validated: false,
                validity: {},
                errors: {},
                intents: [],
                model: 'financeReducer.forms.expenseDetail.5c328490-0916-11eb-b91d-a1487041b0dd.0.note',
                value: '1'
              },
              value: {
                initialValue: 0,
                focus: false,
                pending: false,
                pristine: false,
                submitted: false,
                submitFailed: false,
                retouched: false,
                touched: true,
                valid: true,
                validating: false,
                validated: false,
                validity: {
                  rangeUnderflow: true,
                  badInput: true
                },
                errors: {
                  rangeUnderflow: false,
                  badInput: false
                },
                intents: [],
                model: 'financeReducer.forms.expenseDetail.5c328490-0916-11eb-b91d-a1487041b0dd.0.value',
                value: '3'
              },
              $form: {
                initialValue: {
                  note: '',
                  value: 0
                },
                focus: false,
                pending: false,
                pristine: false,
                submitted: false,
                submitFailed: false,
                retouched: false,
                touched: true,
                valid: true,
                validating: false,
                validated: false,
                validity: {},
                errors: {},
                intents: [
                  {
                    type: 'validate'
                  }
                ],
                model: 'financeReducer.forms.expenseDetail.5c328490-0916-11eb-b91d-a1487041b0dd.0',
                value: {
                  note: '',
                  value: 0
                }
              }
            },
            $form: {
              initialValue: [
                {
                  note: '',
                  value: 0
                }
              ],
              focus: false,
              pending: false,
              pristine: false,
              submitted: false,
              submitFailed: false,
              retouched: false,
              touched: true,
              valid: true,
              validating: false,
              validated: false,
              validity: {},
              errors: {},
              intents: [
                {
                  type: 'validate'
                }
              ],
              model: 'financeReducer.forms.expenseDetail.5c328490-0916-11eb-b91d-a1487041b0dd',
              value: [
                {
                  note: '',
                  value: 0
                }
              ]
            }
          },
          $form: {
            initialValue: {},
            focus: false,
            pending: false,
            pristine: false,
            submitted: false,
            submitFailed: false,
            retouched: false,
            touched: true,
            valid: true,
            validating: false,
            validated: false,
            validity: {},
            errors: {},
            intents: [
              {
                type: 'validate'
              }
            ],
            model: 'financeReducer.forms.expenseDetail',
            value: {
              '5c328490-0916-11eb-b91d-a1487041b0dd': [
                {
                  note: '',
                  value: 0
                }
              ]
            }
          }
        },
        date_range: {
          initialValue: null,
          focus: false,
          pending: false,
          pristine: true,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: false,
          valid: true,
          validating: false,
          validated: false,
          validity: {},
          errors: {},
          intents: [],
          model: 'financeReducer.forms.date_range',
          value: null
        }
      }
    },
    financeReducer: {
      sales: [],
      cropSales: null,
      shifts: [],
      fieldCrops: [],
      date_range: {
        startDate: '2020-01-01T08:00:00.000Z',
        endDate: '2021-01-01T07:59:59.999Z'
      },
      expenses: [
        {
          farm_id: 'dd092ccc-28fb-11eb-bf21-d5db06fc85bb',
          expense_date: '2020-11-20T19:03:00.479Z',
          picture: null,
          note: '1',
          expense_type_id: '5c328490-0916-11eb-b91d-a1487041b0dd',
          farm_expense_id: '073c1900-2b63-11eb-a304-6b04f62d88d1',
          value: 3,
          deleted: false
        }
      ],
      expense_types: [
        {
          expense_name: 'Equipment',
          farm_id: null,
          expense_type_id: '5c328490-0916-11eb-b91d-a1487041b0dd',
          deleted: false
        },
        {
          expense_name: 'Fertilizer',
          farm_id: null,
          expense_type_id: '5c328491-0916-11eb-b91d-a1487041b0dd',
          deleted: false
        },
        {
          expense_name: 'Pesticide',
          farm_id: null,
          expense_type_id: '5c328492-0916-11eb-b91d-a1487041b0dd',
          deleted: false
        },
        {
          expense_name: 'Fuel',
          farm_id: null,
          expense_type_id: '5c328493-0916-11eb-b91d-a1487041b0dd',
          deleted: false
        },
        {
          expense_name: 'Machinery',
          farm_id: null,
          expense_type_id: '5c328494-0916-11eb-b91d-a1487041b0dd',
          deleted: false
        },
        {
          expense_name: 'Land',
          farm_id: null,
          expense_type_id: '5c328495-0916-11eb-b91d-a1487041b0dd',
          deleted: false
        },
        {
          expense_name: 'Seeds',
          farm_id: null,
          expense_type_id: '5c328496-0916-11eb-b91d-a1487041b0dd',
          deleted: false
        },
        {
          expense_name: 'Other',
          farm_id: null,
          expense_type_id: '5c328497-0916-11eb-b91d-a1487041b0dd',
          deleted: false
        }
      ],
      selected_expense: [
        '5c328490-0916-11eb-b91d-a1487041b0dd'
      ]
    }
  },
  farmReducer: {
    farm_data_schedule: null
  },
  _persist: {
    version: -1,
    rehydrated: true
  }
}