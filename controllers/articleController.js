const asyncHandler = require('express-async-handler');
const createSuccessResponse = require('../utils/responseFormatter');


const getDashBoard = asyncHandler( async(req, res) => {
   createSuccessResponse(200, null, "successfully", res, req)
})

module.exports = {
    getDashBoard
}