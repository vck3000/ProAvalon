const { Router } = require('express');
const router = new Router();

router.get('/', (req, res) => {
    console.log('ip:', req.ip);
    res.render('lobby', {
        headerActive: 'lobby',
        optionsCog: true,
    });
});

module.exports = router;
