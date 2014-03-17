var href_url = 'http://tau.wanted.co.il/rpc/controller.php';
var user_id = null;
var CheckFields = null;
var max_eval_points = 390;
var details = null;

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
	//alert($('#register_education_status').val())
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
		if(user_id == null) {
			verify_user_logged_in(localStorage.logged_in);
		}
	}
});

// Profile Page
$('#profile_page').on("pagebeforecreate", function() {
	get_employment_categories();
});

$('#profile_page').on("pagebeforeshow", function() {
	if(!localStorage.logged_in) {
		$(this).children().hide();
		$(':mobile-pagecontainer').pagecontainer('change',"#Login_Page");
		$('#Login_Page').children().show();
	} else if(user_id == null) {
		$(':mobile-pagecontainer').pagecontainer('change',"#jobs_feed");
	} else {
		get_user();
		var field_name = '';
		var form_fields = $('#profile_form').serializeArray();
		//console.log(form_fields)		
		details['self_eval_'] = JSON.parse(details['self_eval_']);
		for (field in details['self_eval_']) {
			details['self_eval_' + field] = details['self_eval_'][field];
		}
		//console.log(details);
		$.each(form_fields, function(i, field){
			$this = $('#' + field.name);
			field_name = field.name;
			$this.val(details[field_name]);
			if($this.is("select")) {
				if(details[field_name] == '' || details[field_name] == null || !details[field_name]) {
					document.getElementById(field.name).selectedIndex = 0;
				}
				$this.prev('span').html($('#' + field_name + '>option:selected').text());
			} else if($this.hasClass("checkbox_array")) {
				var checkbox_array = $this.val();
				checkbox_array = JSON.parse(checkbox_array);
				for (var i in checkbox_array) {
			    	$(':checkbox[name=' + i + ']').click();
			    }
			} else if($this.hasClass("slider")) {
				$this.val(-$this.val());
				$this.next('div').children('a').css('left', parseInt(-details[field_name]) + '%');
			} else {			
				if($this.val() != '') {
					$this.parent().prev('div').hide();
				}			
			}		
	    });
	    
	    // Setting the jobs placeholders to 'disabled' after details were loaded,
	    // Otherwise Chrome doesn't recognize these fields
	    $('#employment_0_category option').first().attr('disabled', "true");
		$('#next_step_category option').first().attr('disabled', "true");
	}
});

/*
$(document).ready(function(){
	$('.ui-slider-handle').on("click", function(){
		alert(124)
		var total_eval = 0;	
		$('.slider').each(function(){
			total_eval += parseInt($(this).val());
			if(total_eval > 390) {
				alert(123)		
			}
		});		
	});
});
*/

$('.add_container').click(function(e){
	e.preventDefault();
	$(this).before($(this).prev('div').clone());	
})

// Misc.
$('.logout').on('click', function(e) {
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

$('.login_label').click(function(){
	$(this).next().children('input').focus();
});

$('input').focus(function(){
	$(this).parent().prev('div').hide();
	var CheckFields = setInterval(function(){
	$('input').each(function(){
		if($(this).val() != '') {
			$(this).parent().prev('login_label').hide();
		}
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
function get_employment_categories() {
	var action = 'get_employment_categories';
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				$('#employment_0_category').append(data.success);				
				$('#next_step_category').append(data.success);
			}
		}
	};	
	req.send("action=" + action);
}

function validate_registration() {
	loading('hide');
	var approved = true;
	$('#registration_form :input').each(function(){
		if ($(this).val() == '' || $(this).val() == null || $(this).val() == undefined) {
			$('#error_alert_content').html('כל השדות הינם שדות חובה');
			//$('#lnkDialog').click();
			approved = false;
		}
	});
	alert(approved);
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
				var data = JSON.parse(req.responseText);
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

function get_user() {
	loading('show');	
	var action = 'get_user';
	var parameters = {'user_id' : user_id};
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				loading('hide');
				if(data.success) {
					details = data.details;
					// Cloning iterated data like education, etc...
					for (var x in details) {						
						if (details[x]['iteration']) {
							var count = details[x]['iteration'];
							for(var i = 0; i < count; i++) {
								$('#' + x + " .add_container").click();
							}
						}
					}
				}
				else {					
					return false;
				}
			}	
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function loading(showOrHide) {
    setTimeout(function(){
        $.mobile.loading(showOrHide);
    }, 1); 
}