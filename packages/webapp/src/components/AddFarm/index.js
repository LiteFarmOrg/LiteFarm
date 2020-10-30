import styles from "./styles.scss";
import Form from "../Form";
import Button from "../Form/Button";
import clsx from "clsx";
import Input from "../Form/Input";
import PropTypes from "prop-types";
import React from "react";

export default function PureAddFarm({ title, inputs = [{}, {}], onSubmit }) {
  const { title: titleClass, ...inputClasses } = styles;
  return <Form onSubmit={onSubmit} buttonGroup={<Button type={'submit'} fullLength>Continue</Button>}>
    <h4 className={clsx(styles.title)}>{title}</h4>
    <Input classes={inputClasses} {...inputs[0]} />
    <Input classes={inputClasses} {...inputs[1]} />
  </Form>
}

PureAddFarm.prototype = {
  onSubmit: PropTypes.func,
  inputs: PropTypes.arrayOf(PropTypes.exact({ label: PropTypes.string, info: PropTypes.string, icon: PropTypes.node })),
}
