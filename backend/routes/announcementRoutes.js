const express = require('express');
const router = express.Router();
const { createAnnouncement, getAllAnnouncements, deleteAnnouncement } = require('../controllers/announcementController');

router.get('/', getAllAnnouncements);
router.post('/', createAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;
