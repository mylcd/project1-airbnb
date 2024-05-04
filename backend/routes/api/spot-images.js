const express = require('express');
const router = express.Router();

const { userNonEmpty } = require('../../utils/tools');

const { restoreUser } = require('../../utils/auth');
const { Spot, SpotImage } = require('../../db/models');

// Delete a Spot Image
router.delete('/:imageId', restoreUser, userNonEmpty, async (req, res) => {
  const { id } = req.user;
  const { imageId } = req.params;

  const oneSpotImage = await SpotImage.findByPk(parseInt(imageId), {
    include: [
      { model: Spot }
    ]
  });

  if(oneSpotImage) {
    if(id === oneSpotImage.Spot.ownerId) {
      oneSpotImage.destroy();
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
      message: "Spot Image couldn't be found"
    });
  }
});

module.exports = router;
