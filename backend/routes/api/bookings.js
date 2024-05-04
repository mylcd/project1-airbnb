const express = require('express');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { toDateString, toDateTimeString, validateDate, validateDateInBetween, userNonEmpty } = require('../../utils/tools');

const { restoreUser } = require('../../utils/auth');
const { Spot, Booking, SpotImage } = require('../../db/models');

const router = express.Router();

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

// Get all of the Current User's Bookings
router.get('/current', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const allBookings = await Booking.findAll({
    where: {
      userId: id
    },
    include: [
      { model: Spot }
    ]
  });

  let allBookingsWithMods = [];
  for(onebooking of allBookings) {
    const thisSpotId = onebooking.Spot.id;
    const preview = await SpotImage.findOne({
      attributes: [ 'url' ],
      where: {
        spotId: thisSpotId,
        preview: true
      }
    });

    if(preview) {
      allBookingsWithMods.push({
        id: onebooking.id,
        spotId: onebooking.spotId,
        Spot: {
          id: thisSpotId,
          ownerId: onebooking.Spot.ownerId,
          address: onebooking.Spot.address,
          city: onebooking.Spot.city,
          state: onebooking.Spot.state,
          country: onebooking.Spot.country,
          lat: onebooking.Spot.lat,
          lng: onebooking.Spot.lng,
          name: onebooking.Spot.name,
          price: onebooking.Spot.price,
          previewImage: preview.url
        },
        userId: onebooking.userId,
        startDate: toDateString(onebooking.startDate),
        endDate: toDateString(onebooking.endDate),
        createdAt: toDateTimeString(onebooking.createdAt),
        updatedAt: toDateTimeString(onebooking.updatedAt)
      });
    }
    else {
      allBookingsWithMods.push({
        id: onebooking.id,
        spotId: onebooking.spotId,
        Spot: {
          id: thisSpotId,
          ownerId: onebooking.Spot.ownerId,
          address: onebooking.Spot.address,
          city: onebooking.Spot.city,
          state: onebooking.Spot.state,
          country: onebooking.Spot.country,
          lat: onebooking.Spot.lat,
          lng: onebooking.Spot.lng,
          name: onebooking.Spot.name,
          price: onebooking.Spot.price
        },
        userId: onebooking.userId,
        startDate: toDateString(onebooking.startDate),
        endDate: toDateString(onebooking.endDate),
        createdAt: toDateTimeString(onebooking.createdAt),
        updatedAt: toDateTimeString(onebooking.updatedAt)
      });
    }
  }

  return res.json({Bookings: allBookingsWithMods});
});

// Edit a Booking
router.put('/:bookingId', restoreUser, userNonEmpty, validateBooking, async (req, res) => {
  const { id } = req.user;
  const { bookingId } = req.params;
  const { startDate, endDate } = req.body;

   const oneBooking = await Booking.findByPk(parseInt(bookingId));

  if(oneBooking) {
    if(id === oneBooking.userId) {
      const thisBookingEndDate = Date.parse(oneBooking.endDate.toISOString());
      if(thisBookingEndDate <= Date.now()) {
        res.status(403);
        return res.json({
          message: "Past bookings can't be modified"
        });
      }
      else {
        const oneSpot = await Spot.findByPk(oneBooking.spotId, {
          include: [
            { model: Booking }
          ]
        });
        const filteredBookings = oneSpot.Bookings.filter((booking) => {
          return booking.id !== parseInt(bookingId);
        });

        const errorMessage = {};
        if(!validateDate(startDate, filteredBookings)) {
          errorMessage.startDate = "Start date conflicts with an existing booking"
        }
        if(!validateDate(endDate, filteredBookings)) {
          errorMessage.endDate = "End date conflicts with an existing booking"
        }
        if((Object.keys(errorMessage).length === 0) &&
        (!validateDateInBetween(startDate, endDate, filteredBookings))) {
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
          await oneBooking.update({
            startDate, endDate
          });
          return res.json({
            id: oneBooking.id,
            spotId: oneBooking.spotId,
            userId: oneBooking.userId,
            startDate: toDateString(oneBooking.startDate),
            endDate: toDateString(oneBooking.endDate),
            createdAt: toDateTimeString(oneBooking.createdAt),
            updatedAt: toDateTimeString(oneBooking.updatedAt)
          });
        }
      }
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
      message: "Booking couldn't be found"
    });
  }
});

// Delete a Booking
router.delete('/:bookingId', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const { bookingId } = req.params;

  const oneBooking = await Booking.findByPk(parseInt(bookingId), {
    include: [
      { model: Spot }
    ]
  });

  if(oneBooking) {
    if(id === oneBooking.userId || id === oneBooking.Spot.ownerId) {
      const thisBookingStartDate = Date.parse(oneBooking.startDate.toISOString());
      if(thisBookingStartDate <= Date.now()) {
        res.status(403);
        return res.json({
          message: "Bookings that have been started can't be deleted"
        });
      }
      else {
        oneBooking.destroy();
        return res.json({
          message: "Successfully deleted"
        });
      }
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
      message: "Booking couldn't be found"
    });
  }
});

module.exports = router;
