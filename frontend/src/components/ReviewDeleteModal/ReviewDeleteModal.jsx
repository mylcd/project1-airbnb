import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { deleteReview } from '../../store/review';
import { getSpotReviews, getSpotDetails } from '../../store/spot';

function ReviewDeleteModal({ reviewId, spotId }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleDelete = async (e) => {
    e.preventDefault();
    await dispatch(deleteReview({ reviewId }));
    await dispatch(getSpotDetails({ spotId }));
    return dispatch(getSpotReviews({ spotId }))
    .then(closeModal);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    closeModal();
  };

  return (
    <div className='modal'>
      <h1 className='removemargin'>Confirm Delete</h1>
      <h3 className='removemargin'>Are you sure you want to delete this review?</h3>
      <div style={{marginTop: "10px", marginBottom: "10px"}}>
        <button className='pagebutton' style={{backgroundColor: "red"}} onClick={handleDelete}>Yes (Delete Review)</button>
        <button className='pagebutton' style={{backgroundColor: "gray"}} onClick={handleCancel}>No (Keep Review)</button>
      </div>
    </div>
  );
}

export default ReviewDeleteModal;
