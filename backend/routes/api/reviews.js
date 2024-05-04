const express = require('express');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { toDateTimeString, userNonEmpty } = require('../../utils/tools');

const { restoreUser } = require('../../utils/auth');
const { User, Spot, Review, ReviewImage, SpotImage } = require('../../db/models');

const MAX_REVIEW_IMAGE_NUMBER = 10;

const router = express.Router();

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
];

// Get all Reviews of the Current User
router.get('/current', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const allReviews = await Review.findAll({
    where: {
      userId: id
    },
    include: [
      { model: User },
      { model: Spot },
      { model: ReviewImage }
    ]
  });

  let allReviewsWithMods = [];
  for(onereview of allReviews) {
    const thisSpotId = onereview.Spot.id;
    const preview = await SpotImage.findOne({
      attributes: [ 'url' ],
      where: {
        spotId: thisSpotId,
        preview: true
      }
    });

    const reviewimage = onereview.ReviewImages.map(original => {
      return {
        id: original.id,
        url: original.url
      }
    });

    if(preview) {
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
        Spot: {
          id: thisSpotId,
          ownerId: onereview.Spot.ownerId,
          address: onereview.Spot.address,
          city: onereview.Spot.city,
          state: onereview.Spot.state,
          country: onereview.Spot.country,
          lat: onereview.Spot.lat,
          lng: onereview.Spot.lng,
          name: onereview.Spot.name,
          price: onereview.Spot.price,
          previewImage: preview.url
        },
        ReviewImages: reviewimage
      });
    }
    else{
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
        Spot: {
          id: thisSpotId,
          ownerId: onereview.Spot.ownerId,
          address: onereview.Spot.address,
          city: onereview.Spot.city,
          state: onereview.Spot.state,
          country: onereview.Spot.country,
          lat: onereview.Spot.lat,
          lng: onereview.Spot.lng,
          name: onereview.Spot.name,
          price: onereview.Spot.price
        },
        ReviewImages: reviewimage
      });
    }
  }

  return res.json({Reviews: allReviewsWithMods});
});

// Add an Image to a Review based on the Review's id
router.post('/:reviewId/images', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const { reviewId } = req.params;
  const { url } = req.body;

  const oneReview = await Review.findByPk(parseInt(reviewId), {
    attributes: [ 'userId' ]
  });

  if(oneReview) {
    const reviewImageCount = await ReviewImage.findAll({
      where: {
        reviewId
      }
    });

    if(id === oneReview.userId) {
      if(reviewImageCount.length < MAX_REVIEW_IMAGE_NUMBER) {
        const newReviewImage = await ReviewImage.create({
          url, reviewId
        });
        return res.json({
          id: newReviewImage.id,
          url: newReviewImage.url
        });
      }
      else {
        res.status(403);
        return res.json({
          message: "Maximum number of images for this resource was reached"
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
      message: "Review couldn't be found"
    });
  }
});

// Edit a Review
router.put('/:reviewId', restoreUser, userNonEmpty, validateReview, async (req, res) => {
  const { id } = req.user;
  const { reviewId } = req.params;
  const { review, stars } = req.body;

   const oneReview = await Review.findByPk(parseInt(reviewId));

  if(oneReview) {
    if(id === oneReview.userId) {
      await oneReview.update({
        review, stars
      });
      return res.json({
        id: oneReview.id,
        userId: oneReview.userId,
        spotId: oneReview.spotId,
        review: oneReview.review,
        stars: oneReview.stars,
        createdAt: toDateTimeString(oneReview.createdAt),
        updatedAt: toDateTimeString(oneReview.updatedAt)
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
      message: "Review couldn't be found"
    });
  }
});

// Delete a Review
router.delete('/:reviewId', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const { reviewId } = req.params;

  const oneReview = await Review.findByPk(parseInt(reviewId));

  if(oneReview) {
    if(id === oneReview.userId) {
      oneReview.destroy();
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
      message: "Review couldn't be found"
    });
  }
});

module.exports = router;
