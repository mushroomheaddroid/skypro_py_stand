import styles from "./Button.module.scss";
import cn from "classnames";
import Loader from "../loader/Loader";

export const Button = ({ type, label, loading, onClick }) => {
  return (
    <button
      className={cn(styles.Button, type === "dark" ? styles.Button_type_dark : styles.Button_type_light, loading && styles.Button_type_transparent)}
      onClick={onClick}
      disabled={loading}
    >
      {loading && <Loader />}
      {label}
    </button>
  )
};

export default Button;