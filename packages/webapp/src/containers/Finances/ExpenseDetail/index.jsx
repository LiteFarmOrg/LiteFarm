import React, { useState, useEffect } from 'react';
import moment from 'moment';
import PageTitle from '../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../styles.module.scss';
import styles from './styles.module.scss';
import { expenseSelector, expenseToDetailSelector, allExpenseTypeSelector } from '../selectors';
import { tempDeleteExpense, tempSetEditExpense } from '../actions';
import history from '../../../history';
import ConfirmModal from '../../../components/Modals/Confirm';
import { userFarmSelector } from '../../userFarmSlice';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import DropdownButton from '../../../components/Form/DropDownButton';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import { useSelector, useDispatch } from 'react-redux';

const ExpenseDetail = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [date, setDate] = useState(null);
  const [expenseItems, setExpenseItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const expenses = useSelector(expenseSelector);
  const expenseTypes = useSelector(allExpenseTypeSelector);
  const farm = useSelector(userFarmSelector);
  const expense = useSelector(expenseToDetailSelector);

  useEffect(() => {
    const language = getLanguageFromLocalStorage();
    const dateValue = moment(expense.expense_date).locale(language).format('MMM DD, YYYY');
    setDate(dateValue);
    getExpensesByDate();
  }, []);

  const currencySymbol = useCurrencySymbol();

  const getExpensesByDate = () => {
    let targetDate = moment(expense.expense_date).format('YYYY-MM-DD');
    let dict = {};
    let total = 0;
    let filteredExpenses = [];
    for (let e of expenses) {
      let expenseDate = moment(e.expense_date).format('YYYY-MM-DD');
      if (targetDate === expenseDate) {
        let id = e.expense_type_id;
        total += parseFloat(e.value);
        filteredExpenses.push(e);
        if (!dict.hasOwnProperty(id)) {
          dict[id] = {
            type_name: getExpenseType(id),
            items: [
              {
                note: e.note,
                value: e.value,
              },
            ],
          };
        } else {
          dict[id].items.push({
            note: e.note,
            value: e.value,
          });
        }
      }
    }

    setExpenseItems(Object.values(dict));
    setTotal(total.toFixed(2));
    setFilteredExpenses(filteredExpenses);
  };

  const getExpenseType = (id) => {
    for (let type of expenseTypes) {
      if (type.expense_type_id === id) {
        return t(`expense:${type.expense_translation_key}`);
      }
    }
    return 'TYPE_NOT_FOUND';
  };

  const handleDeleteExpenses = () => {
    setShowModal(true);
  };

  // TODO: replace when expense items are split by expense
  const deleteExpense = () => {
    dispatch(tempDeleteExpense(expense.expense_item_id));
  };
  // deleteExpenses = () => {
  //   // eslint-disable-next-line
  //   let farmIDs = [];
  //   for (let f of filteredExpenses) {
  //     farmIDs.push(f.farm_expense_id);
  //   }
  //   if (farmIDs.length > 0) {
  //     dispatch(deleteExpenses(farmIDs));
  //     history.push('/other_expense');
  //   }
  // };

  //TODO remove edit expense related functions
  const editExpense = () => {
    // editExpenses() {
    // TODO: use the commented out code for when expense items are split by expense
    // dispatch(setEditExpenses(filteredExpenses));
    // history.push('/edit_expense_categories');

    // temporary implementation to edit expense items separately
    dispatch(tempSetEditExpense(expense));
    history.push('/edit_expense');
  };

  const dropDown = 0;
  const options = [
    {
      text: t('common:EDIT'),
      onClick: () => editExpense(),
    },
    { text: t('common:DELETE'), onClick: () => handleDeleteExpenses() },
  ];

  return (
    <div className={defaultStyles.financesContainer}>
      <PageTitle backUrl="/other_expense" title={t('SALE.EXPENSE_DETAIL.TITLE')} />
      <div className={styles.innerInfo}>
        <h4>{date}</h4>
        <DropdownButton options={options}>{t('SALE.EXPENSE_DETAIL.ACTION')}</DropdownButton>
      </div>

      <div className={styles.itemContainer}>
        <Semibold>{t('SALE.EXPENSE_DETAIL.DESCRIPTION')}</Semibold>
        <div>{t('SALE.EXPENSE_DETAIL.COST')}</div>
      </div>
      {/* {expenseItems.length > 0 &&
          expenseItems.map((e) => {
            return (
              <div key={e.type_name}>
                <div className={styles.typeNameContainer}>
                  <Semibold>{e.type_name}</Semibold>
                </div>
                {e.items.length > 0 &&
                  e.items.map((i) => {
                    return (
                      <div key={i.note + i.value.toString()} className={styles.itemContainer}>
                        <div>{'- ' + i.note}</div>
                        <div className={styles.greenText}>
                          {currencySymbol + i.value.toFixed(2).toString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })} */}
      <div key={expense.type}>
        <div className={styles.typeNameContainer}>
          <Semibold>{expense.type}</Semibold>
        </div>
        <div key={expense.note + expense.amount.toString()} className={styles.itemContainer}>
          <div style={{ overflowWrap: 'anywhere' }}>{'- ' + expense.note}</div>
          <div className={styles.greenText}>{expense.amount}</div>
        </div>
      </div>
      {/* <div className={styles.itemContainer}>
          <Semibold>{t('SALE.EXPENSE_DETAIL.TOTAL')}</Semibold>
          <div className={styles.greenText} id="total-amount">
            {currencySymbol + total}
          </div>
        </div> */}
      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          deleteExpense();
          setShowModal(false);
        }}
        message={t('SALE.EXPENSE_DETAIL.TEMP_DELETE_CONFIRMATION')}
      />
    </div>
  );
};

export default ExpenseDetail;
