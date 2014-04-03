var href_url = 'http://tau.wanted.co.il/rpc/controller.php';
var user_id = null;
var CheckFields = null;
var details = null;
var profile_loaded = false;
var jobs_loaded = null;

$('#jobs_container').on('mousedown', function(e){
	mouseY = e.pageY;
	mouselimit = 0;
	$(this).on('mousemove', function(e){
		if(mouseY != e.pageY) {
			current_margin = parseInt($('#test').css('margin-top'));
			move_pixels = e.pageY-mouseY
			new_margin = current_margin + move_pixels;
			if(new_margin < -37) {
				new_margin = -37;
			} else if(new_margin > 10) {
				$('#test #loading_text').html('שחררו לרענן משרות...');
				$('#test').addClass('flip');
				new_margin = 10;				
			} else if (new_margin > 100000) {
				
			} else {
				$('#test #loading_text').html('משכו למטה לרענון משרות...');
				$('#test').removeClass('flip');
			}
			$('#test').animate({'margin-top': new_margin + 'px'}, 30);
			mouseY = e.pageY;
		}
	})
});
$('#jobs_container').on('mouseup', function(e){
	mouseY = -1;
	$(this).off('mousemove');
	if(new_margin == 10) {
		new_margin = -37;
		$('#test #loading_text').html('מרענן משרות...');
		$('#test').removeClass('flip');
		$('.pullDownIcon').css('opacity', '0');
		get_jobs(true);
	} else {
		$('#test').animate({'margin-top': -37 + 'px'}, 100);
		$('#test #loading_text').html('משכו למטה לרענון משרות...');
		$('#test').removeClass('flip');		
	}
});
$('#jobs_container :not(#jobs_container *)').on('mouseout', function(e){
	mouseY = -1;
	$(this).off('mousemove');
	$('#test').animate({'margin-top': -37 + 'px'}, 100);
	$('#test #loading_text').html('משכו למטה לרענון משרות...');
	$('#test').removeClass('flip');
});

// Login Page
$('#Login_Page').on("pagebeforecreate", function() {
	$('#cover').hide();
	if($('input').val() == '') {
		$('input').prev('div').show();
	} else {
		$('input').prev('div').hide();
	}
	if(localStorage.logged_in) {
		$(this).children().hide();
		verify_user_logged_in('jobs_feed');
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
$('#jobs_feed').on("pagebeforeshow", function() {
	loading('show');
	if(!localStorage.logged_in) {
		$(':mobile-pagecontainer').pagecontainer('change',"#Login_Page");
	} else {
		$('#cover').hide();
		if(user_id == null) {
			verify_user_logged_in('jobs_feed');
		}
	}
});

// Profile Page
$('#profile_page').on("pagebeforecreate", function() {
	get_employment_categories();
	get_faculty_courses({},true);
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
	$('#cover').hide();
	if(!localStorage.logged_in) {
		$(this).children().hide();
		$(':mobile-pagecontainer').pagecontainer('change',"#Login_Page");
		$('#Login_Page').children().show();
	} else if (!profile_loaded) {
		if(user_id == null) {
			verify_user_logged_in('profile_page');
		}
		get_user();
		
	   	        
	    profile_loaded = true;
	}
});

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

$('.job_categories').change(function(){
	var category = this.value;
	if($(this).attr('id') == 'next_step_category') {
		get_employment_sub_categories(category, $(this).attr('id'));
	} else 
	{
		$(this).parent().parent().next('input').val('{}');
	}
});

$('.choose_button').on('click',function(e, data) {
	loading('show');
	var $hidden_array = $(this).prev();
	var hidden_array_id = $hidden_array.attr('id');
	var checked_values = JSON.parse($hidden_array.val());
	var type = $(this).text().replace("בחירת ", '');
	$('#choose_content').html('');
	if(type == 'משרות') {
		if($(this).siblings('div').find('select>option:selected').text() == 'תחום ראשי') {
			$('#error_alert_content').html('יש לבחור משרה');
			$('#lnkDialog').click();
			loading('hide');
			return false;
		}		
		get_employment_sub_categories($(this).siblings('div').find('select').val(), '', 'multiple');
		for (var x in checked_values) {
			$(':checkbox[value=' + checked_values[x] + ']').click();
		}
	} else {
		if(checked_values.length == 0) {
			$('#error_alert_content').html('יש לבחור פקולטה');
			$('#lnkDialog').click();
			loading('hide');
			return false;
		}
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
					var course = $(this).siblings('label').text()					
					checked_values[faculty][course] = $(this).val();
				}			
			});
		}
		$('#'+hidden_array_id).val(JSON.stringify(checked_values));
	});
});

$('#submit_profile').click(function(e){
	loading('show');
	e.preventDefault();
	var form_fields = $('#profile_form').serializeArray()
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

// Misc.
$('.logout').on('click', function(e) {
	$.mobile.loading('show');
	localStorage.clear();
	user_id = null;
	setTimeout(function(){
		$.mobile.changePage(
		    window.location.href,
		    {
		      allowSamePageTransition : true,
		      transition              : 'fade',
		      showLoadMsg             : false,
		      reloadPage              : true
		    }	    
		  );
	}, 2000);
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
function update_user(values) {
	var action = 'update_user';
	var parameters = {'user_id' : user_id, 'values' : values, 'hash': localStorage.logged_in};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				if(data.success) {
					alert("הפרטים עודכנו בהצלחה.");
					user_id = data.user_id;					
					first_name = values.first_name;
					last_name = values.last_name;
					name = first_name + " " + last_name;
					localStorage.logged_in = data.cookie.user + "." + name;
					location.reload(1);
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

function get_faculty_courses(faculty_array, get_all) {
	if(typeof(get_all)==='undefined') get_all = false;
	var action = 'get_faculty_courses';
	var parameters = {};
	if(!get_all) {
		parameters = {'faculty_array' : faculty_array};
	}	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				var data = JSON.parse(req.responseText);
				if(data.success && data.success.length > 0) {
					if(!get_all) {						
						$('#choose_content').append(data.success).trigger('create');
					} else {
						$('.faculty_list').prepend(data.success).trigger('create');
					}
				}
				loading('hide');
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
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
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
	req.open("POST", href_url, false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
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

function validate_registration() {
	loading('hide');
	var approved = true;
	$('#registration_form :input').each(function(){
		if ($(this).val() == '' || $(this).val() == null || $(this).val() == undefined) {
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
	req.open("POST", href_url, false);
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
	req.open("POST", href_url, false);
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

function verify_user_logged_in(page) {
	var action = 'verify_user_logged_in';
	var parameters = {'hash' : localStorage.logged_in};	
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				if(data.success) {
					user_id = data.user_id;					
					var name = localStorage.logged_in.split(".");
					$('.header_normal h1').text("שלום, " + name[2]);
					$(':mobile-pagecontainer').pagecontainer('change',"#" + page);
					if(jobs_loaded == null) {
						get_jobs();
						jobs_loaded = setInterval(function() {
							get_jobs();
						}, 60 * 1000 * 60);
					}
				} else {
					$(':mobile-pagecontainer').pagecontainer('change',"#Login_Page");
				}
			}
		}
	};	
	req.send("action=" + action + "&parameters=" + json_param);
}

function get_jobs(override) {
	var action = 'get_jobs';
	var parameters = {'user_id' : user_id, 'override': override};
	var json_param = JSON.stringify(parameters);
	var req = new XMLHttpRequest(); 
	req.open("POST", href_url, false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded")
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200 || req.status == 0) {
				data = JSON.parse(req.responseText);
				if(data.success) {
					if(override) {
						$('#test').animate({'margin-top': -37 + 'px'}, 300);
						$('#jobs_container h3').prev('div').hide();
						$('.job_result').remove();
						$('.pullDownIcon').css('opacity', '1');
					}
					$('#jobs_container').append(data.jobs);
					if(data.incomplete) {
						$('#jobs_container h3').prev('div').show();
					}
				}
				loading('hide');
			}
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
				if(data.success) {
					details = data.details;
					for(var x in details) {
						if (details[x]['iteration'] > 0) {
							$('#' + x + " .add_container").click();
						}
					}
					
					var field_name = '';
					var form_fields = $('#profile_form').serializeArray();	
					details['self_eval_'] = JSON.parse(details['self_eval_']);
					for (field in details['self_eval_']) {
						details['self_eval_' + field] = details['self_eval_'][field];
						$('#remaining_points span').html(parseInt($('#remaining_points span').html()) + parseInt(details['self_eval_'][field]));
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
							id_value = id_value.slice(id_value.indexOf("_") + 1, id_value.lastIndexOf("_"))
							if (checkbox_array){
								checkbox_array = JSON.parse(checkbox_array);
								for (var i in checkbox_array) {
							    	$this.parent().find(':checkbox[name=' + i + ']').click();
							    }
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
				    
				    if(details['next_step_profession'] && details['next_step_category'] != 'no_experience') {
				    	get_employment_sub_categories(details['next_step_category'], 'next_step_category');
				    	$('#next_step_profession').val(details['next_step_profession']);
				    } else {
				    	document.getElementById('next_step_profession').selectedIndex = 0;
				    }
				    $('#next_step_profession').prev('span').html($('#next_step_profession>option:selected').text());
				    
			    	$(details['gallery']).prependTo('#build_profile .ui-collapsible-content').trigger('create');
				    
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