
var dao;


/**
  * Initializes the module and stores the dao.
  */
exports.setup = function (daoIn) {
    dao = daoIn;
}


/**
  * Loads data in the datastore to simulate a
  * production enviroment.
  */
exports.loadDevelopmentData = function () {
    storeDevelopmentData ();
}

/**
  * This wipes the datastore and then writes
  * the simulation data in the datastore.
  */
function storeDevelopmentData () {
    // first drop all collections
    dao.CleanDatastore (function () {
        // now that the db is clean lets add some simulated data
        dao.CreateNewUser ("michael dillon", "michaelcdillon", 
                           "michaelcdillon@me.com", function () {});
        dao.SaveNewPost ("apost.post", "SimTitle", "<h3>Simulated Content</h3><p>lorem ipsum</p>", 
                         Date (), "sim-commit-id-asdf877239sdkasf9", "michaelcdillon@me.com", 
                         "michaelcdillon", "michael dillon"); 
    });
}
