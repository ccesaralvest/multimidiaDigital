var custom = function custom(options) {
  console.log(options);
  var home = {
    loadData: function() {
      console.log("loadData");

    },
    init: function() {
      
      console.log("init");
      
      home.loadData();

      // Start slick
      $(".all-products-slider").slick({
        infinite: false,
        slidesToShow: 1,
        infinite: true
      });
    }
  };
  return {
    init: home.init,
  }
};
module.exports = custom;