//not Found
const notFound = (req, res, next) =>{
    const error = new Error(`Not Found : ${req.originalUrl}`);
    return res.status(404).json({status: 'not-found', message: `Not Found: ${req.originalUrl}` });
    
 }
 
 // Error Handler
 const errorHandler = (error, req, res, next) => {
  console.log('An error occurred:', error);

  if (error instanceof CustomError) {
      return res.status(error.statusCode).json({status: 'error', message: error?.message });
  } else {
      return res.status(500).json({status: 'error', message: 'Internal Server Error' });
  }s
 };
 
 module.exports = { notFound, errorHandler }