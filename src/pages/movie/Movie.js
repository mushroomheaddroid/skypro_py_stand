import styles from "./Movie.module.scss";
import { useParams } from 'react-router-dom';
import { deleteFavorites, getFavorites, setFavorites } from "../../api/user";
import { useEffect, useState } from "react";
import { getMovies, getMovie } from "../../api/movies";
import { getYoutubePreview } from "../../utils/utils";
import { tokenChecker, tokenObserver } from "../../utils/token";
import { getCookie } from "../../utils/cookies";
import Button from "../../components/button/Button";
import Heading from "../../components/heading/Heading";
import MovieCardSet from "../../components/movieCardSet/MovieCardSet";

import Loader from "../../components/loader/Loader";
import EmptyBlock from "../../components/emptyBlock/EmptyBlock";

export const Movie = () => {
  const [movies, setMovies] = useState({loading: true, content: []});
  const [movie, setMovie] = useState({loading: true, content: {}});
  const [isBookmarked, setIsBookmarked] = useState({loading: false, status: false});
  const { id } = useParams();

  useEffect(() => {
    tokenObserver();

    return () => {
      clearInterval(window.interval);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsBookmarked({loading: true, status: isBookmarked.status})
    getFavorites()
      .then(res => {
        setIsBookmarked({loading: false, status: res.data.find(item => item.id === Number(id))});
      })
      .catch(error => {
        tokenChecker(error);
        console.error(error.response);
      })
  }, [id]);

  useEffect(() => {
    setMovie({loading: true, content: []})
    getMovie(id)
      .then(res => {
        setMovie({loading: false, content: res.data});
      })
      .catch(error => {
        tokenChecker(error);
        console.log(error.response);
      });

    setMovies({loading: true, content: movies.content})
    getMovies()
      .then(res => {
        setMovies({loading: false, content: res.data});
      })
      .catch(error => {
        tokenChecker(error);
        console.log(error.response);
      });
  }, [id]);

  const toggleBookmark = () => {
    setIsBookmarked({loading: true, status: isBookmarked.status});

    isBookmarked.status ?
      deleteFavorites(id)
        .then(() => {
          setIsBookmarked({loading: false, status: false});
        })
        .catch(error => {
          tokenChecker(error);
          console.error(error.response);
        })
      :
      setFavorites(id)
        .then(() => {
          setIsBookmarked({loading: false, status: true});
        })
        .catch(error => {
          tokenChecker(error);
          console.error(error.response);
        })
  };

  const moviesByGenre = () => {
    return movies.content.filter(item => (item.genre.id === movie.content.genre.id) && (item.id !== movie.content.id))
  }

  return(
    <div className={styles.Movie}>
      <div className={styles.Cover}>
        <div className={styles.Cover__information}>
          <div className={styles.Cover__title}>{movie.content.title}</div>
          <div className={styles.Cover__data}>
            <span>{movie.content.year}</span><span>{movie.content.rating}</span>
          </div>
        </div>
        <div className={styles.Cover__layer} />
        { movie.content.trailer &&
          <div className={styles.Cover__covers}>
            <img className={styles.Cover__background} src={getYoutubePreview(movie.content.trailer)} alt="Cover"/>
            <div className={styles.Cover__backdrop} />
            <img className={styles.Cover__image} src={getYoutubePreview(movie.content.trailer)} alt="Cover"/>
          </div>
        }
      </div>

      <div className={styles.Movie__wrapper}>
        <div className={styles.Movie__description}>
          {movie.content.description}
        </div>

        {!(movies.loading && movie.loading) &&
          <div className={styles.Movie__actions}>
            {movie.content.trailer &&
              <Button
                label="Смотреть"
                type="dark"
                onClick={() => {
                  window.open(movie.content.trailer, "_blank");
                }}
              />
            }
            {getCookie("AccessToken") &&
              <Button
                label={isBookmarked.status ? "Удалить из избранного" : "Добавить в избранное"}
                loading={isBookmarked.loading}
                type="dark"
                onClick={toggleBookmark}
              />}
          </div>
        }

        {movies.loading || movie.loading ?
          <Loader />
          :
          <div className={styles.Movie__selection}>
            <Heading label="Похожие фильмы"/>
            {moviesByGenre().length > 0 ?
              <MovieCardSet
                movies={moviesByGenre()}
                limit={4}
              />
              :
              <EmptyBlock/>
            }
          </div>
        }

      </div>
    </div>
  )
}

export default Movie;