const { getVolunteerHistory } = require('../models/VolunteerHistoryModel');

const getVolunteerHistoryById = (req, res) => {
    const volunteerId = parseInt(req.params.id, 10);

    if (isNaN(volunteerId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid volunteer ID',
        });
    }

    const history = getVolunteerHistory(volunteerId);

    if (!history.length) {
        return res.status(404).json({
            success: false,
            message: `No history found for volunteer ${volunteerId}`,
            data: [],
        });
    }

    res.status(200).json({
        success: true,
        volunteerId,
        count: history.length,
        data: history,
    });
};

module.exports = { getVolunteerHistoryById };
