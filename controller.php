<?php
header('Content-Type: text/html; charset=utf-8');

/* Constants */
define('SECRET_PHRASE', "Don't Stop Me Now");
define('COOKIE_DOMAIN', preg_replace('/^www\./i', '', $_SERVER['HTTP_HOST']));
define('COOKIE_PATH', href('/'));

/* Get Ajax Information */
$action = $_POST['action'];
$parameters = $_POST['parameters'];
$parameters = trim($parameters);
$parameters = strip_tags($parameters);
$parameters = stripslashes($parameters);
$parameters = json_decode($parameters, true);
$data['success'] = false;

/* DataBase Connection Setup */
$db_username = 'g_wanted_tau';
$db_password = 'EGCZ9Ts7jxcawULJ';
$conn = new PDO('mysql:host=localhost;dbname=g_wanted_tau;charset=UTF-8', $db_username, $db_password);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// To Use Afterwards ====>
/* try {
	$stmt = $conn->prepare('UPDATE class SET active = :active WHERE active = 1');
	$stmt->execute(array(
		':active'   => $active,
	));
	
	echo "Success!!!"; // 1
} catch(PDOException $e) {
    echo 'ERROR: ' . $e->getMessage();
} */


/******************************************/
/************* AJAX Handlers **************/
/******************************************/
if($action) {
	header('Access-Control-Allow-Origin: *');
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
	
	if($action == 'user_login')
	{
		$email = $parameters['login_email'];
		$password = $parameters['login_password'];
		if(userLogIn($email, $password, $conn))
		{
			$data['success'] = true;
		}
	}
	
	if($action == 'get_jobs')
	{
		$user_id = '165639';
		if(1 != 1) {
			$data['jobs'] = '';
			$jobs = getJobs($conn, $user_id);
			//$data['jobs'] = $jobs;
			foreach ($jobs as $x=>$job) {
				//$data['jobs'] .= json_encode($job['title']) . '<br /><br/>';
				$data['jobs'] .= $job['post_id'] . ' - ' . json_encode($job['title']) . ' - ' . json_encode($job['match']);
			}
		} else {
			$data['jobs'] = '';
			$jobs = getCachedJobs($conn, $user_id);
			foreach ($jobs as $job) {
				$data['jobs'] .= '<div class="job_result ui-header ui-bar-inherit" style="cursor:pointer; padding:10px;">
			                    	<div style="float:left" class="match_percentage img_match_' . $job['match'] . '"></div>
			                    	<div style="margin-left:75px;">'. json_encode($job['title']) . mb_detect_encoding(json_encode($job['title'])) . '</div>
					              </div>';
				//$data['jobs'] .= $job['id'] . " - " . $job['title'] . " - " . $job['match'];
			}
		}
		$data['success'] = true;
	}
	
	echo json_encode($data, JSON_FORCE_OBJECT);
	exit;
}

/******************************************/
/*************** Functions ****************/
/******************************************/

function href($url) {
    static $base;
    
    if (!$base) {
        $base = preg_match('{/$}', dirname($_SERVER['SCRIPT_NAME'])) ? dirname($_SERVER['SCRIPT_NAME']) : dirname($_SERVER['SCRIPT_NAME']) . '/';
    }
    
    if (!preg_match('/^(http|ftp|mailto|cid|#)/i', $url)) {
        $url = $base . preg_replace('{^/}', '', $url);
    }
    
    return $url;
}

/* LOGIN Funfctions */
function userLogIn($email, $password, $conn) {
	try {
		$stmt = $conn->prepare('SELECT user_id FROM type_user WHERE email = :email AND password = :password');
		$stmt->execute(array(
			':email'    => $email,
			':password' => md5(constant('SECRET_PHRASE') . $password)
		));		
		if ($userId = $stmt->fetchColumn()) {
	        userLogIn_init($userId, $conn);        
	        return $userId;
	    } else {
	        return false;
	    }
	} catch(PDOException $e) {
	    return 'ERROR: ' . $e->getMessage();
	}    
}

function userLogIn_init($userId, $conn) {
    // Make the session recognize the user as logged-in and authenticated. Set the initial expiration time.    
	try {
		$stmt = $conn->prepare('UPDATE type_user SET auth_remote_address = :remote_address , auth_expiration_time = FROM_UNIXTIME(UNIX_TIMESTAMP() + 1200), last_login = NOW() WHERE user_id = :user_id');
		$stmt->execute(array(
			':remote_address'    => $_SERVER[REMOTE_ADDR],
			':user_id' => $userId
		));
		
		// Set the $_SESSION['user'] variable with basic user details.
		$stmt = $conn->prepare('SELECT doc_id AS id, doc_subtype AS type, user_id, email, first_name, last_name FROM sys_docs LEFT JOIN type_user ON doc_id = user_id WHERE user_id = :user_id');
		$stmt->execute(array(
			':user_id' => $userId
		));
	    $_SESSION['user'] = $stmt->fetch(PDO::FETCH_ASSOC);
	    $_SESSION['user']['authenticated'] = true;
	} catch(PDOException $e) {
	    return 'ERROR: ' . $e->getMessage();
	}    
}

// Determine whether the user is still logged-in (determined by the ip address and the expiration time).
// If the user is recognized as logged-in, extend the expiration time.
function userLogIn_update($conn) {
	if ($_SESSION['user']) {
		// Set a permanent cookie that is used to weakly authenticate the user after the session dies.
		setcookie('user', $_SESSION['user']['user_id'] . '.' . md5($_SESSION['user']['user_id'] . constant('SECRET_PHRASE') .constant('SITE_URL')), time()+31536000, constant('COOKIE_PATH'), constant('COOKIE_DOMAIN'));
			
		if ($_SESSION['user']['authenticated']) {
			$WHERE = constant('USE_IP_FOR_AUTHENTICATION') ? "auth_remote_address = '$_SERVER[REMOTE_ADDR]'" : "1";
			
			$stmt = $conn->prepare('SELECT user_id FROM type_user WHERE user_id = :user_id uth_expiration_time > NOW()');
			$stmt->execute(array(
				':user_id'    => $_SESSION['user']['user_id']
			));
			if ($stmt->fetchColumn()) {
				$stmt = $conn->prepare('UPDATE type_user SET auth_expiration_time = FROM_UNIXTIME(UNIX_TIMESTAMP() + 1200), last_login = NOW() WHERE user_id = :user_id');
				$stmt->execute(array(
					':user_id'    => $_SESSION['user']['user_id']
				));

				return true;
			} else {
		    	$_SESSION['user']['authenticated'] = false;
		        return true;
		    }
		} else {
		    mysql_query("UPDATE type_user SET last_login = NOW() WHERE user_id = '" . $_SESSION['user']['user_id'] . "'");
		        
			return true;
		}
	} elseif ($_COOKIE['user']) {
		list($userId, $hash) = @explode('.', $_COOKIE['user']);
		if ($hash == md5($userId . constant('SECRET_PHRASE') . constant('SITE_URL'))) {
			// Make the session recognize the user as logged-in but not authenticated.
			mysql_query("UPDATE type_user SET last_login = NOW() WHERE user_id = '$userId'");
		
			// Set the $_SESSION['user'] variable with basic user details.
			$stmt = $conn->prepare('SELECT doc_id AS id, doc_subtype AS type, user_id, email, first_name, last_name FROM sys_docs LEFT JOIN type_user ON doc_id = user_id WHERE user_id = :user_id');
			$stmt->execute(array(
				':user_id' => $userId
			));
		    $_SESSION['user'] = $stmt->fetch(PDO::FETCH_ASSOC);
		    $_SESSION['user']['authenticated'] = false;
			
			return true;
		}
	}
	
	unset($_SESSION['user']);
	
	return false;
}

/* Home Feed Functions */
function checkEmployerActive($user_id, $conn) {
	try {
		$stmt = $conn->prepare("SELECT
		user_id
		FROM type_user, sys_docs_params
		WHERE type_user.user_id = :user_id
		AND sys_docs_params.doc_id = type_user.user_id
		AND sys_docs_params.value_short = 'active'");
		$stmt->execute(array(
			':user_id' => $user_id
		));		
		if($stmt->fetch()) {
			return true;
		}
		return false;
	} catch(PDOException $e) {
	    return 'ERROR: ' . $e->getMessage();
	} 
}

function getCachedJobs($conn, $user_id) {
	try {
		$stmt = $conn->prepare("SELECT
		job_ids
		FROM manual_cache
		WHERE user_id = :user_id");
		$stmt->execute(array(
			':user_id' => $user_id
		));
		$job_ids = json_decode($stmt->fetchColumn(), true);
		foreach ($job_ids as $job) {
			$stmt = $conn->prepare("SELECT
			title
			FROM type_post
			WHERE post_id = :post_id");
			$stmt->execute(array(
				':post_id' => $job['id']
			));
			$job['title'] = $stmt->fetch();
		}
		return $job_ids;
	} catch(PDOException $e) {
	    return 'ERROR: ' . $e->getMessage();
	} 
}

function getJobs($conn, $user_id) {
	$user_info = getDocParameters($user_id);
	try {
		$stmt = $conn->prepare("SELECT
		post_id, title, user_id
		FROM type_post, sys_docs_params
		WHERE type_post.authorized = 1
		AND sys_docs_params.doc_id = type_post.post_id
		AND sys_docs_params.param_data_name = 'job_not_taken'
		AND sys_docs_params.value_short = 1");
		$stmt->execute();		
		$job_ids = Array();
		foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $job){
		    list($job['parameters']) = getDocParametersWithStructure('post', $job['post_id']);
			//return $job[$i]['parameters'];			
			if(checkEmployerActive($job['user_id'], $conn)) {				
		    	$job['match'] = calculate_match_percentage($job['parameters'], $user_info);
				$job['parameters'] = null;		
				$sorted_results[] = $job;
				$job_ids[] = array("id" => $job['post_id'], "title" => $job['title'], "match" => $job['match']);
			}			
		}
		
		// Sorting the results according to the match percentage
	    function sort_condition($a, $b) {
	        if ($a['match'] == $b['match']) {
	            return 0;
	        }
	        return ($a['match'] < $b['match']) ? 1 : -1;
	    }
	    if ($user_id && !empty($sorted_results)) {
	        usort($sorted_results, 'sort_condition');
	        usort($job_ids, 'sort_condition');
		}
		
		$job_ids = json_encode($job_ids);
		$stmt = $conn->prepare("UPDATE
		manual_cache
		SET
		timestamp = NOW(),
		job_ids = :job_ids
		WHERE user_id = :user_id");
		$stmt->execute(array(
			':job_ids' => $job_ids,
			':user_id' => $user_id
		));
		if (!$stmt->rowCount()) {
			$stmt = $conn->prepare("INSERT INTO
			manual_cache
			(user_id, timestamp, job_ids)
			VALUE(:user_id, NOW(), :job_ids)");
			$stmt->execute(array(
				':job_ids' => $job_ids,
				':user_id' => $user_id
			));
		}

		return $sorted_results;
	} catch(PDOException $e) {
	    return 'ERROR: ' . $e->getMessage();
	} 
}

function calculate_match_percentage($post_parameters, $user_parameters) {
	$match['total'] = 0;	
	if ($post_parameters && $user_parameters) {
		
		// Experince
		$score = 0;
		$num_of_variables = 0;
		if ($post_parameters['general']['experience']['value']) {
			$experience = explode('-',$post_parameters['general']['experience']['value']);
			$num_of_variables++;
			if ($user_parameters['general']['experience'] >= $experience[0] && $user_parameters['general']['experience'] <= $experience[1]) {
				$score++;
			}
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.05;
		}
		
		// Education - Degree
		$degree_array = array();
		foreach($post_parameters['education'] as $post_education_param) {
			$degree_array[] = $post_education_param['degree']['value'];
		}
		
		$score = 0;
		$num_of_variables = 0;
		if (!empty($degree_array)) {
			$num_of_variables++;
			if (!empty($user_parameters['education'])) {
				foreach ($user_parameters['education'] as $education_param) {
					if (in_array($education_param['degree'], $degree_array)) {
						$score++;
						break;
					}
				}
			}
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.1;
		}

		// Education - Faculty
		$faculty_array = array();
		foreach($post_parameters['education'] as $post_education_param) {
			$faculty_array[] = $post_education_param['faculty']['value'];
		}
		
		$score = 0;
		$num_of_variables = 0;
		if (!empty($faculty_array)) {
			$num_of_variables++;
			if (!empty($user_parameters['education'])) {
				foreach ($user_parameters['education'] as $education_param) {
					$user_education_array = (array)json_decode($education_param['faculty'], TRUE);
					foreach ($faculty_array as $value) {
						if (array_key_exists($value, $user_education_array)) {
							$score++;
							break 2;
						}
					}
				}
			}
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.05;
		}
		
		// Education - Classes		
		$class_array = array();
		foreach($post_parameters['education'] as $post_education_param) {
			$class_array[] = $post_education_param['class']['value'];
		}
		
		$score = 0;
		$num_of_variables = 0;
		if (!empty($class_array)) {
			$num_of_variables++;
			if (!empty($user_parameters['education'])) {
				foreach ($user_parameters['education'] as $education_param) {
					// see that we decode faculty from user again - this is because classes are stored in a json in faculty param
					$user_education_array = (array)json_decode($education_param['faculty'], TRUE);
					foreach($user_education_array as $classes) {
						foreach ($class_array as $value) {
							if (array_key_exists($value, $classes)) {
								$score++;
								break 3;
							}
						}
					}
				}
			}
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.45;
		}
		
		// Next Step - Category
		$score = 0;
		$num_of_variables = 0;
		if ($post_parameters['employment']['category']['value']) {
			$num_of_variables++;
			if ($post_parameters['employment']['category']['value'] == $user_parameters['next_step']['category']) {
				$score++;
			}
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.05;
		}
		
		// Category
		$score = 0;
		$num_of_variables = 0;
		if ($post_parameters['employment']['category']['value']) {
			$num_of_variables++;
			if (!empty($user_parameters['employment'])) {
				foreach ($user_parameters['employment'] as $employment_param) {
					if ($employment_param['category'] == $post_parameters['employment']['category']['value']) {
						$score++;
						break;
					}
				}
			}
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.05;
		}
		
		// Next Step - Profession		
		$score = 0;
		$num_of_variables = 0;
		if ($post_parameters['employment']['profession']['value']) {
			$num_of_variables++;
			if ($post_parameters['employment']['profession']['value'] == $user_parameters['next_step']['profession']) {
				$score++;
			}
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.05;
		}
		
		// Profession
		$score = 0;
		$num_of_variables = 0;
		if ($post_parameters['employment']['profession']['value']) {
			$num_of_variables++;
			if (!empty($user_parameters['employment'])) {
				foreach ($user_parameters['employment'] as $employment_param) {
					$profession_arr = (array)json_decode($employment_param['profession']);
					if (in_array($post_parameters['employment']['profession']['value'], $profession_arr)) {
						$score++;
						break;
					}
				}
			}
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.05;
		}
				
		// Location
		$score = 0;
		$num_of_variables = 0;
		if ($post_parameters['next_step']['location']['value']) {
			if ($post_parameters['next_step']['location']['value'] == $user_parameters['next_step']['location']) {
				$score++;
			}
			$num_of_variables++;
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.05;
		}
		
		// Languages
		$score = 0;
		$num_of_variables = 0;
		if ($post_parameters['languages']['language']['value']) {
			$num_of_variables++;
			if (!empty($user_parameters['languages'])) {
				foreach ($user_parameters['languages'] as $languages_param) {
					if ($languages_param['language'] == $post_parameters['languages']['language']['value']) {
						$score++;
						break;
					}
				}
			}
		}
		if ($num_of_variables > 0) {
			$match['total'] = $match['total'] + ($score/$num_of_variables)*0.1;
		}
		
		if ($match['total'] > 0) {
		    return round($match['total']*100);
		    } else {
		        return 0;
		    }		
	}
}

//////////////////////////////////////////////////////

function href_HTMLArea($string) {
    $string = preg_replace_callback(
        '{(href|src|name="movie" value)="([^"]+)"}S',
        function ($matches) {
            return $matches[1] . "='" . href($matches[2]) . "'";
        },
        $string
    );
    $string = preg_replace_callback(
        '/background\-image: url\(([^)]+)\)/S',
        function ($matches) {
            return "background-image: url('" . href($matches[1]) . "')";
        },
        $string
    );
    return $string;
}

function getDocParameters($docId) {
	$db_username = 'g_wanted_tau';
	$db_password = 'EGCZ9Ts7jxcawULJ';
	$conn = new PDO('mysql:host=localhost;dbname=g_wanted_tau;charset=UTF-8', $db_username, $db_password);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
    $parameters = false;
	$stmt = $conn->prepare("SELECT type AS param_type, param_name, iteration, param_data_name, IFNULL(value_short, value_long) AS value FROM sys_docs_params LEFT JOIN sys_docs USING (doc_id) LEFT JOIN sys_docs_types_params_data USING (doc_type, param_name, param_data_name) WHERE doc_id = :doc_id ORDER BY iteration ASC");
	$stmt->execute(array(
		':doc_id'    => $docId
	));	
    foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $sql){
        if ($sql['param_type'] == 'htmlarea') {
            $sql['value'] = href_HTMLArea($sql['value']);
        }
        if ($sql['iteration'] == '' && $sql['param_data_name'] == '') {
            $parameters[$sql['param_name']] = $sql['value'];
        } elseif ($sql['iteration'] == '') {
            $parameters[$sql['param_name']][$sql['param_data_name']] = $sql['value'];
        } elseif ($sql['param_data_name'] == '') {
            $parameters[$sql['param_name']][$sql['iteration']] = $sql['value'];
        } else {
            $parameters[$sql['param_name']][$sql['iteration']][$sql['param_data_name']] = $sql['value'];
        }
    }
    
    return $parameters;
}

// Get all parameters the doc-type has defined (not structured according to the section association).
function getDocTypeParameters($docType) {
			$db_username = 'g_wanted_tau';
$db_password = 'EGCZ9Ts7jxcawULJ';
$conn = new PDO('mysql:host=localhost;dbname=g_wanted_tau;charset=UTF-8', $db_username, $db_password);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		
	
    $parameters = false;
    
    // Get all parameters.
    $stmt = $conn->prepare("SELECT param_name, section_id, is_iteratable FROM sys_docs_types_params WHERE doc_type = :docType ORDER BY idx ASC");
	$stmt->execute(array(
		':docType'    => $docType
	));	
    foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $sql){
        // Get all parameter subtypes associations.
        $sub_stmt = $conn->prepare("SELECT doc_subtype FROM sys_docs_types_params__subtypes WHERE doc_type = :docType AND param_name = :param_name");
		$sub_stmt->execute(array(
			':docType'    => $docType,
			':param_name'    => $sql['param_name']
		));	
		foreach($sub_stmt->fetchAll(PDO::FETCH_ASSOC) as $sub_sql){
            $sql['subtypes'][] = $sub_sql['doc_subtype'];
        }
        
        // Get all parameter data.
        $sub_stmt = $conn->prepare("SELECT param_data_name, caption, annotation, type, type__text__maxlength FROM sys_docs_types_params_data WHERE doc_type = :docType AND param_name = :param_name ORDER BY idx ASC");
		$sub_stmt->execute(array(
			':docType'    => $docType,
			':param_name'    => $sql['param_name']
		));	
		foreach($sub_stmt->fetchAll(PDO::FETCH_ASSOC) as $sub_sql){
            // For multiple-data get all the options.
            if ($sub_sql['type'] == 'select' || $sub_sql['type'] == 'radio') {
            	$sub_sub_stmt = $conn->prepare("SELECT param_data_option_value AS value, text, is_selected FROM sys_docs_types_params_data_options WHERE doc_type = :docType AND param_name = :param_name AND param_data_name = :param_data_name ORDER BY idx ASC");
				$sub_sub_stmt->execute(array(
					':docType'    => $docType,
					':param_name'    => $sql['param_name'],
					':param_data_name' => $sub_sql['param_data_name']
				));	
				foreach($sub_sub_stmt->fetchAll(PDO::FETCH_ASSOC) as $sub_sub_sql){
                    $sub_sql['options'][] = $sub_sub_sql;
                }
            }
            
            $sql['data'][] = $sub_sql;
        }
        
        $parameters[] = $sql;
    }
    
    return $parameters;
}

// Takes the parameter's data-names structure and merges them with the values (if exist)
function getDocParametersWithStructure($doc_type, $doc_id = false) {
        
    if ($doc_id) { $parameters = getDocParameters($doc_id); }
    if ($doc_type) { $structure = getDocTypeParameters($doc_type); }
    
    for ($i = 0; $i != count($structure); $i++) {    	
        for ($j = 0; $j != count($structure[$i]['data']); $j++) {
            
            if ($structure[$i]['is_iteratable'] == 1) {
                
                if (empty($parameters[$structure[$i]['param_name']])) {
                    // No values exist, only structure
					
                    $k = 0;
                    
                    if ($structure[$i]['data'][$j]['param_data_name']) {
                        
                        $tmp['value'] = $parameters[$structure[$i]['param_name']][$k][$structure[$i]['data'][$j]['param_data_name']];
                        $tmp['caption'] = $structure[$i]['data'][$j]['caption'];
                        $tmp['type'] = $structure[$i]['data'][$j]['type'];
                        $tmp['maxlength'] = $structure[$i]['data'][$j]['type__text__maxlength'];
                        $tmp['options'] = $structure[$i]['data'][$j]['options'];
                        
                        $parameters_with_structure[$structure[$i]['param_name']][$k][$structure[$i]['data'][$j]['param_data_name']] = $tmp;
                        // Input Parameters are the "input format" of the parameters - param__...
                        $input_parameters['param__'.$structure[$i]['param_name'].'__'.$k.'__'.$structure[$i]['data'][$j]['param_data_name']] = $parameters_with_structure[$structure[$i]['param_name']][$k][$structure[$i]['data'][$j]['param_data_name']]['value'] == '+' ? '' : $parameters_with_structure[$structure[$i]['param_name']][$k][$structure[$i]['data'][$j]['param_data_name']]['value'];
                    
                    } else {
                        
                        $tmp['value'] = $parameters[$structure[$i]['param_name']][$k];
                        $tmp['caption'] = $structure[$i]['data'][$j]['caption'];
                        $tmp['type'] = $structure[$i]['data'][$j]['type'];
                        $tmp['maxlength'] = $structure[$i]['data'][$j]['type__text__maxlength'];
                        $tmp['options'] = $structure[$i]['data'][$j]['options'];
                        
                        $parameters_with_structure[$structure[$i]['param_name']][$k] = $tmp;
                        // Input Parameters are the "input format" of the parameters - param__...
                        $input_parameters['param__'.$structure[$i]['param_name'].'__'.$k] = $parameters_with_structure[$structure[$i]['param_name']]['value'] == '+' ? '' : $parameters_with_structure[$structure[$i]['param_name']]['value'];
                    
                    }
                    
                } else {
                    
                    for ($k = 0; $k != count($parameters[$structure[$i]['param_name']]); $k++) {
                        
                        if ($structure[$i]['data'][$j]['param_data_name']) {
                            // Data-names exist
							
                            $tmp['value'] = $parameters[$structure[$i]['param_name']][$k][$structure[$i]['data'][$j]['param_data_name']];
                            $tmp['caption'] = $structure[$i]['data'][$j]['caption'];
                            $tmp['type'] = $structure[$i]['data'][$j]['type'];
                            $tmp['maxlength'] = $structure[$i]['data'][$j]['type__text__maxlength'];
                            $tmp['options'] = $structure[$i]['data'][$j]['options'];
                            
                            $parameters_with_structure[$structure[$i]['param_name']][$k][$structure[$i]['data'][$j]['param_data_name']] = $tmp;
                            // Input Parameters are the "input format" of the parameters - param__...
                            $input_parameters['param__'.$structure[$i]['param_name'].'__'.$k.'__'.$structure[$i]['data'][$j]['param_data_name']] = $parameters_with_structure[$structure[$i]['param_name']][$k][$structure[$i]['data'][$j]['param_data_name']]['value'] == '+' ? '' : $parameters_with_structure[$structure[$i]['param_name']][$k][$structure[$i]['data'][$j]['param_data_name']]['value'];
                        
                        } else {
                            
                            $tmp['value'] = $parameters[$structure[$i]['param_name']][$k];
                            $tmp['caption'] = $structure[$i]['data'][$j]['caption'];
                            $tmp['type'] = $structure[$i]['data'][$j]['type'];
                            $tmp['maxlength'] = $structure[$i]['data'][$j]['type__text__maxlength'];
                            $tmp['options'] = $structure[$i]['data'][$j]['options'];
                            
                            $parameters_with_structure[$structure[$i]['param_name']][$k] = $tmp;
                            // Input Parameters are the "input format" of the parameters - param__...
                            $input_parameters['param__'.$structure[$i]['param_name'].'__'.$k] = $parameters_with_structure[$structure[$i]['param_name']][$k]['value'] == '+' ? '' : $parameters_with_structure[$structure[$i]['param_name']][$k]['value'];
                        
                        }
                        
                    }
                    
                }
                
            } else {
                
                if ($structure[$i]['data'][$j]['param_data_name']) {
                    
					$tmp['value'] = $parameters[$structure[$i]['param_name']][$structure[$i]['data'][$j]['param_data_name']];
                    $tmp['caption'] = $structure[$i]['data'][$j]['caption'];
                    $tmp['type'] = $structure[$i]['data'][$j]['type'];
                    $tmp['maxlength'] = $structure[$i]['data'][$j]['type__text__maxlength'];
                    $tmp['options'] = $structure[$i]['data'][$j]['options'];
                    
                    $parameters_with_structure[ $structure[$i]['param_name'] ][ $structure[$i]['data'][$j]['param_data_name'] ] = $tmp;
                    
                    // Input Parameters are the "input format" of the parameters - param__...
                    $input_parameters['param__'.$structure[$i]['param_name'].'__'.$structure[$i]['data'][$j]['param_data_name']] = $parameters_with_structure[$structure[$i]['param_name']][$structure[$i]['data'][$j]['param_data_name']]['value'] == '+' ? '' : $parameters_with_structure[$structure[$i]['param_name']][$structure[$i]['data'][$j]['param_data_name']]['value'];
                
                } else {
                    
                    $tmp['value'] = $parameters[$structure[$i]['param_name']];
                    $tmp['caption'] = $structure[$i]['data'][$j]['caption'];
                    $tmp['type'] = $structure[$i]['data'][$j]['type'];
                    $tmp['maxlength'] = $structure[$i]['data'][$j]['type__text__maxlength'];
                    $tmp['options'] = $structure[$i]['data'][$j]['options'];
                    
                    $parameters_with_structure[$structure[$i]['param_name']] = $tmp;
                    // Input Parameters are the "input format" of the parameters - param__...
                    $input_parameters['param__'.$structure[$i]['param_name']] = $parameters_with_structure[$structure[$i]['param_name']]['value'] == '+' ? '' : $parameters_with_structure[$structure[$i]['param_name']]['value'];
                
                }
                
                
            }
        
        }
    }
    
    return array($parameters_with_structure, $input_parameters);
    
}

/*
function getUser($userId) {

	$db_username = 'g_wanted_tau';
	$db_password = 'EGCZ9Ts7jxcawULJ';
	$conn = new PDO('mysql:host=localhost;dbname=g_wanted_tau;charset=UTF-8', $db_username, $db_password);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$stmt = $conn->prepare("
	    SELECT
	        sd.doc_id, sd.doc_name, sd.doc_subtype,
	        t.email, t.first_name, t.last_name, t.company, t.job_title, t.street_1, t.street_2, t.city, t.state, t.zipcode, t.country, t.phone_1, t.phone_2, t.mobile, t.date_of_birth, t.seo_title, t.seo_description, t.seo_keywords, t.credits, t.registration, t.last_login, t.send_notifications
	    FROM sys_docs sd JOIN type_user t ON doc_id = user_id
	    WHERE
	        user_id = :user_id
	        AND sd.doc_active = '1'
	");
	$stmt->execute(array(
		':user_id'    => $userId
	));	
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	if ($user) {
        $user['doc'] = $user['doc_name'] ? $user['doc_name'] : $user['doc_id'];
        $post['type'] = $post['doc_subtype'];
        
        $user['id'] = $user['doc_id'];
	}
    
    return $user;
}

function getPost($postId) {
	$db_username = 'g_wanted_tau';
	$db_password = 'EGCZ9Ts7jxcawULJ';
	$conn = new PDO('mysql:host=localhost;dbname=g_wanted_tau;charset=UTF-8', $db_username, $db_password);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$stmt = $conn->prepare("
	    SELECT
            sd.doc_id, sd.doc_subtype, sd.doc_name,
            t.user_id, t.title, t.description_short, t.description, t.authorized, t.created, t.modified
        FROM sys_docs sd JOIN type_post t ON doc_id = post_id
        WHERE
            post_id = :postId
            AND sd.doc_active = '1'
	");
	$stmt->execute(array(
		':postId'    => $postId
	));	
	$post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($post) {
        $post['doc'] = $post['doc_name'] ? $post['doc_name'] : $post['doc_id'];
        $post['type'] = $post['doc_subtype'];
        
        $post['id'] = $post['doc_id'];
        $post['description'] = href_HTMLArea($post['description']);
    }
    
    return $post;
}
*/

?>