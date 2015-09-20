function drawer_check(){
  if($("body").width() < 992){
    if(!drawer_open){
      drawer_element.css("left", -drawer_element.width()); 
      container_element.css("left", "auto");
      drawer_overlay.fadeOut();      
    }
    else{
      drawer_element.css("left", 0); 
      container_element.css("left", drawer_element.width());
      drawer_overlay.fadeIn();
    }
  }
  else{
    drawer_overlay.fadeOut();
    container_element.css("left", "auto");
    container_element.css("width", "");
    drawer_element.css("left", "auto");
  }
}

function close_drawer(){
  drawer_open = false;
  drawer_icon.className = drawer_icon.className.replace(/(?:arrow|hamburger)/ig, "hamburger");
  container_element.animate({
                    left: 0,
                }, 500).css("width", "");

  drawer_element.animate({
                    left: -drawer_element.width()
                }, 500, 
                function(){
                  drawer_overlay.fadeOut();
                });   
}

function open_drawer(){
  drawer_open = true;
  drawer_overlay.show(0);
  drawer_icon.className = drawer_icon.className.replace(/(?:arrow|hamburger)/ig, "arrow");
  container_element.animate({
                    left: drawer_element.width(),
                    width: container_element.width()
                }, 500, 
                function(){
                  drawer_overlay.fadeIn();
                });

  drawer_element.animate({
                    left: 0
                }, 500); 
}

$(function(){
  drawer_open = false;
  drawer_element = $("#drawer");
  container_element = $("#wrapper");
  drawer_overlay = $("#drawer_overlay");
  drawer_icon = $('[data-role="drawer_icon"]')[0];

  $(window).resize(function(){
    drawer_check();
    $("html, body").height($(window).height());
    $("#drawer").height($(window).height() - $(".header-panel").outerHeight());
    $("#current_page").height($(window).height());
  }).trigger("resize");

  drawer_check(); 
  $.material.init();
});

$("body").on("click", "[data-role='toggle_drawer']", function(){
  if(drawer_element.css("left").replace(/[^-\d\.]/g, '') < 0){
    open_drawer();
  }
  else{  
    close_drawer();
  }
});
