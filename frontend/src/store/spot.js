import { csrfFetch } from "./csrf";

const GET_ALL_SPOTS = 'spot/getAllSpots';
const GET_SPOT_DETAILS = 'spot/getSpotDetails'

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

const loadSpotDetails = (spotdetails) => {
  return {
    type: GET_SPOT_DETAILS,
    spotdetails
  };
};

export const getSpotDetails = (body) => async (dispatch) => {
  const { spotId } = body;

  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: 'GET'
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(loadSpotDetails(data));
    return data;
  }
}

/*export const getAllSpotsCurrent = () => async () => {
  const response = await csrfFetch('/api/spots/current', {
    method: 'GET'
  });

  return response;
};*/

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
    case GET_SPOT_DETAILS:
      return {...state, getdetails: action.spotdetails};
    default:
      return state;
  }
};

export default spotsReducer;
