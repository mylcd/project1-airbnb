import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import filledStar from './icons8-star-filled-50.png';
import unfilledStar from './icons8-star-notfilled-50.png'
import './ReviewFormModal.css';
import { createReview, getSpotReviews, getSpotDetails } from '../../store/spot';

function ReviewFormModal({ spotId }) {
  const dispatch = useDispatch();
  const [review, setReview] = useState("");
  const [star, setStar] = useState(0);
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const response = await dispatch(createReview({ spotId, review, stars: star }))
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.message) {
          setErrors(data);
        }
      }
    );
    if(response) {
      await dispatch(getSpotDetails({ spotId }));
      return dispatch(getSpotReviews({ spotId }))
        .then(closeModal);
    }
  };

  return (
    <div className='modal'>
      <h1 className='removemargin'>How was your stay?</h1>
      <form style={{marginLeft: "10px", marginRight: "10px"}} onSubmit={handleSubmit}>
        {errors.message && (
          <p className='errors removemargin'>{errors.message}</p>
        )}
        <div>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            name="review" rows="5"
            placeholder='Leave your review here...'
            required
          />
        </div>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
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
          <label style={{fontSize: "36px"}}>Stars</label>
        </div>

        <button className='pagebutton' style={{marginTop: "10px", marginBottom: "10px"}}
          type="submit" disabled={review.length < 10 || star == 0}>
            Submit Your Review
        </button>
      </form>
    </div>
  );
}

export default ReviewFormModal;
