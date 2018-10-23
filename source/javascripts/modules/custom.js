var custom = function custom(options) {
    console.log(options);
    var home = {
        loadData: function () {
            console.log("loadData");
        },
        init: function () {
            console.log("init");
            home.loadData();
        }
    };
    return {
        init: home.init,
    }
};

module.exports = custom;