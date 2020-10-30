import styles from "./styles.scss";
import Form from "../Form";
import Button from "../Form/Button";
import clsx from "clsx";
import Radio from "../Form/Radio";
import OverlayTooltip from "../Tooltip";
import Underlined from "../Underlined";
import PropTypes from "prop-types";
import React from "react";

export default function PureInterestedOrganic({ title, paragraph, inputs = [{}, {}], onSubmit, onGoBack, underlined, content }) {
  const { title: titleClass, ...inputClasses } = styles;
  return <Form onSubmit={onSubmit} buttonGroup={
    <><Button onClick={onGoBack} color={'secondary'} fullLength>Go Back</Button><Button type={'submit'} fullLength>Continue</Button></>
  }>
    <h4 className={clsx(styles.title)}>{title}</h4>
    <p className={clsx(styles.paragraph)}>{paragraph}</p>
    <Radio {...inputs[0]} checked={true} />
    <Radio classes={inputClasses} {...inputs[1]} />
    <OverlayTooltip content={content}>
      <Underlined>
        {underlined}
      </Underlined>
    </OverlayTooltip>
  </Form>
}

PureInterestedOrganic.prototype = {
  onSubmit: PropTypes.func,
  inputs: PropTypes.arrayOf(PropTypes.exact({ label: PropTypes.string, info: PropTypes.string, icon: PropTypes.node })),
}
