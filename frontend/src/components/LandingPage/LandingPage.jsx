import { useEffect } from 'react';
import { getAllSpots } from '../../store/spot';
import { useDispatch, useSelector } from 'react-redux';
import TooltipImage from '../../context/TooltipImage';

const LandingPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllSpots());
  }, [dispatch]);

  const spots = useSelector((state) => state.spot);
  let spotsPage;
  if(spots.getall) {
    let spotList = null;
    if(Object.keys(spots).length > 0) spotList = Object.values(spots.getall);
    spotsPage = (
    <div className='spotintro'>
      {spotList?.map(({ id, name, city, state, price, avgRating, previewImage }) => (
        <a href={"/spots/"+id} key={"div"+id} style={{color: "black"}}>
          <TooltipImage image={previewImage} text={name} className={"landing"}/>
          <p className='row1'>
            <text>{city}, {state}</text>
            <text>★{avgRating ? avgRating.toFixed(1) : "New"}</text>
          </p>
          <p>${price} night</p>
        </a>
      ))}
    </div>
    );
  }

  return (
    spotsPage
  );
};

export default LandingPage;
