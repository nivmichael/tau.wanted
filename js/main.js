var href_url = 'http://tau.wanted.co.il/rpc/controller.php';
var user_id = null;
var CheckFields = null;

// Login Page
$('#Login_Page').on("pagebeforecreate", function() {
	if($('input').val() == '') {
		$('input').prev('div').show();
	} else {
		$('input').prev('div').hide();
	}
	if(localStorage.logged_in) {
		$(this).children().hide();
		verify_user_logged_in(localStorage.logged_in);
	}
});

$('#login_form').submit(function(e){
	e.preventDefault();
	loading('show');
	user_login();
});

// Registration Page
$('#registration_form').submit(function(e){
	e.preventDefault();
	loading('show');
	if(validate_registration()) {
		var $inputs = $('#registration_form :input');
	    var values = {};
	    $inputs.each(function() {
	        values[this.name] = $(this).val();
	    });
		register_user(values);
	}
});

// Home Page
$('#jobs_feed').on("pagecreate", function() {
	if(!localStorage.logged_in) {
		$(this).children().hide();
		$(':mobile-pagecontainer').pagecontainer('change',"#Login_Page");
		$('#Login_Page').children().show();
	} else {
		verify_user_logged_in(localStorage.logged_in);
	}
});

// Misc.
$('#logout').on('click', function(e) {
	$.mobile.loading( 'show');
	$.mobile.changePage(
	    window.location.href,
	    {
	      allowSamePageTransition : true,
	      transition              : 'none',
	      showLoadMsg             : false,
	      reloadPage              : true
	    }	    
	  );
	  localStorage.clear();
	  setTimeout(function(){location.reload(1)},0);	  
});

$('input').focus(function(){
	$(this).parent().prev('div').hide();
	var CheckFields = setInterval(function(){
	$('input').not(this).each(function(){
		if($(this).val() != '')
		$(this).parent().prev('div').hide();
	})
	},0);
});
$('input').blur(function(){
	if($(this).val() == '') {
		$(this).parent().prev('div').show();
	}
	if (CheckFields) {
		clearIntercal(CheckFields);
	}
});

/***************************************************/
/******************** Functions ********************/
/***************************************************/
function validate_registration() {
	loading('hide');
	var approved = true;
	$('#registration_form :input').each(function(){
		if ($(this).val() == '' || $(this).val() == null || $(this).val() == undefined) {
			$('#error_alert_content').html('כל השדות הינם שדות חובה');
			$('#lnkDialog').click();
			return approved = false;
		}
	})
	return approved;
}

function register_user(values) {
	var action = 'register_user';
	var parameters = {'values' : JSON.stringify(values)};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				if(data.success) {
					user_id = data.user_id;					
					first_name = values.register_first_name;
					last_name = values.register_last_name;
					name = first_name + " " + last_name;
					localStorage.logged_in = data.cookie.user + "." + name;
					$(':mobile-pagecontainer').pagecontainer('change',"#jobs_feed");
					get_jobs();
				}
				else {
					$('#error_alert_content').html(data.error);
					$('#lnkDialog').click();
				}
				loading('hide');
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function user_login() {
	var login_email = $('#login_email').val();
	var login_password = $('#login_password').val();
	var action = 'user_login';
	var parameters = {'login_email' : login_email, 'login_password' : login_password};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				if(data.success) {
					user_id = data.user_id;					
					first_name = data.first_name;
					last_name = data.last_name;
					name = first_name + " " + last_name;
					localStorage.logged_in = data.cookie.user + "." + name;
					$('.header_normal h1').text("שלום, " + name);
					$(':mobile-pagecontainer').pagecontainer('change',"#jobs_feed");
					get_jobs();
				}
				else {
					$('#login_error').css("visibility", "visible");
					loading('hide');
				}				
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function verify_user_logged_in(hash) {
	var action = 'verify_user_logged_in';
	var parameters = {'hash' : hash};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				if(data.success) {
					user_id = data.user_id;					
					var name = localStorage.logged_in.split(".");
					$('.header_normal h1').text("שלום, " + name[2]);
					$(':mobile-pagecontainer').pagecontainer('change',"#jobs_feed");
					get_jobs();
				}		
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function get_jobs() {
	loading('show');
	var action = 'get_jobs';
	var parameters = {'user_id' : user_id};
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				if(data.success) {
					$('#jobs_container').append(data.jobs);
					if(data.incomplete) {
						$('#jobs_container h3').prev('div').show();
					}
				}
				else {
					return false;
				}
			}
			loading('hide');
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function loading(showOrHide) {
    setTimeout(function(){
        $.mobile.loading(showOrHide);
    }, 1); 
}