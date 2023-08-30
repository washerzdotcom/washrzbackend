import express from 'express';
const router = express.Router();

router.get('/admin', (req, res)=>
{
    res.status(2000).send({
        message: 'hii from admin side',
        code: 200
    })
});

module.exports = router;
