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
      farm_name: 'test',
      address: 'Hvidovrevej 335, 2650 Hvidovre, Denmark',
      gridPoints: {
        lat: 55.62889000000001,
        lng: 12.482343
      },
      unit: {
        value: 'metric',
        label: 'Metric'
      },
      currency: {
        value: 'USD',
        label: 'USD'
      },
      date: 'MM/DD/YY',
      sandbox: true
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
        pending: true,
        pristine: false,
        submitted: false,
        submitFailed: false,
        retouched: false,
        touched: true,
        valid: true,
        validating: false,
        validated: true,
        validity: {
          hasAddress: true
        },
        errors: {
          hasAddress: false
        },
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
            gridPoints: {
              lat: 55.62889000000001,
              lng: 12.482343
            },
            unit: {
              label: 'Metric'
            },
            currency: {
              label: 'USD'
            },
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
            pending: true,
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
            pending: true,
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
            pending: true,
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
          pending: true,
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
              type: 'reset'
            }
          ],
          model: 'profileForms.farm',
          value: {
            farm_name: '',
            address: '',
            gridPoints: {
              lat: 55.62889000000001,
              lng: 12.482343
            },
            unit: {
              label: 'Metric'
            },
            currency: {
              label: 'USD'
            },
            date: 'MM/DD/YY',
            sandbox: false
          }
        },
        farm_name: {
          initialValue: '',
          focus: false,
          pending: true,
          pristine: false,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: true,
          valid: true,
          validating: false,
          validated: false,
          validity: {
            required: true,
            length: true
          },
          errors: {
            required: false,
            length: false
          },
          intents: [],
          model: 'profileForms.farm.farm_name',
          value: 'test'
        },
        address: {
          initialValue: '',
          focus: false,
          pending: true,
          pristine: false,
          submitted: false,
          submitFailed: false,
          retouched: false,
          touched: true,
          valid: true,
          validating: false,
          validated: true,
          validity: {
            required: true,
            length: true
          },
          errors: {
            required: false,
            length: false
          },
          intents: [],
          model: 'profileForms.farm.address',
          value: 'Hvidovrevej 335, 2650 Hvidovre, Denmark'
        },
        gridPoints: {
          lat: {
            initialValue: 55.62889000000001,
            focus: false,
            pending: true,
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
            model: 'profileForms.farm.gridPoints.lat',
            value: 55.62889000000001
          },
          lng: {
            initialValue: 12.482343,
            focus: false,
            pending: true,
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
            model: 'profileForms.farm.gridPoints.lng',
            value: 12.482343
          },
          $form: {
            initialValue: {},
            focus: false,
            pending: true,
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
            model: 'profileForms.farm.gridPoints',
            value: {
              lat: 55.62889000000001,
              lng: 12.482343
            }
          }
        },
        unit: {
          value: {
            '0': 'm',
            '1': 'e',
            '2': 't',
            '3': 'r',
            '4': 'i',
            '5': 'c',
            validated: false,
            retouched: false,
            intents: [
              {
                type: 'validate'
              }
            ],
            pristine: false,
            value: 'metric',
            pending: true,
            submitted: false,
            submitFailed: false
          },
          label: {
            initialValue: 'Metric',
            focus: false,
            pending: true,
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
            model: 'profileForms.farm.unit.label',
            value: 'Metric'
          },
          $form: {
            focus: false,
            pending: true,
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
            value: {
              value: 'metric',
              label: 'Metric'
            }
          }
        },
        currency: {
          value: {
            '0': 'C',
            '1': 'A',
            '2': 'D',
            validated: false,
            retouched: false,
            intents: [
              {
                type: 'validate'
              }
            ],
            pristine: false,
            value: 'USD',
            pending: true,
            submitted: false,
            submitFailed: false
          },
          label: {
            initialValue: 'USD',
            focus: false,
            pending: true,
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
            model: 'profileForms.farm.currency.label',
            value: 'USD'
          },
          $form: {
            focus: false,
            pending: true,
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
            value: {
              value: 'USD',
              label: 'USD'
            }
          }
        },
        date: {
          initialValue: 'MM/DD/YY',
          focus: false,
          pending: true,
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
          model: 'profileForms.farm.date',
          value: 'MM/DD/YY'
        },
        sandbox: {
          initialValue: false,
          focus: false,
          pending: true,
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
          model: 'profileForms.farm.sandbox',
          value: true
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
            pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
            pending: true,
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
            pending: true,
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
            pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
          pending: true,
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
  certifierSurveyReducer: {},
  baseReducer: {
    users: {
      user_id: '5f9941ae262b5a006e7f19cb',
      farm_id: 'b50d4d22-1904-11eb-abda-6bb0262dbf13',
      role_id: 1,
      has_consent: true,
      created_at: '2020-10-28T10:02:28.979Z',
      first_name: 'Rafael',
      last_name: 'Davis',
      profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
      email: 'f84095701@nwytg.net',
      phone_number: null,
      status: 'Active',
      consent_version: '3.0',
      wage: {
        type: 'hourly',
        amount: 0
      }
    },
    farm: {
      user_id: '5f9941ae262b5a006e7f19cb',
      farm_id: 'b50d4d22-1904-11eb-abda-6bb0262dbf13',
      role_id: 1,
      has_consent: true,
      created_at: '2020-10-28T10:02:28.979Z',
      status: 'Active',
      consent_version: '3.0',
      wage: {
        type: 'hourly',
        amount: 0
      },
      role: 'Owner',
      deleted: false,
      first_name: 'Rafael',
      last_name: 'Davis',
      profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
      email: 'f84095701@nwytg.net',
      phone_number: null,
      address: 'Hvidovrevej 335, 2650 Hvidovre, Denmark',
      notification_setting: {
        alert_pest: true,
        alert_weather: true,
        alert_worker_finish: true,
        alert_before_planned_date: true,
        alert_action_after_scouting: true
      },
      updated_at: '2020-10-28T10:02:28.979Z',
      farm_name: 'test',
      units: {
        currency: 'USD',
        measurement: 'metric'
      },
      grid_points: {
        lat: 55.62889000000001,
        lng: 12.482343
      },
      sandbox_bool: true
    },
    fields: [],
    fieldCrops: [],
    consent_version: null
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
              field: null
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
            validated: false,
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
            validated: false,
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
            intents: [],
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
            intents: [],
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
            intents: [],
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
            intents: [],
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
            intents: [],
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
            intents: [],
            model: 'logReducer.forms.fertLog.k_percentage',
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
            model: 'logReducer.forms.fertLog.field',
            value: null
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
            model: 'logReducer.forms.fieldWorkLog',
            value: {
              type: null,
              notes: '',
              field: null
            }
          },
          type: {
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
            model: 'logReducer.forms.fieldWorkLog.type',
            value: null
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
            model: 'logReducer.forms.fieldWorkLog.notes',
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
            model: 'logReducer.forms.fieldWorkLog.field',
            value: null
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
      logs: null
    },
    fertReducer: {
      fertilizers: null
    },
    pestControlReducer: {
      pesticides: null,
      diseases: null
    }
  },
  notificationReducer: {
    user: null
  },
  peopleReducer: {
    workers: [],
    admins: [],
    farm_id: null,
    addedUser: false,
    owners: [],
    managers: [],
    extensionOfficers: [],
    pseudoWorkers: [],
    roles: []
  },
  shiftReducer: {
    taskTypes: [],
    selectedTasks: [],
    availableDuration: 0,
    startEndObj: {},
    shifts: null,
    selectedShift: {}
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
      addSale: {},
      editSale: {},
      expenseDetail: {},
      date_range: null,
      forms: {
        $form: {
          initialValue: {
            addSale: {},
            editSale: {},
            expenseDetail: {},
            date_range: null
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
          model: 'financeReducer.forms',
          value: {
            addSale: {},
            editSale: {},
            expenseDetail: {},
            date_range: null
          }
        },
        addSale: {
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
            model: 'financeReducer.forms.addSale',
            value: {}
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
            model: 'financeReducer.forms.expenseDetail',
            value: {}
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
      sales: null,
      cropSales: null,
      shifts: null,
      fieldCrops: []
    }
  },
  farmReducer: {
    farm_data_schedule: null
  },
  userFarmReducer: {
    farms: [
      {
        user_id: '5f9941ae262b5a006e7f19cb',
        farm_id: 'b50d4d22-1904-11eb-abda-6bb0262dbf13',
        role_id: 1,
        has_consent: true,
        created_at: '2020-10-28T10:02:28.979Z',
        status: 'Active',
        consent_version: '3.0',
        wage: {
          type: 'hourly',
          amount: 0
        },
        role: 'Owner',
        deleted: false,
        first_name: 'Rafael',
        last_name: 'Davis',
        profile_picture: 'https://cdn.auth0.com/avatars/f8.png',
        email: 'f84095701@nwytg.net',
        phone_number: null,
        address: 'Hvidovrevej 335, 2650 Hvidovre, Denmark',
        notification_setting: {
          alert_pest: true,
          alert_weather: true,
          alert_worker_finish: true,
          alert_before_planned_date: true,
          alert_action_after_scouting: true
        },
        updated_at: '2020-10-28T10:02:28.979Z',
        farm_name: 'test',
        units: {
          currency: 'USD',
          measurement: 'metric'
        },
        grid_points: {
          lat: 55.62889000000001,
          lng: 12.482343
        },
        sandbox_bool: true
      }
    ]
  },
  _persist: {
    version: -1,
    rehydrated: true
  }
}