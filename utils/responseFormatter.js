


const createSuccessResponse = (statusCode, info, message, res, req) => {
    let data = {};

    if(info) data = { ...info };
    if(req) {
        if(req?.token) data.token = req.token;
        if(req?.user){
            data.user = { 
               id: req?.user?.id,
               fullName: req?.user?.fullName,
               work: req?.user?.work,
               email: req?.user?.email,
               role: req?.user?.role,
            }    
       }
    }
    res.status(statusCode).json({ status: 'success', data , message });
}



module.exports = createSuccessResponse;