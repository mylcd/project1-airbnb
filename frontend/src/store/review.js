/*import { csrfFetch } from "./csrf";

const GET_SPOT_REVIEWS = 'review/getSpotReviews';

const loadSpotReviews = (spotReviews) => {
  return {
    type: GET_SPOT_REVIEWS,
    spotReviews
  };
};

export const getSpotReviews = (body) => async (dispatch) => {
  const { spotId } = body;
  console.log("hello");

  const response = await csrfFetch(`/reviews/spots/${spotId}`, {
    method: 'GET'
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(loadSpotReviews(data.Reviews));
    return data;
  }
}

// state object
const initialState = {};

// reducer
const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SPOT_REVIEWS:
      return {...state, spotreviews: action.spotReviews};
    default:
      return state;
  }
};

export default reviewsReducer;*/
