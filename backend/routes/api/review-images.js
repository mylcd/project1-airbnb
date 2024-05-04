const express = require('express');
const router = express.Router();

const { restoreUser, requireAuth } = require('../../utils/auth');
const { Review, ReviewImage } = require('../../db/models');

// Delete a Review Image
router.delete('/:imageId', restoreUser, requireAuth, async (req, res) => {
  const { id } = req.user;
  const { imageId } = req.params;

  const oneReviewImage = await ReviewImage.findByPk(parseInt(imageId), {
    include: [
      { model: Review }
    ]
  });

  if(oneReviewImage) {
    if(id === oneReviewImage.Review.userId) {
      oneReviewImage.destroy();
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
      message: "Review Image couldn't be found"
    });
  }
});

module.exports = router;
