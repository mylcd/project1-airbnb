import { useEffect } from 'react';
import { getSpotDetails, getSpotReviews } from '../../store/spot';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import ReviewFormModal from '../ReviewFormModal/ReviewFormModal';
import "./SpotDetailPage.css";

const SpotDetailPage = () => {
  const { spotId } = useParams();

  const dispatch = useDispatch();

  const spot = useSelector((state) => state.spot.getdetails);
  const spotreview = useSelector((state) => state.spot.getreviews);
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(getSpotDetails({spotId}));
    dispatch(getSpotReviews({spotId}));
  }, [dispatch, spotId]);

  let reserveAllowed = null;
  if(sessionUser && spot && (sessionUser.id != spot.Owner.id)) {
    reserveAllowed = (<button>Reserve</button>);
  }
  else reserveAllowed = (<button disabled={true}>Reserve</button>);

  let postReviewAllowed = null;
  if(sessionUser && spot && (sessionUser.id != spot.Owner.id)) {
    postReviewAllowed = (
      <OpenModalButton
        buttonText="Post Your Review"
        modalComponent={<ReviewFormModal spotId={spotId}/>}
      />
    );
  }
  else postReviewAllowed = (<></>);

  return (
    <>
      {
        spot && spotreview &&
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
            {(spot.numReviews === 0)?
              <p>★New</p>
              :
              <p>★{spot.avgStarRating} {spot.numReviews} reviews</p>}
            {reserveAllowed}
          </div>

          <div>
            {(spot.numReviews === 0)?
              <h4>★New</h4>
              :
              <h4>★{spot.avgStarRating} {spot.numReviews} reviews</h4>}
            {postReviewAllowed}
          </div>
          {spotreview?.map(({ User, createdAt, review, id }) => (
            <div key={"review"+id}>
              <h5>{User.firstName? User.firstName : "User id " + User.id }</h5>
              <p>{createdAt}</p>
              <p>{review}</p>
              {sessionUser && (User.id == sessionUser.id) &&
              <button>Delete</button>}
            </div>
          ))}
        </>
      }
    </>
  );
};

export default SpotDetailPage;
