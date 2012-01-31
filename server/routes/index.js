
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.newPost = function (req, res) {
    console.log (req);
    res.render ('index', {title: 'Express'});
}
