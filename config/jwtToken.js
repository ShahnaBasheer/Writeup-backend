const sign =  require('jsonwebtoken');


const generateToken = (id) => {
    return sign({ id }, process.env.JWT_SECRET,{ expiresIn: "15m"});
};
const generateRefreshToken = (id) => {
    return sign({ id }, process.env.JWT_SECRET,{ expiresIn: "3d"});
};


export default{ generateToken, generateRefreshToken } 