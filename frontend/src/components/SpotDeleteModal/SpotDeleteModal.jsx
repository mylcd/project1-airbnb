import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { deleteSpot, getAllSpotsCurrent } from '../../store/spot';

function SpotDeleteModal({ spotId }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleDelete = async (e) => {
    e.preventDefault();
    await dispatch(deleteSpot({ spotId }));
    return dispatch(getAllSpotsCurrent())
    .then(closeModal);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    closeModal();
  };

  return (
    <div className='modal'>
      <h1 className='removemargin'>Confirm Delete</h1>
      <h3 className='removemargin'>Are you sure you want to remove this spot from the listings?</h3>
      <div style={{marginTop: "10px", marginBottom: "10px"}}>
        <button className='pagebutton' style={{backgroundColor: "red"}} onClick={handleDelete}>Yes (Delete Spot)</button>
        <button className='pagebutton' style={{backgroundColor: "gray"}} onClick={handleCancel}>No (Keep Spot)</button>
      </div>
    </div>
  );
}

export default SpotDeleteModal;
