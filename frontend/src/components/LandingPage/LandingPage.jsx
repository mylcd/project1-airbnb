import { useEffect } from 'react';
import { getAllSpots } from '../../store/spot';
import { useDispatch, useSelector } from 'react-redux';
import "./LandingPage.css";

const LandingPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllSpots());
  }, [dispatch]);

  const spots = useSelector((state) => state.spot);
  let spotList = null;
  if(Object.keys(spots).length > 0) spotList = Object.values(spots.getall);

  return (
    <>
      <h1>Spots List</h1>
      {spotList?.map(({ id, city, state, price, avgRating, previewImage }) => (
        <div key={"div"+id}>
          <a key={"a"+id} href={"/spots/"+id}><img key={"img"+id} src={previewImage}></img></a>
          <p key={"p1"+id}>{city}, {state}</p>
          <p key={"p2"+id}>★{avgRating}</p>
          <p key={"p3"+id}>${price}night</p>
        </div>
      ))}
    </>
  );
};

export default LandingPage;
