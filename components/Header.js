import Link from "next/link";

import styles from "./Header.module.css";

const Header = props => (
  <Link href="/">
    <div className={styles.Header}>{props.appTitle}</div>
  </Link>
);

export default Header;