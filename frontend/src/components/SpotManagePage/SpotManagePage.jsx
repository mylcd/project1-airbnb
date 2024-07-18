import { useEffect } from 'react';
import { getAllSpotsCurrent } from '../../store/spot';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SpotDeleteModal from '../SpotDeleteModal/SpotDeleteModal';
import TooltipImage from '../../context/TooltipImage';

const SpotManagePage = () => {
  const sessionUser = useSelector((state) => state.session.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllSpotsCurrent());
  }, [dispatch]);

  const createNewSpot = (e) => {
    e.preventDefault();
    navigate('/spots/new');
  };

  const spots = useSelector((state) => state.spot);
  let spotsManagePage;
  if(spots.getallcurrent && sessionUser && Object.values(spots.getallcurrent).length > 0) {
    let spotList = null;
    if(Object.keys(spots).length > 0) spotList = Object.values(spots.getallcurrent);
    spotsManagePage = (
      <>
        <h2 style={{fontFamily: "cursive"}}>Manage Your Spots</h2>
        <div className='spotintro'>
          {spotList?.map(({ id, name, city, state, price, avgRating, previewImage }) => (
            <div key={"div"+id}>
              <a href={"/spots/"+id} key={"div"+id} style={{color: "black"}}>
                <TooltipImage image={previewImage} text={name} className={"landing"}/>
                <p className='row1'>
                  <text>{city}, {state}</text>
                  <text>★{avgRating ? avgRating.toFixed(2) : "New"}</text>
                </p>
                <p>${price} night</p>
              </a>
              <div style={{display: "flex", flexDirection: "row", columnGap: "5px"}}>
                <a className='anchorbutton' href={`/spots/${id}/edit`}>Update</a>
                <OpenModalButton
                  buttonText="Delete"
                  modalComponent={<SpotDeleteModal spotId={id}/>}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
  else if(!sessionUser) {
    spotsManagePage = (
      <>
        <h2 style={{fontFamily: "cursive"}}>You need to <OpenModalButton
          buttonText="Log In"
          modalComponent={<LoginFormModal />}
        /> first.</h2>
      </>
    )
  }
  else {
    spotsManagePage = (
      <div>
        <h2 style={{fontFamily: "cursive"}}>Manage Your Spots</h2>
        <button className='pagebutton' onClick={createNewSpot}>Create a New Spot</button>
      </div>
    )
  }

  return (
    spotsManagePage
  );
};

export default SpotManagePage;
/**/
