"use strict";

 angular.module('myApp.config', [])

.constant('ENV', 
		{
			name:'development',
			apiEndpoint:'http://localhost:9988/segnalazioni',
			//apiEndpoint:'https://pmlab.comune.rimini.it/SostaSelvaggia',
			apiLogin:'/authenticateMONGO',
			apiLogout:'/logout',
			routeAfterLogon:'menu.home',
			mapsdemo:false,
			loginUserName:'',
			loginUserPassword:'',
			AUTH_EVENTS:{
					loginSuccess:'auth-login-success',
					loginFailed:'auth-login-failed',
					logoutSuccess:'auth-logout-success',
					sessionTimeout:'auth-session-timeout',
					notAuthenticated:'auth-not-authenticated',
					notAuthorized:'auth-not-authorized',
					serverError:'server-error'
				},
			USER_ROLES:{
					all:'*',
					admin:'admin',
					editor:'editor',
					guest:'guest'
				}
			})

;