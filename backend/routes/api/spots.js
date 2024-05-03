const express = require('express');
const sequelize = require('sequelize');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { restoreUser } = require('../../utils/auth');
const { User, Spot, Review, SpotImage } = require('../../db/models');
const e = require('express');

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

// Get all Spots
router.get('/', async(req, res) => {
  const allSpots = await Spot.findAll();

  let allSpotsWithRating = [];
  for(let spot of allSpots) {
    const thisSpotId = spot.id;

    const associatedReviews = await Review.findAll({
      attributes: [ [sequelize.fn('AVG', sequelize.col('stars')), 'avgStars'] ],
      where: {
        spotId: thisSpotId
      }
    });

    const preview = await SpotImage.findOne({
      attributes: [ 'url' ],
      where: {
        spotId: thisSpotId
      }
    });


    console.log(associatedReviews[0].dataValues.avgStars);


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
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating: associatedReviews[0].dataValues.avgStars,
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
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating: associatedReviews[0].dataValues.avgStars
      })
    }
  }

  return res.json({Spots: allSpotsWithRating});
});

// Get all Spots owned by the Current User
router.get('/current', restoreUser, async (req, res) => {
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

    const preview = await SpotImage.findOne({
      attributes: [ 'url' ],
      where: {
        spotId: thisSpotId
      }
    });


    console.log(associatedReviews[0].dataValues.avgStars);


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
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating: associatedReviews[0].dataValues.avgStars,
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
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating: associatedReviews[0].dataValues.avgStars
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
    const avgStar = associatedReviews.reduce((sumStar, star) => sumStar + star.stars, 0) / numReviews;
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
      createdAt: oneSpot.createdAt,
      updatedAt: oneSpot.updatedAt,
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
router.post('/', restoreUser, validateSpot, async (req, res, next) => {
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
router.post('/:spotId/images', restoreUser, async (req, res) => {
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
router.put('/:spotId', restoreUser, validateSpot, async (req, res, next) => {
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
        createdAt: oneSpot.createdAt,
        updatedAt: oneSpot.updatedAt
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
router.delete('/:spotId', restoreUser, async (req, res) => {
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

module.exports = router;
