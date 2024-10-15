

const Router = require('express');
const { getDashBoard } = require('../controllers/articleController');
const { authMiddleware, isUser } = require('../middlewares/authMiddleware');

const router = Router();


router.get('/dashboard', authMiddleware, isUser , getDashBoard);
router.get('/login', authMiddleware, isUser, getDashBoard);



module.exports = router;