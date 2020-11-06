import Form from "../Form";
import Button from "../Form/Button";
import Radio from "../Form/Radio";
import React from "react";
import { Title } from '../Typography';

export default function PureRoleSelection({ onSubmit, title, inputs, inputClasses = {},  redirectConsent}) {
  return (
    <Form onSubmit={onSubmit} buttonGroup={<Button type={'submit'} fullLength onClick={redirectConsent}>Continue</Button>}>
      <h4 className={clsx(styles.headerStyle)}>{title}</h4>
      <Radio classes={inputClasses} {...inputs[0]} />
      <Radio classes={inputClasses} {...inputs[1]} />
      <Radio classes={inputClasses} {...inputs[2]} />
    </Form>
  );
}
