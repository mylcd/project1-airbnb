import { useEffect } from 'react';
import { getSpotDetails } from '../../store/spot';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import "./SpotDetailPage.css";

const SpotDetailPage = () => {
  const { spotId } = useParams();

  const dispatch = useDispatch();

  const spot = useSelector((state) => state.spot.getdetails);

  useEffect(() => {
    dispatch(getSpotDetails({spotId}));
  }, [dispatch, spotId]);

  return (
    <>
      {
        spot &&
        <>
          <h2>{spot.name}</h2>
          <p>{spot.city} {spot.state} {spot.country}</p>
          {spot.SpotImages?.map(({ id, url }) => (
            <img key={id} src={url}></img>
          ))}
          <h3>Hosted By {spot.Owner.firstName} {spot.Owner.lastName}</h3>
          <p>{spot.description}</p>
          <div>
            <h3>${spot.price}night</h3>
            <p>★{spot.avgStarRating} {spot.numReviews} reviews</p>
          </div>
        </>
      }
    </>
  );
};

export default SpotDetailPage;
