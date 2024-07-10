import { useEffect } from 'react';
import { getAllSpots } from '../../store/spot';
import { useDispatch, useSelector } from 'react-redux';
import "./LandingPage.css";

const LandingPage = () => {
  const dispatch = useDispatch();

  const spots = useSelector((state) => state.spot);
  let spotList = null;
  if(Object.keys(spots).length > 0) spotList = Object.values(spots.getall);

  useEffect(() => {
    dispatch(getAllSpots());
  }, [dispatch]);

  return (
    <>
      <h1>Spots List</h1>
      {spotList?.map(({ id, city, state, price, avgRating, previewImage }) => (
        <div key={"div"+id}>
          <img key={"img"+id} src={previewImage}></img>
          <p key={"p1"+id}>{city}, {state}</p>
          <p key={"p2"+id}>★{avgRating}</p>
          <p key={"p3"+id}>${price}night</p>
        </div>
      ))}
    </>
  );
};

export default LandingPage;
