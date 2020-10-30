import styles from "./home.scss";
import PropTypes from "prop-types";
import React from "react";

export default function PureHome({ title, children, imgUrl }) {
  return <div className={styles.container} style={{ backgroundImage: `url("${imgUrl}")` }}>
    <h3 className={styles.title}>{title}</h3>
    {children}
  </div>
}

PureHome.prototype = {
  onClick: PropTypes.func,
}
