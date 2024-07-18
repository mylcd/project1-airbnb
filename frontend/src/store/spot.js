import { csrfFetch } from "./csrf";

const GET_ALL_SPOTS = 'spot/getAllSpots';
const GET_ALL_SPOTS_CURRENT = 'spot/getAllSpotsCurrent';
const GET_SPOT_DETAILS = 'spot/getSpotDetails';
const GET_SPOT_REVIEWS = 'spot/getSpotReviews';

const loadSpots = (spots) => {
  return {
    type: GET_ALL_SPOTS,
    spots
  };
};

export const getAllSpots = () => async (dispatch) => {
  const response = await csrfFetch('/api/spots', {
    method: 'GET'
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(loadSpots(data.Spots));
    return data;
  }
};

const loadSpotsCurrent = (spotsCurrent) => {
  return {
    type: GET_ALL_SPOTS_CURRENT,
    spotsCurrent
  };
};

export const getAllSpotsCurrent = () => async (dispatch) => {
  const response = await csrfFetch('/api/spots/current', {
    method: 'GET'
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(loadSpotsCurrent(data.Spots));
    return data;
  }
};


const loadSpotDetails = (spotdetails) => {
  return {
    type: GET_SPOT_DETAILS,
    spotdetails
  };
};

const loadSpotReviews = (spotreviews) => {
  return {
    type: GET_SPOT_REVIEWS,
    spotreviews
  };
};

export const getSpotDetails = (body) => async (dispatch) => {
  const { spotId } = body;

  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: 'GET'
  });

  const data = await response.json();
  dispatch(loadSpotDetails(data));
  return data;
}

export const getSpotReviews = (body) => async (dispatch) => {
  const { spotId } = body;

  const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
    method: 'GET'
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(loadSpotReviews(data.Reviews));
    return data;
  }
}

export const createSpot = (body) => async () => {
  const {address, city, state, country, lat, lng, name, description, price,
    previewImg, image1, image2, image3, image4} = body;
  const response = await csrfFetch('/api/spots', {
    method: 'POST',
    body: JSON.stringify({address, city, state, country, lat, lng, name, description, price})
  });
  const data = await response.json();
  await csrfFetch(`/api/spots/${data.id}/images`, {
    method: 'POST',
    body: JSON.stringify({
      url: previewImg,
      preview: true
    })
  });
  if(image1.length > 0) await csrfFetch(`/api/spots/${data.id}/images`, {
    method: 'POST',
    body: JSON.stringify({
      url: image1,
      preview: false
    })
  });
  if(image2.length > 0) await csrfFetch(`/api/spots/${data.id}/images`, {
    method: 'POST',
    body: JSON.stringify({
      url: image2,
      preview: false
    })
  });
  if(image3.length > 0) await csrfFetch(`/api/spots/${data.id}/images`, {
    method: 'POST',
    body: JSON.stringify({
      url: image3,
      preview: false
    })
  });
  if(image4.length > 0) await csrfFetch(`/api/spots/${data.id}/images`, {
    method: 'POST',
    body: JSON.stringify({
      url: image4,
      preview: false
    })
  });

  if(response.ok) {
    return data;
  }
};

export const updateSpot = (body) => async () => {
  const {spotId, address, city, state, country, lat, lng, name, description, price} = body;
  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: 'PUT',
    body: JSON.stringify({address, city, state, country, lat, lng, name, description, price})
  });
  const data = await response.json();

  return data;
};

export const createReview = (body) => async () => {
  const { spotId, review, stars } = body;
  const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({review, stars})
  });
  return response;
};

export const deleteSpot = (body) => async () => {
  const { spotId } = body;
  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: 'DELETE'
  });
  return response;
};

// state object
const initialState = {};

// reducer
const spotsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_SPOTS: {
      const allSpots = {};
      action.spots.forEach((spot) => (allSpots[spot.id] = spot));
      return {...state, getall: allSpots};
    }
    case GET_ALL_SPOTS_CURRENT: {
      const allSpotsCurrent = {};
      action.spotsCurrent.forEach((spot) => (allSpotsCurrent[spot.id] = spot));
      return {...state, getallcurrent: allSpotsCurrent};
    }
    case GET_SPOT_DETAILS:
      return {...state, getdetails: action.spotdetails};
    case GET_SPOT_REVIEWS:
      return {...state, getreviews: action.spotreviews};
    default:
      return state;
  }
};

export default spotsReducer;
