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

function setHash(page, query, page_plugin){
  page = page || window.page;
  if(query != "" && query != undefined)
    page += "-search-"+query;
  else if(window.query_search)
    page += "-search-"+window.query_search;

  if(page_plugin>1){
      page += "-page-"+page_plugin;
  }
  else if(window.page_plugin>1)
    page += "-page-"+window.page_plugin;

  window.location.hash = page;
}

  var str = window.location.hash || "#home";
  var re = /#([^-]+)(?:-search-([^-]+))*(?:-page-([0-9])+)*/;
  anchor_data = re.exec(str);
  
  window.page = anchor_data[1] || "home";
  window.page = ""+window.page;
  window.query_search = anchor_data[2] || "";
  window.page_plugin = anchor_data[3] || 1;

  $(document).ready(function() {
    if (window.page != "home") {
      if(new RegExp(/^#dev_/).test(window.page))
        $("li[data-target=" + window.page + "]").parent("ul").parent("li").show();

      drawer_element.find("li[data-target=" + window.page + "]").trigger("click");
    }

    

    var longMessage = "This is a longer message that won't fit on one line. It is, inevitably, quite a boring thing. Hopefully it is still useful.";
    var shortMessage = 'Your message was sent';

    // document.getElementById('single').addEventListener('click', function() {
    //   createSnackbar(shortMessage);    
    // });

    E.populateSettings();

    $("body").on("click", '[data-action="save_settings"]', function(){
      E.saveSettings();
    })
  });

  $('body').on('click', '#drawer li', function() {

    if($("body").width() < 992 && typeof $(this).data("target") != "undefined"){
      close_drawer();
    }

    // Menu
    if (!$(this).data("target")) return;
    if ($(this).is(".active")) return;
    $(".menu li").not($(this)).removeClass("active");
    $(".page").not(page).removeClass("active").hide();
    window.page = $(this).data("target");
    var page = $("#"+window.page+"_tab");

    setHash("#"+window.page);
    $(this).addClass("active");


    page.show();

    var totop = setInterval(function() {
      $(".pages").animate({scrollTop:0}, 0);
    }, 1);

    setTimeout(function() {
      page.addClass("active");
      setTimeout(function() {
        clearInterval(totop);
      }, 1000);
    }, 100);
  });