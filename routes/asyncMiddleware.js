// return a function that wraps an async middleware
module.exports = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        console.log(err);
        req.flash('error', 'Something has gone wrong! Please contact a moderator or admin.');
        res.redirect('/');
    });
};
