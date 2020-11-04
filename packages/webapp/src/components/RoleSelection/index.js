import Form from "../Form";
import Button from "../Form/Button";
import Radio from "../Form/Radio";
import React from "react";
import { Title } from '../Typography';

export default function PureRoleSelection({ onSubmit, title, inputs, inputClasses = '' }) {
  return (
    <Form onSubmit={onSubmit} buttonGroup={<Button type={'submit'} fullLength>Continue</Button>}>
      <Title>{title}</Title>
      <Radio classes={inputClasses} {...inputs[0]} />
      <Radio classes={inputClasses} {...inputs[1]} />
      <Radio classes={inputClasses} {...inputs[2]} />
    </Form>
  );
}
