import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import TextButton from '../Form/Button/TextButton';
import styles from './styles.module.scss';

const CardsCarrousel = ({ cards }) => {
  const [activeCard, setActiveCard] = useState(cards[0]);
  const [sortedCards, setSortedCards] = useState(cards);

  const sortCards = (selectedCard) => {
    return [selectedCard, ...cards.filter((card) => card.id !== selectedCard.id)];
  };

  useEffect(() => {
    const newActiveCard = cards.find((card) => card.id === activeCard.id);
    const newSortedCards = sortCards(newActiveCard);
    setActiveCard(newActiveCard);
    setSortedCards(newSortedCards);
  }, [cards]);

  const onCardClick = (selectedCard) => {
    setActiveCard(selectedCard);
    setSortedCards(sortCards(selectedCard));
  };

  return (
    <div>
      <div className={styles.carrouselContainer}>
        {sortedCards.map((card, index) => {
          const isActive = activeCard.id === card.id;
          return isActive ? (
            <div
              key={card.id}
              className={clsx([styles.card, styles.activeCard])}
              style={{
                marginTop: index * 8,
                marginBottom: index * 8,
                zIndex: sortedCards.length - index,
              }}
            >
              {card.activeContent}
            </div>
          ) : (
            <TextButton
              key={card.id}
              onClick={() => onCardClick(card)}
              className={clsx([styles.card, styles.inactiveCard])}
              style={{
                marginTop: index * 8,
                marginBottom: index * 8,
                backgroundColor: card.inactiveBackgroundColor,
                zIndex: sortedCards.length - index,
              }}
            >
              <div className={styles.inactiveIcon}>{card.inactiveIcon}</div>
            </TextButton>
          );
        })}
      </div>
      <p className={styles.cardNote} style={{ color: activeCard.noteColor }}>
        {activeCard.note}
      </p>
    </div>
  );
};

CardsCarrousel.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      inactiveBackgroundColor: PropTypes.string,
      inactiveIcon: PropTypes.node,
      activeContent: PropTypes.node,
      note: PropTypes.string,
      noteColor: PropTypes.string,
    }),
  ).isRequired,
};

export default CardsCarrousel;
