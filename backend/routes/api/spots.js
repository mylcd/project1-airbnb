const express = require('express');
const sequelize = require('sequelize');
const { Op } = require("sequelize");

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { toDateString, toDateTimeString, validateDate, validateDateInBetween, userNonEmpty } = require('../../utils/tools');

const { restoreUser } = require('../../utils/auth');
const { User, Spot, Review, Booking, SpotImage, ReviewImage } = require('../../db/models');
const { IGNORE } = require('sequelize/lib/index-hints');

const router = express.Router();

const validateSpot = [
  check('address')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Street address is required'),
  check('city')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('City is required'),
  check('state')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Country is required'),
  check('lat')
    .notEmpty()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be within -90 and 90'),
  check('lng')
    .notEmpty()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be within -180 and 180'),
  check('name')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isLength({ min: 1, max: 49 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Description is required'),
  check('price')
    .notEmpty()
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a positive number'),
  handleValidationErrors
];

const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Review text is required'),
  check('stars')
    .notEmpty()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors
]

const validateBooking = [
  check('startDate')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isISO8601()
    .custom( value => {
      let start = new Date(value);
      let today = new Date();
      if(start < today){
          throw new Error();
      }
      return true;
    })
    .withMessage('startDate cannot be in the past'),
  check('endDate')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isISO8601()
    .custom( (value, { req }) => {
      let end = new Date(value);
      let start = new Date(req.body.startDate);
      if(end <= start){
        throw new Error();
      }
      return true;
    })
    .withMessage('endDate cannot be on or before startDate'),
  handleValidationErrors
];

// Get all Spots
router.get('/', async(req, res) => {
  // if(Object.keys(req.query).length > 0) {}; // If I need to separate query filter with normal route

  // Add Query Filters to Get All Spots
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

  const errorMessage = {};
  const where = {
    lat: {},
    lng: {},
    price: {}
  };
  let deletelat = true;
  let deletelng = true;
  let deleteprice = true;

  if(!page) page = 1;
  else if (isNaN(page) || page.includes('.')) errorMessage.page = "Page must be greater than or equal to 1";
  else {
    page = parseInt(page);
    if(page < 1) errorMessage.page = "Page must be greater than or equal to 1";
  }

  if(!size) size = 20;
  else if (isNaN(size) || size.includes('.')) errorMessage.size = "Size must be between 1 and 20";
  else {
    size = parseInt(size);
    if(size < 1 || size > 20) errorMessage.size = "Size must be between 1 and 20";
  }

  if(minLat) {
    if(isNaN(minLat)) errorMessage.minLat = "Minimum latitude is invalid";
    else {
      minLat = parseFloat(minLat);
      Object.assign(where.lat, {[Op.gte]: minLat});
      deletelat = false;
    }
  }

  if(maxLat) {
    if(isNaN(maxLat)) errorMessage.maxLat = "Maximum latitude is invalid";
    else {
      maxLat = parseFloat(maxLat);
      Object.assign(where.lat, {[Op.lte]: maxLat});
      deletelat = false;
    }
  }

  if(minLng) {
    if(isNaN(minLng)) errorMessage.minLng = "Minimum longitude is invalid";
    else {
      minLng = parseFloat(minLng);
      Object.assign(where.lng, {[Op.gte]: minLng});
      deletelng = false;
    }
  }

  if(maxLng) {
    if(isNaN(maxLng)) errorMessage.maxLng = "Maximum longitude is invalid";
    else {
      maxLng = parseFloat(maxLng);
      Object.assign(where.lng, {[Op.lte]: maxLng});
      deletelng = false;
    }
  }

  if(minPrice) {
    if(isNaN(minPrice)) errorMessage.minPrice = "Minimum price must be greater than or equal to 0";
    else {
      minPrice = parseFloat(minPrice);
      if(minPrice < 0) errorMessage.minPrice = "Minimum price must be greater than or equal to 0";
      else {
        Object.assign(where.price, {[Op.gte]: minPrice});
        deleteprice = false;
      }
    }
  }

  if(maxPrice) {
    if(isNaN(maxPrice)) errorMessage.maxPrice = "Maximum price must be greater than or equal to 0";
    else {
      maxPrice = parseFloat(maxPrice);
      if(maxPrice < 0) errorMessage.maxPrice = "Maximum price must be greater than or equal to 0";
      else {
        Object.assign(where.price, {[Op.lte]: maxPrice});
        deleteprice = false;
      }
    }
  }

  if(Object.keys(errorMessage).length > 0) {
    res.status(400);
    return res.json({
      message: "Bad Request",
      errors: errorMessage
    })
  }

  if(deletelat) delete where.lat;
  if(deletelng) delete where.lng;
  if(deleteprice) delete where.price;

  const allSpots = await Spot.findAll({
    limit: size,
    offset: size * (page - 1),
    where
  });

  let allSpotsWithRating = [];
  for(let spot of allSpots) {
    const thisSpotId = spot.id;

    const associatedReviews = await Review.findAll({
      attributes: [ [sequelize.fn('AVG', sequelize.col('stars')), 'avgStars'] ],
      where: {
        spotId: thisSpotId
      }
    });
    let avgStar = null;
    if(!(associatedReviews[0].dataValues.avgStars == null)) {
      avgStar = associatedReviews[0].dataValues.avgStars.toFixed(1);
    }

    const preview = await SpotImage.findOne({
      attributes: [ 'url' ],
      where: {
        spotId: thisSpotId
      }
    });

    if(preview) {
      allSpotsWithRating.push({
        id: thisSpotId,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: toDateTimeString(spot.createdAt),
        updatedAt: toDateTimeString(spot.updatedAt),
        avgRating: avgStar,
        previewImage: preview.url
      });
    }
    else {
      allSpotsWithRating.push({
        id: thisSpotId,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: toDateTimeString(spot.createdAt),
        updatedAt: toDateTimeString(spot.updatedAt),
        avgRating: avgStar
      })
    }
  }

  return res.json({
    Spots: allSpotsWithRating,
    page, size
  });
});

// Get all Spots owned by the Current User
router.get('/current', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const allSpots = await Spot.findAll({
    where: {
      ownerId: id
    }
  });

  let allSpotsWithRating = [];
  for(let spot of allSpots) {
    const thisSpotId = spot.id;

    const associatedReviews = await Review.findAll({
      attributes: [ [sequelize.fn('AVG', sequelize.col('stars')), 'avgStars'] ],
      where: {
        spotId: thisSpotId
      }
    });
    let avgStar = null;
    if(!(associatedReviews[0].dataValues.avgStars == null)) {
      avgStar = associatedReviews[0].dataValues.avgStars.toFixed(1);
    }

    const preview = await SpotImage.findOne({
      attributes: [ 'url' ],
      where: {
        spotId: thisSpotId,
        preview: true
      }
    });

    if(preview) {
      allSpotsWithRating.push({
        id: thisSpotId,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: toDateTimeString(spot.createdAt),
        updatedAt: toDateTimeString(spot.updatedAt),
        avgRating: avgStar,
        previewImage: preview.url
      });
    }
    else {
      allSpotsWithRating.push({
        id: thisSpotId,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: toDateTimeString(spot.createdAt),
        updatedAt: toDateTimeString(spot.updatedAt),
        avgRating: avgStar
      })
    }
  }

  return res.json({Spots: allSpotsWithRating});
});

// Get details of a Spot from an id
router.get('/:spotId', async (req, res) => {
  const { spotId } = req.params;

  const oneSpot = await Spot.findByPk(parseInt(spotId), {
    include: [
      { model: SpotImage },
      { model: User, as: "Owner" }
    ]
  });

  if(oneSpot) {
    const associatedReviews = await Review.findAll({
      attributes: [ 'stars' ],
      where: {
        spotId
      }
    });

    const numReviews = associatedReviews.length;
    let avgStar = associatedReviews.reduce((sumStar, star) => sumStar + star.stars, 0) / numReviews;
    if(isNaN(avgStar)) avgStar = null;
    else avgStar = avgStar.toFixed(1);
    const spotimage = oneSpot.SpotImages.map(original => {
      return {
        id: original.id,
        url: original.url,
        preview: original.preview,
      }
    });

    const detailedSpot = {
      id: oneSpot.id,
      ownerId: oneSpot.ownerId,
      address: oneSpot.address,
      city: oneSpot.city,
      state: oneSpot.state,
      country: oneSpot.country,
      lat: oneSpot.lat,
      lng: oneSpot.lng,
      name: oneSpot.name,
      description: oneSpot.description,
      price: oneSpot.price,
      createdAt: toDateTimeString(oneSpot.createdAt),
      updatedAt: toDateTimeString(oneSpot.updatedAt),
      numReviews,
      avgStarRating: avgStar,
      SpotImages: spotimage,
      Owner: {
        id: oneSpot.Owner.id,
        firstName: oneSpot.Owner.firstName,
        lastName: oneSpot.Owner.lastName
      }
    }

    return res.json(detailedSpot);
  }
  else {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found"
    });
  }
});

// Create a Spot
router.post('/', restoreUser, userNonEmpty, validateSpot, async (req, res, next) => {
  const { id } = req.user;
  const { address, city, state, country, lat, lng, name, description, price }
   = req.body;
  try{
    const newSpot = await Spot.create({
      ownerId: id,
      address,
      city,
      state,
      country,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      name,
      description,
      price: parseFloat(price)
    });
    return res.json(newSpot);
  } catch(err) {
    err.status = 400;
    next(err);
  }
});

// Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const { spotId } = req.params;
  const { url, preview } = req.body;

  const oneSpot = await Spot.findByPk(parseInt(spotId), {
    attributes: [ 'ownerId' ]
  });

  if(oneSpot) {
    if(id === oneSpot.ownerId) {
      const newSpotImage = await SpotImage.create({
        url, preview, spotId
      });
      return res.json({
        id: newSpotImage.id,
        url: newSpotImage.url,
        preview: newSpotImage.preview
      });
    }
    else {
      res.status(403);
      return res.json({
        message: "Forbidden"
      });
    }
  }
  else {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found"
    });
  }
});

// Edit a Spot
router.put('/:spotId', restoreUser, userNonEmpty, validateSpot, async (req, res, next) => {
  const { id } = req.user;
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price }
   = req.body;

   const oneSpot = await Spot.findByPk(parseInt(spotId));

  if(oneSpot) {
    if(id === oneSpot.ownerId) {
      try {
        await oneSpot.update({
          address, city, state, country, lat, lng, name, description, price
        });
      } catch(err) {
        err.status = 400;
        next(err);
      }
      return res.json({
        id: oneSpot.id,
        ownerId: oneSpot.ownerId,
        address: oneSpot.address,
        city: oneSpot.city,
        state: oneSpot.state,
        country: oneSpot.country,
        lat: oneSpot.lat,
        lng: oneSpot.lng,
        name: oneSpot.name,
        description: oneSpot.description,
        price: oneSpot.price,
        createdAt: toDateTimeString(oneSpot.createdAt),
        updatedAt: toDateTimeString(oneSpot.updatedAt)
      });
    }
    else {
      res.status(403);
      return res.json({
        message: "Forbidden"
      });
    }
  }
  else {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found"
    });
  }
});

// Delete a Spot
router.delete('/:spotId', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const { spotId } = req.params;

  const oneSpot = await Spot.findByPk(parseInt(spotId));

  if(oneSpot) {
    if(id === oneSpot.ownerId) {
      oneSpot.destroy();
      return res.json({
        message: "Successfully deleted"
      });
    }
    else {
      res.status(403);
      return res.json({
        message: "Forbidden"
      });
    }
  }
  else {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found"
    });
  }
});

// Get all Reviews by a Spot's id
router.get('/:spotId/reviews', async (req, res) => {
  const { spotId } = req.params;

  const oneSpot = await Spot.findByPk(parseInt(spotId));

  if(oneSpot) {
    const allReviews = await Review.findAll({
      where: {
        spotId: parseInt(spotId)
      },
      include: [
        { model: User },
        { model: ReviewImage }
      ]
    });

    let allReviewsWithMods = [];
    for(onereview of allReviews) {
      const reviewimage = onereview.ReviewImages.map(original => {
        return {
          id: original.id,
          url: original.url
        }
      });

      allReviewsWithMods.push({
        id: onereview.id,
        userId: onereview.userId,
        spotId: onereview.spotId,
        review: onereview.review,
        stars: onereview.stars,
        createdAt: toDateTimeString(onereview.createdAt),
        updatedAt: toDateTimeString(onereview.updatedAt),
        User: {
          id: onereview.User.id,
          firstName: onereview.User.firstName,
          lastName: onereview.User.lastName
        },
        ReviewImages: reviewimage
      });
    }

    return res.json({Reviews: allReviewsWithMods});
  }
  else {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found"
    });
  }
});

// Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', restoreUser, userNonEmpty, validateReview, async (req, res) => {
  const { id } = req.user;
  const { spotId } = req.params;
  const { review, stars } = req.body;

  const oneSpot = await Spot.findByPk(parseInt(spotId));

  if(oneSpot) {
    const prevReview = await Review.findOne({
      where: {
        userId: id
      }
    });

    if(prevReview) {
      res.status(500);
      return res.json({
        message: "User already has a review for this spot"
      });
    }
    else {
      const newReview = await Review.create({
        spotId, review, stars,
        userId: id
      });
      return res.json({
        id: newReview.id,
        userId: newReview.userId,
        spotId: newReview.spotId,
        review: newReview.review,
        stars: newReview.stars,
        createdAt: toDateTimeString(newReview.createdAt),
        updatedAt: toDateTimeString(newReview.updatedAt)
      });
    }
  }
  else {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found"
    });
  }
});

// Get all Bookings for a Spot based on the Spot's id
router.get('/:spotId/bookings', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const { spotId } = req.params;

  const oneSpot = await Spot.findByPk(parseInt(spotId));

  if(oneSpot && oneSpot.ownerId === id) {
    const ownedAllBookings = await Booking.findAll({
      where: {
        spotId: parseInt(spotId),
      },
      include: [
        { model: User }
      ]
    });

    let ownedAllBookingsWithMods = [];
    for(onereview of ownedAllBookings) {
      ownedAllBookingsWithMods.push({
        User: {
          id: onereview.User.id,
          firstName: onereview.User.firstName,
          lastName: onereview.User.lastName
        },
        id: onereview.id,
        spotId: onereview.spotId,
        userId: onereview.userId,
        startDate: toDateString(onereview.startDate),
        endDate: toDateString(onereview.endDate),
        createdAt: toDateTimeString(onereview.createdAt),
        updatedAt: toDateTimeString(onereview.updatedAt)
      });
    }

    return res.json({Bookings: ownedAllBookingsWithMods});
  }
  else if (oneSpot && oneSpot.ownerId !== id) {
    const allBookings = await Booking.findAll({
      where: {
        spotId: parseInt(spotId),
      }
    });

    let allBookingsWithMods = [];
    for(onebooking of allBookings) {
      allBookingsWithMods.push({
        spotId: onebooking.spotId,
        startDate: toDateString(onebooking.startDate),
        endDate: toDateString(onebooking.endDate)
      });
    }

    return res.json({Bookings: allBookingsWithMods});
  }
  else {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found"
    });
  }
});

// Create a Booking from a Spot based on the Spot's id
router.post('/:spotId/bookings', restoreUser, userNonEmpty, validateBooking, async (req, res) => {
  const { id } = req.user;
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;

  const oneSpot = await Spot.findByPk(parseInt(spotId), {
    include: [
      { model: Booking }
    ]
  });

  if(oneSpot) {
    if(oneSpot.ownerId === id) {
      res.status(403);
      return res.json({
        message: "Forbidden"
      });
    }
    else {
      const errorMessage = {};
      if(!validateDate(startDate, oneSpot.Bookings)) {
        errorMessage.startDate = "Start date conflicts with an existing booking"
      }
      if(!validateDate(endDate, oneSpot.Bookings)) {
        errorMessage.endDate = "End date conflicts with an existing booking"
      }
      if((Object.keys(errorMessage).length === 0) &&
        (!validateDateInBetween(startDate, endDate, oneSpot.Bookings))) {
          errorMessage.startDate = "Start date conflicts with an existing booking"
          errorMessage.endDate = "End date conflicts with an existing booking"
      }

      if(Object.keys(errorMessage).length > 0) {
        res.status(403);
        return res.json({
          message: "Sorry, this spot is already booked for the specified dates",
          errors: errorMessage
        });
      }
      else {
        const newBooking = await Booking.create({
          spotId, startDate, endDate,
          userId: id
        });

        return res.json({
          id: newBooking.id,
          spotId: newBooking.spotId,
          userId: newBooking.userId,
          startDate: toDateString(newBooking.startDate),
          endDate: toDateString(newBooking.endDate),
          createdAt: toDateTimeString(newBooking.createdAt),
          updatedAt: toDateTimeString(newBooking.updatedAt)
        });
      }
    }
  }
  else {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found"
    });
  }
});

module.exports = router;
