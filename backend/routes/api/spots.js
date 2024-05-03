const express = require('express');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User, Spot } = require('../../db/models');

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
    .withMessage('Price per day must be a positive number')
];

// Create a Spot
router.post('/', restoreUser, async (req, res) => {
  const { id } = req.user;
  const { address, city, state, country, lat, lng, name, description, price }
   = req.body;
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

  return res.json(newPlayer);
});

module.exports = router;
