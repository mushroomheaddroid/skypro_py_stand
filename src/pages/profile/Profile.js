import styles from "./Profile.module.scss";
import Header from "../../components/header/Header";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import { useEffect, useState } from "react";
import { getUser, updateUser, updateUserPassword } from "../../api/user";
import { tokenChecker, tokenObserver } from "../../utils/token";
import { getGenres } from "../../api/genres";
import Select from "../../components/select/Select";
import Loader from "../../components/loader/Loader";

export const Profile = () => {
  const [isUserLoading, setUserLoading] = useState(true);
  const [isGenresLoading, setGenresLoading] = useState(true);
  const [isFormLoading, setFormLoading] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [genre, setGenre] = useState([]);
  const [genres, setGenres] = useState("");
  const [password, setPassword] = useState({old: "", new: ""});
  const [email, setEmail] = useState("");

  useEffect(() => {
    tokenObserver();

    return () => {
      clearInterval(window.interval);
    }
  }, []);

  useEffect(() => {
    getUser()
      .then(res => {
        setUserLoading(false);
        profileUpdater(res.data);
      })
      .catch(error => {
        setUserLoading(true);
        tokenChecker(error);
      });

    getGenres()
      .then(res => {
        setGenresLoading(false);
        setGenres(res.data);
      })
      .catch(error => {
        setGenresLoading(true);
        tokenChecker(error);
      });
  }, []);

  const profileUpdater = (data) => {
    setEmail(data.email || "");
    setName(data.name || "");
    setSurname(data.surname || "");
    setGenre(data.favourite_genre || "");
  };

  const submitPasswordChange = () => {
    setFormLoading(true);
    updateUserPassword( {password_1: password.old, password_2: password.new})
      .then(res => {
        setFormLoading(false);
        profileUpdater(res.data)
      })
      .catch(error => {
        setFormLoading(true);
        tokenChecker(error);
        console.error(error.response);
      })
  };

  const submitProfileUpdate = () => {
    setFormLoading(true);
    updateUser({
      ...(name && {name: name}),
      ...(surname && {surname: surname}),
      ...(genre && {favourite_genre: genre}),
    })
      .then(() => {
        setFormLoading(false);
      })
      .catch(error => {
        setFormLoading(true);
        tokenChecker(error);
        console.log(error.response)
      });
  };

  return (
    <div className={styles.Profile}>
      <Header
        title="Мой профиль"
        subtitle="Sky movies"
        type="secondary"
      />
      {(isUserLoading && isGenresLoading) &&
        <div className={styles.Profile__loader}>
          <Loader />
        </div>
      }
      {!(isUserLoading && isGenresLoading) &&
        <div>
          <div className={styles.Profile__email}>{email}</div>

          <div className={styles.Profile__form}>
            <Input
              type="text"
              value={name}
              placeholder="Имя"
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="text"
              value={surname}
              placeholder="Фамилия"
              onChange={(e) => setSurname(e.target.value)}
            />

            <Select
              options={genres}
              selected={genre}
              onChange={(e) => {
                setGenre(e.target.value)
              }}
            />

            <Button
              loading={isFormLoading}
              label="Сохранить"
              onClick={submitProfileUpdate}
            />

            <div className={styles.Profile__heading}>Сменить пароль</div>

            <Input
              type="password"
              value={password.old}
              placeholder="Старый пароль"
              onChange={(e) => setPassword({new: password.new, old: e.target.value})}
            />

            <Input
              type="password"
              value={password.new}
              placeholder="Новый пароль"
              onChange={(e) => setPassword({new: e.target.value, old: password.old})}
            />

            <Button
              loading={isFormLoading}
              label="Сохранить"
              onClick={submitPasswordChange}
            />
          </div>
        </div>
      }
    </div>
  )
}

export default Profile;