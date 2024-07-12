import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import filledStar from './icons8-star-filled-50.png';
import unfilledStar from './icons8-star-notfilled-50.png'
import './ReviewFormModal.css';
import { createReview } from '../../store/spot';

function ReviewFormModal({ spotId }) {
  const dispatch = useDispatch();
  const [review, setReview] = useState("");
  const [star, setStar] = useState(0);
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(createReview({ spotId, review, stars: star }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.message) {
          setErrors(data);
        }
      }
    );
  };

  return (
    <>
      <h1>How was your stay?</h1>
      <form onSubmit={handleSubmit}>
        {errors.message && (
          <p>{errors.message}</p>
        )}
        <div><input
          type="text"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          required
        /></div>
        <div>
          <button type='button' className='star-button' onMouseEnter={() => setStar(1)}>
            {star >= 1 ? <img className='star-image' src={filledStar}/> : <img className='star-image' src={unfilledStar}/>}
          </button>
          <button type='button' className='star-button' onMouseEnter={() => setStar(2)}>
            {star >= 2 ? <img className='star-image' src={filledStar}/> : <img className='star-image' src={unfilledStar}/>}
          </button>
          <button type='button' className='star-button' onMouseEnter={() => setStar(3)}>
            {star >= 3 ? <img className='star-image' src={filledStar}/> : <img className='star-image' src={unfilledStar}/>}
          </button>
          <button type='button' className='star-button' onMouseEnter={() => setStar(4)}>
            {star >= 4 ? <img className='star-image' src={filledStar}/> : <img className='star-image' src={unfilledStar}/>}
          </button>
          <button type='button' className='star-button' onMouseEnter={() => setStar(5)}>
            {star >= 5 ? <img className='star-image' src={filledStar}/> : <img className='star-image' src={unfilledStar}/>}
          </button>
        </div>

        <button type="submit" disabled={review.length < 10}>Submit Your Review</button>
      </form>
    </>
  );
}

export default ReviewFormModal;
