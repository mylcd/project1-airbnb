import { csrfFetch } from "./csrf";

export const deleteReview = (body) => async () => {
  const { reviewId } = body;
  const response = await csrfFetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE'
  });
  return response;
};

/*
// state object
const initialState = {};

// reducer
const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reviewsReducer;*/
