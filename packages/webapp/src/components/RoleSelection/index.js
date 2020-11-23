import Form from "../Form";
import Button from "../Form/Button";
import clsx from "clsx";
import styles from "./styles.scss";
import Radio from "../Form/Radio";
import React from "react";
import { Title } from '../Typography';

export default function PureRoleSelection({ onSubmit, title, inputs, inputClasses = {},  redirectConsent, onGoBack}) {
  return (
    <Form onSubmit={onSubmit} buttonGroup={<>
      <Button onClick={onGoBack} color={'secondary'} fullLength>Go Back</Button>
      <Button type={'submit'} fullLength onClick={redirectConsent}>Continue</Button>
    </>}>
      <Title>{title}</Title>
      <Radio classes={inputClasses} {...inputs[0]} />
      <Radio classes={inputClasses} {...inputs[1]} />
      <Radio classes={inputClasses} {...inputs[2]} />
    </Form>
  );
}
