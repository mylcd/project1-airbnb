import { useModal } from '../../context/Modal';

function BookingFormModal() {
  const { closeModal } = useModal();

  return (
    <div className='modal'>
      <h2 className='removemargin'>Feature Coming Soon</h2>
      <button onClick={() => closeModal()} className='pagebutton'>Okay!</button>
    </div>
  );
}

export default BookingFormModal;
