﻿var href_url = 'http://tau.wanted.co.il/rpc/controller.php';
var user_id = null;
var CheckFields = null;
var details = null;
var profile_loaded = false;
var jobs_loaded = null;
var faculty_corses_loaded = false;

/* Pull Down to Refresh *//*
var myScroll, pullDownEl, pullDownOffset;

function loaded()
	pullDownEl = document.getElementById('test');
	pullDownOffset = pullDownEl.offsetHeight;
		
	myScroll = new iScroll('jobs_test', {
		vScrollbar: true,
		hideScrollbar: true,
		scrollbarClass: 'myScrollbar',
		useTransition: true,
		topOffset: 0,
		onRefresh: function () {
			$('.pullDownIcon').css('opacity', '1');
			pullDownEl.querySelector('#loading_text').innerHTML = 'משכו למטה לרענון משרות...';
		},
		onScrollMove: function () {
			if (this.y > 55 && !pullDownEl.className.match('flip')) {
				pullDownEl.className = 'flip';
				pullDownEl.querySelector('#loading_text').innerHTML = 'שחררו לרענות משרות';
				$('.pullDownIcon').css('opacity', '1');
				this.minScrollY = 55;
			} else if (this.y < 55 && pullDownEl.className.match('flip')) {
				pullDownEl.className = '';
				pullDownEl.querySelector('#loading_text').innerHTML = 'משכו למטה לרענון משרות...';
				$('.pullDownIcon').css('opacity', '1');
				this.minScrollY = 0;
			} else {
			}
		},
		onScrollEnd: function () {
			if (pullDownEl.className.match('flip')) {
				pullDownEl.querySelector('#loading_text').innerHTML = 'מרענן משרות...';
				$('.pullDownIcon').css('opacity', '0');
				get_jobs(true);
				myScroll.refresh();
			}
		}
	});	
	
	////////////////////////////////////////////
	$('input').not(':checkbox').each(function(){
		if($(this).val() != '') {
			$(this).parent().prev('div').hide();
		}
	});
	////////////////////////////////////////////
	
	myScroll.refresh();
}*/

//document.getElementById('jobs_feed').addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
//document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);

// Login Page
$('#Login_Page').on("pagebeforecreate", function() {
	/*if($('input').val() == '') {
		$('input').prev('div').show();
	} else {
		$('input').prev('div').hide();
	}*/
	if(localStorage.logged_in) {
		$(this).children().hide();
		verify_user_logged_in();
	}
});

$('#login_form').submit(function(e){
	e.preventDefault();
	loading('show');
	user_login();
});

// Registration Page
$('#registration_page').on("pagebeforecreate", function() {
	get_cities();
});

$('#registration_form').submit(function(e){
	e.preventDefault();
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
$('#jobs_feed').on("pagebeforecreate", function() {
	// We're doing it here ONCE, assuming that #jobs_feed will always be shown before #profile_page, therefore created earlier
	// This way tha Faculty Courses will be already on page and will not interrupt other JS regarding them
	if(!faculty_corses_loaded) { 
		get_faculty_courses();
	}
});

$('#jobs_feed').on("pagebeforeshow", function() {
	loading('show');
	if(!localStorage.logged_in) {
		$(this).hide();
		$(':mobile-pagecontainer').pagecontainer('change',"#Login_Page");
		//location.reload(1);
	} else {
		if(user_id == null) {
			verify_user_logged_in();
		}
	}
	
	$( document ).on( "swipeleft", "#jobs_feed", function( e ) {
		if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
			if ( e.type === "swipeleft"  ) {
				$( "#panel" ).panel( "open" );
			}
		}
	});
});

/*
var save_scrollTop = 0;

$('#jobs_container').on('touchstart', function(e){
	//save_scrollTop = myScroll.y;
});
*/

$(document).on('click', '.job_result', function(){
	job_title = $(this).find('div').next().html();
	$(this).find('.description').slideToggle('fast');
});

$('#refresh_jobs').click(function(){
	get_jobs(true);
});

/*$(document).on('click', '.job_result button', function() {
	if(confirm('להגיש מועמדות למשרה: ' + job_title + '?')) {
		apply_to_job(job_id, job_title, $(this).closest('.job_result'));
	} else {
		return false;
	}
});*/

/*
// Profile Page
$('#profile_page').on("pagebeforecreate", function() {
	get_employment_categories();
	get_cities();
	
	if(!faculty_corses_loaded) { 
		get_faculty_courses();
	}
	
	$('#education input:checkbox').on('click', function() {
		var $arr_values = $(this).parent().siblings(':hidden');
		if($arr_values.val().length > 0) {	    
		    var current_values = JSON.parse($arr_values.val());
		    if ($(this).is(':checked')) {
		    	current_values[$(this).attr('name')] = {};  
		    } else {
		    	delete current_values[$(this).attr('name')];
		    }
		    $arr_values.val(JSON.stringify(current_values));
		}  
	});
});

$('#profile_page').on("pagebeforeshow", function() {
	if(!localStorage.logged_in) {
		$(this).hide();
		$(':mobile-pagecontainer').pagecontainer('change',"#Login_Page");
		location.reload(1);
	} else if (!profile_loaded) {
		if(user_id == null) {
			user_id = localStorage.logged_in.slice(0, localStorage.logged_in.indexOf('.'));
			name = localStorage.logged_in.slice(localStorage.logged_in.lastIndexOf('.') + 1);
			$('.header_normal h1').html("שלום,<br />" + name);
			get_user();
			get_jobs();
			profile_loaded = true;
			/*$('body *').not('.ui-loader').hide();
			$(':mobile-pagecontainer').pagecontainer('change',"#jobs_feed");
			setTimeout(function(){
				location.reload(1);
			}, 2000);*//*
		} else {
			get_user();
			profile_loaded = true;
		}
	}
});
*/

// Panels
$('#personal_details').on("pagebeforeshow", function() {
	$( document ).on( "swipeleft", "#personal_details", function( e ) {
		if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
			if ( e.type === "swipeleft"  ) {
				$( "#panel_2" ).panel( "open" );
			}
		}
	});
});

$('#education').on("pagebeforeshow", function() {
	$( document ).on( "swipeleft", "#education", function( e ) {
		if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
			if ( e.type === "swipeleft"  ) {
				$( "#panel_3" ).panel( "open" );
			}
		}
	});
});

$('#employment').on("pagebeforeshow", function() {
	$( document ).on( "swipeleft", "#employment", function( e ) {
		if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
			if ( e.type === "swipeleft"  ) {
				$( "#panel_4" ).panel( "open" );
			}
		}
	});
});

/*$('#self_eval').on("pagebeforeshow", function() {
	$( document ).on( "swipeleft", "#self_eval", function( e ) {
		if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
			if ( e.type === "swipeleft"  ) {
				$( "#panel_5" ).panel( "open" );
			}
		}
	});
});*/

$('#additional_details').on("pagebeforeshow", function() {
	$( document ).on( "swipeleft", "#additional_details", function( e ) {
		if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
			if ( e.type === "swipeleft"  ) {
				$( "#panel_6" ).panel( "open" );
			}
		}
	});
});

$('#next_step').on("pagebeforeshow", function() {
	$( document ).on( "swipeleft", "#next_step", function( e ) {
		if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
			if ( e.type === "swipeleft"  ) {
				$( "#panel_7" ).panel( "open" );
			}
		}
	});
});

$('#build_profile').on("pagebeforeshow", function() {
	$( document ).on( "swipeleft", "#build_profile", function( e ) {
		if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
			if ( e.type === "swipeleft"  ) {
				$( "#panel_8" ).panel( "open" );
			}
		}
	});
});

/*
$('#submit_profile').click(function(e){
	loading('show');
	e.preventDefault();
	var form_fields = $('#profile_form').serializeArray();
	var fields_object = {};
	fields_object['gallery'] = {};
	var self_eval = [];
	$.each(form_fields, function(i, field){
		fields_object[field.name] = field.value;
		$this = $('#' + field.name);
		if($this.is('select')) {
			if($this.prop("selectedIndex") == 0) {
				delete fields_object[field.name];
			}
		} else if($('input[name=' + field.name + ']').hasClass('gallery_image')) {
			delete fields_object[field.name];
			fields_object['gallery'][i] = field.name;
		} else if($('input[name=' + field.name + ']').is(':checkbox')) {
			delete fields_object[field.name];
		} else if((field.value == '{}' || field.value == '') && !$this.is(':password')) {
			delete fields_object[field.name];
		} else if($this.hasClass('slider')) {
			self_eval.push(-field.value);
			delete fields_object[field.name];
		}
	});
	self_eval = '{"fielda":"' + self_eval[0] +
				'","fieldb":"' + self_eval[1] +
				'","fieldc":"' + self_eval[2] +
				'","fieldd":"' + self_eval[3] +
				'","fielde":"' + self_eval[4] + 
				'"}';
	fields_object['self_eval'] = self_eval;
	update_user(fields_object);
});
*/

// Misc.
$('.logout').on('click', function(e) {
	$.mobile.loading('show');
	//var check_fb_connected = getLoginStatus();
	localStorage.clear();
	user_id = null;
	setTimeout(function(){
		//if(check_fb_connected) {
			//logout();
		//}
		$(':mobile-pagecontainer').pagecontainer('change',"#Login_Page");
		//location.reload(1);
	}, 1500);
});
/*
$('.input_placeholder').click(function(){
	$(this).next().children('input').focus();
});

$('input').on('focus', function(){
	$(this).parent().prev('div').hide();
	var CheckFields = setInterval(function(){
	$('input').each(function(){
		if($(this).val() != '') {
			$(this).parent().prev('div').hide();
		}
	});
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
*/
$('#build_profile button').click(function(e) {
	e.preventDefault();
});

$('.right_pannel p a').click(function() {
	get_user($(this).attr('href').replace('#', ''));
});

/***************************************************/
/******************** Functions ********************/
/***************************************************/
function takePicture() {
	navigator.camera.getPicture(
		function(uri) {
        	var img = document.getElementById('camera_image');
			img.style.visibility = "visible";
			img.style.display = "block";
			img.src = uri;
		},
		function(e) {
			$('#error_alert_content').html('קרתה שגיאה, אנא נסו שנית.');
			$('#lnkDialog').click();
		},
		{ quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI});
};

function selectPicture() {
	navigator.camera.getPicture(
		function(uri) {
			var img = document.getElementById('camera_image');
			img.style.visibility = "visible";
			img.style.display = "block";
			img.src = uri;
		},
		function(e) {
			$('#error_alert_content').html('קרתה שגיאה, אנא נסו שנית.');
			$('#lnkDialog').click();
		},
		{ quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY});
};

function uploadPicture() {
	// Get URI of picture to upload
	var img = document.getElementById('camera_image');
	var imageURI = img.src;
	if (!imageURI || (img.style.display == "none")) {
		$('#error_alert_content').html('יש לצלם תמונה במצלמה, או לבחורה תמונה קיימת מהמכשיר.');
		$('#lnkDialog').click();
		return;
	}

	if (href_url) {
		// Specify transfer options
		var options = new FileUploadOptions();
		options.fileKey="file";
		options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
		options.mimeType="image/jpeg";
		options.chunkedMode = true;

		var params = new Object();
		params.hash_verify = localStorage.logged_in;
		options.params = params;

		// Transfer picture to server
		loading('show');
		var ft = new FileTransfer();
		ft.upload(imageURI, href_url, function(r) {
			$('#error_alert_content').html(r.response);
			$('#lnkDialog').click();
			viewUploadedPictures();
		}, function(error) {
			$('#error_alert_content').html('שגיאה בעת העלאת הקובץ, אנא נסו שנית.');
			$('#lnkDialog').click();
		}, options);
    }
}

function viewUploadedPictures() {
	if (href_url) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", href_url, true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.onreadystatechange=function(){
			if(xmlhttp.readyState === 4){
				if (xmlhttp.status === 200) {
					data = xmlhttp.responseText;
					$('#build_profile .ui-collapsible-content h3').next('fieldset').andSelf().remove();
					$('#build_profile .ui-collapsible-content').prepend(data).trigger('create');
				}
				else {
					$('#error_alert_content').html('קרתה תקלה, אנא נסו שוב מאוחר יותר.');
					$('#lnkDialog').click();
				}
				loading('hide');
			}
		};
		xmlhttp.send("get_gallery=1&user_id=" + user_id);       	
    }	
}

function get_job_description(job_id, $this) {
	loading('show');
	var action = 'get_job_description';
	var parameters = {'job_id' : job_id};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				if(data.success) {
					$this.css({'opacity': '0.7', 'cursor': 'default'});
					$this.append('<div style="text-align: center;color: red;">הוגשה מועמדות</div>');
				}
				else {
					$('#error_alert_content').html('לא היה ניתן להגיש מועמדות למשרה. אנא נסו שנית.');
					$('#lnkDialog').click();
				}
				loading('hide');
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function verify_apply(job_id) {
	if(confirm('להגיש מועמדות למשרה: ' + job_title + '?')) {
		apply_to_job(job_id, job_title, $('#' + job_id).closest('.job_result'));
	} else {
		return false;
	}
}

function apply_to_job(job_id, job_title, $this) {
	loading('show');
	var action = 'apply_to_job';
	var parameters = {'user_id' : user_id, 'job_id' : job_id, 'job_title' : job_title};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				if(data.success) {
					$this.css({'opacity': '0.7', 'cursor': 'default'});
					$this.find('button').hide();
					$this.append('<div style="text-align: center;color: red;">הוגשה מועמדות</div>');
				}
				else {
					$('#error_alert_content').html('לא היה ניתן להגיש מועמדות למשרה. אנא נסו שנית.');
					$('#lnkDialog').click();
				}
				loading('hide');
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function update_user(values, section) {
	var action = 'update_user';
	var parameters = {'user_id' : user_id, 'values' : values, 'hash': localStorage.logged_in, 'section': section};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				if(data.success) {
					alert("הפרטים עודכנו בהצלחה.");
					user_id = data.user_id;
					
					if(section == 'personal_details') {					
						first_name = values.first_name;
						last_name = values.last_name;
						name = first_name + " " + last_name;
						localStorage.logged_in = data.cookie.user + "." + name;
					}
					//location.reload(1);
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

function get_faculty_courses(faculty_array) {
	var action = 'get_faculty_courses';
	var parameters = {};
	if(faculty_array) {
		parameters = {'faculty_array' : faculty_array};
	}	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				if(data.success && data.success.length > 0) {
					if(faculty_array) {						
						$('#choose_content').append(data.success).trigger('create');
					} else {
						faculty_corses_loaded = true;
						$('.faculty_list').prepend(data.success).trigger('create');
					}
				}
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function get_employment_sub_categories(category, container, type) {
	var action = 'get_employment_sub_categories';
	var parameters = {'category' : category, 'type' : type};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				if(type == 'multiple') {
					if(data.success && data.success.length > 0) {
						$('#choose_content').append('<fieldset data-role="controlgroup">' + data.success + '</fieldset>').trigger('create');
					}
				} else {
					var $sub_container = $('#' + container).parent().parent().next('.ui-select').find('select');
					var job_label = '<option>משרה</option>';
					$sub_container.html('');
					$sub_container.append(job_label);
					if(data.success && data.success.length > 0) {
						$sub_container.append(data.success);					
					}
					$('#' + $sub_container.attr('id')).prev('span').html('משרה');
				}
				loading('hide');
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function get_employment_categories() {
	var action = 'get_employment_categories';
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				$('.job_categories').append(data.success);
			}
		}
	};	
	req.send("action=" + action);
}

function get_cities() {
	var action = 'get_cities';
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				$('.cities').append(data.success);
			}
		}
	};	
	req.send("action=" + action);
}

function validate_registration() {
	loading('hide');
	var approved = true;
	$('#registration_form :input').each(function(){
		if (($(this).val() == '' || $(this).val() == null || $(this).val() == undefined) &&
		$(this).attr('id') != 'register_education_status' && $(this).attr('id') != 'register_family_status') {
			$('#error_alert_content').html('כל השדות הינם שדות חובה');
			$('#lnkDialog').click();
			approved = false;
		}
	});
	return approved;
}

function register_user(values) {
	var action = 'register_user';
	var parameters = {'values' : JSON.stringify(values)};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
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
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
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
					$('.header_normal h1').html("שלום,<br />" + name);
					$(':mobile-pagecontainer').pagecontainer('change',"#jobs_feed");
					get_jobs(true);
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

function verify_user_logged_in() {
	var action = 'verify_user_logged_in';
	var parameters = {'hash' : localStorage.logged_in};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				if(data.success) {
					user_id = data.user_id;					
					var name = localStorage.logged_in.split(".");
					$('.header_normal h1').html("שלום,<br />" + name[2]);
					$(':mobile-pagecontainer').pagecontainer('change',"#jobs_feed");
					if(jobs_loaded == null) {
						get_jobs();
						jobs_loaded = setInterval(function() {
							get_jobs();
						}, 60 * 1000 * 60);
					}
				} else {
					$(':mobile-pagecontainer').pagecontainer('change',"#Login_Page");
					localStorage.clear();
					//location.reload(1);
				}
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function get_jobs(override) {
	loading('show');
	var action = 'get_jobs';
	var parameters = {'user_id' : user_id, 'override': override};
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				if(data.success) {
					if(override) {
						$('.incomplete').hide();
						$('.job_result').remove();
						//$('.pullDownIcon').css('opacity', '1');
					}
					
					$('#jobs_container').append(data.jobs).trigger('create');
					
					if(data.incomplete) {
						$('.incomplete').show();
					}
				}
				loading('hide');
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function get_user(section) {
	loading('show');	
	var action = 'get_user';
	var parameters = {'user_id' : user_id, 'section' : section};
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, true);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				if(data.success) {
					details = data.details;
					
					if($('#' + section).find('form').length == 0) {
						/*if (section == 'build_profile') {
							$('#build_profile .ui-content').append('<form autocomplete="off" data-ajax="true" method="post" class="profile_form">' +
								details + '</form><button class="submit_profile">שמירה</button>').trigger('create');
						} else {*/
						if(details != 'none') {
							$('#' + section).find('.ui-content').append('<form autocomplete="off" data-ajax="true" method="post" class="profile_form">' +
								details + '</form><button class="submit_profile">שמירה</button>').trigger( "create" );
						} else {
							$('#' + section).find('.ui-content').append('<span style="color:red;margin-top:15px">שימו לב: באפליקצייה לא ניתן לערוך אזורים בפרופיל'
							+ ' שמכילים יותר מ-2 אפשרויות (לדוגמא: 3 שפות). על מנת לערוך אזור זה, גשו למערכת דרך המחשב.</span>').trigger( "create" );
						}
						//}
					
						// Pick Jobs/Courses button
						$('.choose_button').on('click',function(e, data) {
							loading('show');
							var $hidden_array = $(this).prev();
							var hidden_array_id = $hidden_array.attr('id');
							var checked_values = $hidden_array.val();
							var type = $(this).text().replace("בחירת ", '');
							$('#choose_content').html('');
							if(type == 'משרות') {
								if($(this).siblings('div').find('select>option:selected').text() == '') {
									$('#error_alert_content').html('יש לבחור משרה');
									$('#lnkDialog').click();
									loading('hide');
									return false;
								}
								
								checked_values = JSON.parse(checked_values);
	
								get_employment_sub_categories($(this).siblings('div').find('select').val(), '', 'multiple');
								for (var x in checked_values) {
									$(':checkbox[value=' + checked_values[x] + ']').click();
								}
							} else {
								if(checked_values == '{}') {
									$('#error_alert_content').html('יש לבחור פקולטה');
									$('#lnkDialog').click();
									loading('hide');
									return false;
								}
								
								checked_values = JSON.parse(checked_values);
								get_faculty_courses(checked_values);
								
								for (var x in checked_values) {
									for (var y in x) {	
										$(':checkbox[value=' + x[y] + ']').click();
									}
								}
							}	
							$('#choose_dialog div h2').text($(this).text());
							$('#lnkChooseDialog').click();
							
							$('#confirm_choise').one('click', function(){
								checked_values = {};
								if(type == 'משרות') {			
									$(this).parent().prev().find(':checkbox').each(function(){
										if($(this).prop('checked')) {
											checked_values[$(this).siblings('label').text()] = $(this).val();
										}			
									});
								} else {
									var old_faculty = '';
									$(this).parent().prev().find(':checkbox').each(function(){
										var faculty = $(this).parent().parent().parent().prev('h3').text().replace(' ', '_');
										if(faculty != old_faculty) {
											checked_values[faculty] = {};
											old_faculty = faculty;
										}
										if($(this).prop('checked')) {					
											var course = $(this).siblings('label').text();
											checked_values[faculty][course] = $(this).val();
										}			
									});
								}
								$('#'+hidden_array_id).val(JSON.stringify(checked_values));
							});
						});
						
						// Faculties checkboxes
						$('#education input:checkbox').on('click', function() {
							var $arr_values = $(this).parent().siblings(':hidden');
							if($arr_values.val().length > 0) {	    
							    var current_values = JSON.parse($arr_values.val());
							    if ($(this).is(':checked')) {
							    	current_values[$(this).attr('name')] = {};  
							    } else {
							    	delete current_values[$(this).attr('name')];
							    }
							    $arr_values.val(JSON.stringify(current_values));
							}  
						});
						
						// Iteration containers
						$('.add_container').click(function(e){
							e.preventDefault();
							$(this).hide();
							$(this).prev('div').show();
							$(this).prev('div').find('input, select').prop('disabled', false);
						});
						
						$('.remove_container').click(function(e){
							e.preventDefault();
							$(this).parent().siblings('.add_container').show();
							$(this).parent().hide();
							$(this).parent().find('input, select').prop('disabled', true);
						});
						
						// Pick job category => get jobs
						$('.job_categories').change(function(){
							var category = this.value;
							if($(this).attr('id') == 'next_step_category') {
								get_employment_sub_categories(category, $(this).attr('id'));
							} else 
							{
								$(this).parent().parent().next('input').val('{}');
							}
						});
						
						// Self Evaluation handler, only if set.
						var current_vals = [];
					    var new_val = 0;
					    var total = 390 - parseInt($('#remaining_points span').html());
					    $('.slider').each(function(){
					    	current_vals[$(this).attr('id')] = parseInt($(this).val());
					    });
					    $('.slider').change(function(){
					    	new_val = parseInt($(this).val());
					    	if (total + new_val - current_vals[$(this).attr('id')] > 390) {
					    		new_val -= (total + new_val - current_vals[$(this).attr('id')] - 390);
					    		$(this).val(new_val);
					    		$(this).next('div').children('a').css('left', new_val + '%');
					    	}
					    	if(new_val != current_vals[$(this).attr('id')]) {
					    		$('#remaining_points span').html(parseInt($('#remaining_points span').html()) - parseInt(new_val - current_vals[$(this).attr('id')]));
					    		total = 390 - parseInt($('#remaining_points span').html());
					    		current_vals[$(this).attr('id')] = new_val;
					    	}
					    });
					    
					    // Submit Button
					    $('#' + section + ' .submit_profile').on('click', function(e){
							loading('show');
							e.preventDefault();
							var form_fields = $(this).prev('form').serializeArray();
							var fields_object = {};
							
							if($(this).closest('.ui-page').attr('id') == 'self_eval') {
								var self_eval = [];
								$.each(form_fields, function(i, field){
									self_eval.push(-field.value);
									delete fields_object[field.name];
								});
								self_eval = '{"fielda":"' + self_eval[0] +
											'","fieldb":"' + self_eval[1] +
											'","fieldc":"' + self_eval[2] +
											'","fieldd":"' + self_eval[3] +
											'","fielde":"' + self_eval[4] + 
											'"}';
								fields_object['self_eval'] = self_eval;
							} else if($(this).closest('.ui-page').attr('id') == 'build_profile') {
								fields_object['gallery'] = {};
								$.each(form_fields, function(i, field){
									delete fields_object[field.name];
									fields_object['gallery'][i] = field.name;
								});
							} else {
								$.each(form_fields, function(i, field){
									fields_object[field.name] = field.value;
									$this = $('#' + field.name);
									if($this.is('select')) {
										if($this.prop("selectedIndex") == 0) {
											delete fields_object[field.name];
										}
									}  else if($('input[name=' + field.name + ']').is(':checkbox')) {
										delete fields_object[field.name];
									} else if((field.value == '{}' || field.value == '') && !$this.is(':password')) {
										delete fields_object[field.name];
									}
								});
							}
							
							update_user(fields_object, $(this).closest('.ui-page').attr('id'));
						});
					}
					/*
					for(var x in details) {
						if (details[x]['iteration'] > 0) {
							$('#' + x + " .add_container").click();
						}
					}
					
					var field_name = '';
					var form_fields = $('#profile_form').serializeArray();
					
					// Explode self evaluation object into seperate fields...
					if ('self_eval_' in details) {
						details['self_eval_'] = JSON.parse(details['self_eval_']);
						for (field in details['self_eval_']) {
							details['self_eval_' + field] = details['self_eval_'][field];
							$('#remaining_points span').html(parseInt($('#remaining_points span').html()) + parseInt(details['self_eval_'][field]));
						}
					} else {
						$('#remaining_points span').html(40);
					}
					
					$.each(form_fields, function(i, field){
						field_name = field.name;
						$this = $('#' + field_name);
						if(details[field_name]) {
							$this.val(details[field_name]);
						}
						if($this.is("select")) {
							if(details[field_name] == '' || details[field_name] == null || !details[field_name]) {
								document.getElementById(field_name).selectedIndex = 0;
							}
							$this.prev('span').html($('#' + field_name + '>option:selected').text());
						} else if($this.hasClass("checkbox_array")) {
							var checkbox_array = $this.val();
							var id_value = $this.attr('id');
							id_value = id_value.slice(id_value.indexOf("_") + 1, id_value.lastIndexOf("_"));
							if (checkbox_array){
								checkbox_array = JSON.parse(checkbox_array);
								for (var i in checkbox_array) {
							    	$this.parent().find(':checkbox[name=' + i + ']').click();
							    }
							}
						} else if($this.hasClass("slider") && 'self_eval_' in details) {
							$this.val(-$this.val());
							$this.next('div').children('a').css('left', parseInt(-details[field_name]) + '%');
						} else { // Input type 'text' 
							/*if($this.val() != '') {
								$this.parent().prev('div').hide(); // Hide Placeholders if value is set...
							}*/	   /*		
						}
				    });
				    
				    // Set Next_Step profession & category if exists, else: set to default.
				    if(details['next_step_profession'] && details['next_step_category'] != 'no_experience') {
				    	get_employment_sub_categories(details['next_step_category'], 'next_step_category');
				    	$('#next_step_profession').val(details['next_step_profession']);
				    } else {
				    	document.getElementById('next_step_profession').selectedIndex = 0;
				    }
				    $('#next_step_profession').prev('span').html($('#next_step_profession>option:selected').text());
				    
				    // Show existing gallery photos before Upload Form
			    	$('#build_profile .ui-collapsible-content').prepend(details['gallery']).trigger('create');
				    
				    */
				}
				loading('hide');
			}	
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function loading(showOrHide) {
	$.mobile.loading(showOrHide);
}