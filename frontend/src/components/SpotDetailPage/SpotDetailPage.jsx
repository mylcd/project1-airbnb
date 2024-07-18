import { useEffect } from 'react';
import { getSpotDetails, getSpotReviews } from '../../store/spot';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import ReviewFormModal from '../ReviewFormModal/ReviewFormModal';
import ReviewDeleteModal from '../ReviewDeleteModal/ReviewDeleteModal';
import BookingFormModal from '../BookingFormModal/BookingFormModal';

const numberToMonth = (number) => {
  switch (number) {
    case "01": return "January";
    case "02": return "February";
    case "03": return "March";
    case "04": return "April";
    case "05": return "May";
    case "06": return "June";
    case "07": return "July";
    case "08": return "August";
    case "09": return "September";
    case "10": return "October";
    case "11": return "November";
    case "12": return "December";
    default: return "Unknown"
  }
};

const haveReviewed = (reviews, userId) => {
  for(let review of reviews) {
    if(review.User.id == userId) return true;
  }
  return false;
};

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
    // Not implemented yet so disabled=true
    reserveAllowed = (<OpenModalButton
      buttonText="Reserve"
      modalComponent={<BookingFormModal />}
    />);
  }
  else reserveAllowed = (<button disabled={true} className='pagebutton'>Reserve</button>);

  let postReviewAllowed = null;
  if(sessionUser && spot && spotreview && (sessionUser.id != spot.Owner.id) && (!haveReviewed(spotreview, sessionUser.id))) {
    postReviewAllowed = (
      <>
        <OpenModalButton
          buttonText="Post Your Review"
          modalComponent={<ReviewFormModal spotId={spotId}/>}
        />
        {(spot.numReviews === 0) &&
          <div>Be the first to post a review!</div>
        }
      </>
    );
  }

  return (
    <>
      {
        spot && spotreview &&
        <div className='detailpage'>
          <div>
            <h2>{spot.name}</h2>
            <h4>{spot.city}, {spot.state}, {spot.country}</h4>
          </div>

          <div className='spotimages'>
            <div className='preview'>
              {spot.SpotImages?.map(({ id, url, preview }) => {
                if(preview)
                return (
                  <img className='preview' key={id} src={url}></img>
                )
              })}
            </div>
            <div className='postview'>
              {spot.SpotImages?.map(({ id, url, preview }) => {
                if(!preview)
                return (
                  <img className='postview' key={id} src={url}></img>
                )
              })}
            </div>
          </div>

          <div className='spotinfo'>
            <div className='spotdescription'>
              <h3>Hosted By {(spot.Owner.firstName && spot.Owner.lastName)?
                spot.Owner.firstName + ' ' + spot.Owner.lastName : "Demo User"}</h3>
              <p>{spot.description}</p>
            </div>
            <div className='spotbooking'>
              <div className='row1'>
                <h3>${spot.price} night</h3>
                {(spot.numReviews === 0) && <p>★New</p>}
                {(spot.numReviews === 1) && <p>★{spot.avgStarRating.toFixed(1) + ' · ' + spot.numReviews} review</p>}
                {(spot.numReviews > 1) && <p>★{spot.avgStarRating.toFixed(1) + ' · ' + spot.numReviews} reviews</p>}
              </div>
              {reserveAllowed}
            </div>
          </div>

          <div>
            {(spot.numReviews === 0)?
              <h3>★New</h3>
              :
              <h3>★{spot.avgStarRating.toFixed(1) + ' · ' + spot.numReviews} reviews</h3>}
            {postReviewAllowed}
          </div>
          {spotreview.slice(0).reverse().map(({ User, createdAt, review, id }) => (
            <div key={"review"+id}>
              <h4 className='removemargin'>{User.firstName? User.firstName : "Demo User" }</h4>
              <p className='removemargin'>
                {numberToMonth(createdAt.split(' ')[0].split('-')[1]) + " " + createdAt.split(' ')[0].split('-')[0]}
              </p>
              <p className='removemargin'>{review}</p>
              {sessionUser && (User.id == sessionUser.id) &&
              <OpenModalButton
                buttonText="Delete"
                modalComponent={<ReviewDeleteModal reviewId={id} spotId={spotId}/>}
              />}
            </div>
          ))}
        </div>
      }
    </>
  );
};

export default SpotDetailPage;
