


const createSuccessResponse = (statusCode, info, message, res, req) => {
    let data = {};

    if(info) data = { ...info };
    if(req) {
        if(req?.token) data.token = req.token;
        if(req?.user){
            data.user = req.user;
        }     
    }
    res.status(statusCode).json({ status: 'success', data , message });
}



module.exports = createSuccessResponse;