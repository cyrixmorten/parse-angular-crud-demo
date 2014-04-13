'use strict';

/* Controllers */

var controllerModule = angular.module('GuardSwiftApp.controllers', [
		'GuardSwiftApp.services', 'ui.bootstrap', 'pascalprecht.translate' ]);

controllerModule.config(['$translateProvider' , function($translateProvider) {
	$translateProvider.translations('en', {
		// ACCOUNT
		"TITLE_LOGIN" : 'Login to GuardSwift',
		"USERNAME" : 'Username',
		"PASSWORD" : 'Password',
		"LOGIN" : 'Login',
		"LOGOUT" : 'Logout',
		// CRUD
		"CREATE" : 'Create',
		"SAVE" : 'Save',
		"EDIT" : 'Edit',
		"REMOVE" : 'Remove',
		"CANCEL" : 'Cancel',
		// COMMON
		"NAME" : 'Name',
		"NUMBER" : 'Number',
		"ADDRESS" : 'Address',
		"STREETNUMBER" : 'Streetnumber',
		"CITY" : 'City',
		"ZIPCODE" : 'Zipcode',
		"EMAIL" : 'Email',
		"TIMESTART" : 'Starting time',
		"TIMEEND" : 'Ending time',
		"START" : 'Start',
		"END" : 'End',
		"CLIENT" : 'Client',
		// PAGE SPECIFIC
		"HOME_WELCOME_MESSAGE" : 'Welcome to GuardSwift',
		"GUARDS" : 'Guards',
		"GUARDS_CREATE" : 'Create guard',
		"GUARDS_LIST" : 'Guards in database',
		"GUARD_ID" : 'Guard id',
		"CLIENTS" : 'Clients',
		"CLIENTS_CREATE" : 'Create client',
		"CLIENTS_LIST" : 'Clients in database',
		"CLIENTS_SELECT" : 'Select client',
		"CIRCUITS" : 'Circuits',
		"CIRCUITS_CREATE" : 'Create circuit',
		"CIRCUITS_LIST" : 'Circuits in database',
		"CIRCUITS_SELECT" : 'Select circuit',
		"CIRCUITUNITS" : 'CircuitUnits',
		"CIRCUITUNITS_NONE_SELECTED" : 'No circuit selected',
		"CIRCUITUNITS_CREATE" : 'Create circuitunit under: ',
		"CIRCUITUNITS_LIST" : 'Circuitunits in database',
		
	});
	$translateProvider.translations('da', {
		// ACCOUNT
		"TITLE_LOGIN" : 'Log på GuardSwift',
		"USERNAME" : 'Brugernavn',
		"PASSWORD" : 'Kodeord',
		"LOGIN" : 'Log ind',
		"LOGOUT" : 'Log ud',
		// CRUD
		"CREATE" : 'Opret',
		"SAVE" : 'Gem',
		"EDIT" : 'Rediger',
		"REMOVE" : 'Slet',
		"CANCEL" : 'Annuller',
		// COMMON
		"NAME" : 'Navn',
		"NUMBER" : 'Nummer',
		"ADDRESS" : 'Adresse',
		"STREETNUMBER" : 'Husnummer',
		"CITY" : 'By',
		"ZIPCODE" : 'Postnummer',
		"EMAIL" : 'Email',
		"TIMESTART" : 'Start tidspunkt',
		"TIMEEND" : 'Slut tidspunkt',
		"START" : 'Start',
		"END" : 'Slut',
		"CLIENT" : 'Kunde',
		// PAGE SPECIFIC
		"HOME_WELCOME_MESSAGE" : 'Velkommen til GuardSwift',
		"GUARDS" : 'Vagter',
		"GUARDS_CREATE" : 'Opret vagt',
		"GUARDS_LIST" : 'Vagter',
		"GUARD_ID" : 'Vagt id',
		"CLIENTS" : 'Kunder',
		"CLIENTS_CREATE" : 'Opret kunde',
		"CLIENTS_LIST" : 'Kunder',
		"CLIENTS_SELECT" : 'Vælg kunde',
		"CIRCUITS" : 'Kreds',
		"CIRCUITS_CREATE" : 'Opret kreds',
		"CIRCUITS_LIST" : 'Kreds oversigt',
		"CIRCUITS_SELECT" : 'Vælg kreds',
		"CIRCUITUNITS" : 'Tilsyn',
		"CIRCUITUNITS_NONE_SELECTED" : 'Der er ikke valgt nogen kreds',
		"CIRCUITUNITS_CREATE" : 'Opret tilsyn under kreds: ',
		"CIRCUITUNITS_LIST" : 'Tilsyn',
	});
	$translateProvider.preferredLanguage('en');
}]);

controllerModule.controller('LoginCtrl', [
		'$scope',
		'$location',
		'$route',
		'$timeout',
		'ParseService',
		function($scope, $location, $route, $timeout, ParseService) {

			var Account = ParseService.Account;

			$scope.user = {
				'username' : (Account.isLoggedIn()) ? Account.getCurrentUser()
						.get('username') : '',
				'password' : (Account.isLoggedIn()) ? Account.getCurrentUser()
						.get('password') : ''
			};

			$scope.login = function(user) {
				console.log(user.username);
				console.log(user.password);
				Account.login(user.username, user.password, {
					success : function(user) {
						console.info('redirect /home');
						$location.path("/home");
						$route.reload();
					},
					error : function(user, error) {
						alert(error.message);
					}
				});

			}

		} ]);

controllerModule.controller('LogoutCtrl', [ '$route', '$location', '$timeout',
		'ParseService', function($route, $location, $timeout, ParseService) {

			$timeout(function() {
				$location.path("/login");
				$route.reload();
			})

		} ]);

controllerModule.controller('HomeCtrl', [ '$scope', 'ParseService',
		function($scope, ParseService) {
			$scope.parse = ParseService;
		} ]);

// Parent scope for CRUD pages
controllerModule
		.controller(
				'CRUDCtrl',
				[
						'$rootScope',
						'$scope',
						'$modal',
						'ParseService',
						'StandardNgTable',
						function($rootScope, $scope, $modal, ParseService,
								StandardNgTable) {

							$scope.ParseCrud = {};

							$scope.crudObjects = [];

							$scope.createData = {};
							$scope.editData = {};

							$scope.performingEdit = false;

							$scope.fetchingCrud = true;
							$scope.loadData = function(query) {

								$scope.fetchingCrud = true;

								$scope.createData = $scope.ParseCrud
										.getTemplate();

								$scope.ParseCrud
										.fetchAll(query)
										.then(
												function(result) {

													// console.log(result[0]);

													$scope.crudObjects = $scope.ParseCrud
															.getScopeFriendlyObjects(result);

													$scope.tableParams = StandardNgTable
															.getTable($scope.crudObjects);

													$scope.fetchingCrud = false;
													// console
													// .log('Done loading '
													// +
													// $scope.crudObjects.length
													// + ' objects');

												});
							};

							$scope.add = function() {

								// define a promise to handle when added
								var promise = new Parse.Promise();
								promise.then(function(result) {
									var scopedParseObject = $scope.ParseCrud
											.getScopeFriendlyObject(result);

									$scope.crudObjects.push(scopedParseObject);

									$scope.createData = $scope.ParseCrud
											.getTemplate();
								}, function(error) {
									console.log(error);
								});

								$scope.ParseCrud
										.add($scope.createData, promise);
							};

							$scope.edit = function() {
								$scope.performingEdit = true;
							};

							$scope.cancel = function() {
								$scope.performingEdit = false;
							};

							$scope.save = function(scopedParseObject) {

								var index = $scope.crudObjects
										.indexOf(scopedParseObject);

								$scope.ParseCrud
										.update(scopedParseObject)
										.then(
												function(result) {
													// update the scoped
													// object
													$scope.crudObjects[index] = $scope.ParseCrud
															.getScopeFriendlyObject(result);
													console
															.log($scope.crudObjects[index]);

												}, function(error) {
													// TODO reset the scoped
													// object
													console.log(error.code);
													console.log(error);
												});
								$scope.performingEdit = false;
							};

							$scope.remove = function(scopedParseObject) {

								var modalInstance = $modal
										.open({
											templateUrl : 'views/dialog.delete.html',
											controller : ModalSimpleOkCancelInstanceCtrl,

											resolve : {
												name : function() {
													return scopedParseObject.name
															|| scopedParseObject.parseobject.id;
												}
											}

										});

								modalInstance.result
										.then(function() {

											$scope.ParseCrud
													.remove(scopedParseObject)
													.then(
															function(result) {
																var index = $scope.crudObjects
																		.indexOf(scopedParseObject);
																$scope.crudObjects
																		.splice(
																				index,
																				1);
															},
															function(error) {
																console
																		.log(e.message);
																// TODO show
																// information
																// about
																// the
																// error
															});
										});
							};

						} ]).directive('crudEditDelete', function() {
			return {
				restrict : 'E',
				transclude : true,
				templateUrl : 'views/crud.edit.delete.html'
			};
		}).directive('sgLoading', function() {
			return {
				restrict : 'E',
				templateUrl : 'views/loading.html'
			};
		});
;

controllerModule.controller('GuardCtrl', [ '$scope', 'ParseObjects',
		function($scope, ParseObjects) {

			var ParseObject = ParseObjects.ParseGuardObject;

			ParseObject.setHiddenData({
				ACL : new Parse.ACL(Parse.User.current()),
				owner : Parse.User.current()
			});

			$scope.$parent.ParseCrud = ParseObject;
			$scope.$parent.loadData();

		} ]);

controllerModule.controller('ClientCtrl', [ '$scope', 'ParseObjects',
		function($scope, ParseObjects) {

			var ParseObject = ParseObjects.ParseClientObject;

			ParseObject.setHiddenData({
				ACL : new Parse.ACL(Parse.User.current()),
				owner : Parse.User.current()
			});

			$scope.$parent.ParseCrud = ParseObject;
			$scope.$parent.loadData();

		} ]);

controllerModule.controller('CircuitCtrl', [ '$scope', 'ParseObjects',
		function($scope, ParseObjects) {

			var ParseObject = ParseObjects.ParseCircuitObject;

			ParseObject.setHiddenData({
				ACL : new Parse.ACL(Parse.User.current()),
				owner : Parse.User.current()
			});

			$scope.$parent.ParseCrud = ParseObject;
			$scope.$parent.loadData();

		} ]);
controllerModule.controller('CircuitunitCtrl', [
		'$scope',
		'$routeSegment',
		'ParseObjects',
		function($scope, $routeSegment, ParseObjects) {

			$scope.$routeSegment = $routeSegment;

			$scope.fetchingCircuits = true;

			// fetch circuits to populate dropdown
			$scope.parseCircuitObject = ParseObjects.ParseCircuitObject;
			$scope.parseCircuitObject.fetchAll().then(
					function(result) {

						$scope.circuits = $scope.parseCircuitObject
								.getScopeFriendlyObjects(result);

						$scope.fetchingCircuits = false;

					});

			// fetch clients to populate dropdown in CircuitunitSelectedCtrl
			// they are loaded here so that they are not reloaded for every
			// change in Circuit selection
			var parseClientObject = ParseObjects.ParseClientObject;
			parseClientObject.fetchAll().then(function(result) {
				$scope.clients = result;
			});

		} ]);

controllerModule
		.controller(
				'CircuitunitSelectedCtrl',
				[
						'$scope',
						'$routeSegment',
						'ParseObjects',
						function($scope, $routeSegment, ParseObjects) {

							$scope.selectedCircuit = '';
							$scope.$routeSegment = $routeSegment;

							// this will be called if:
							// 1) reloading page
							// 2) selecting a dropdown value
							$scope.$parent
									.$watch(
											'fetchingCircuits',
											function() {
												var loadingCircuits = $scope.$parent.fetchingCircuits;
												if (!loadingCircuits) {
													// done loading circuits
													setSelectedCircuit($routeSegment.$routeParams.id);
												}
											});

							function setSelectedCircuit(routeId) {
								angular
										.forEach(
												$scope.$parent.circuits,
												function(parentScopedCircuit) {
													if (angular
															.equals(
																	parentScopedCircuit.objectId,
																	routeId)) {
														// store scoped circuit
														// to add name badge
														$scope.scopedParentCircuit = parentScopedCircuit;

														var ParseObject = ParseObjects.ParseCircuitunitObject;

														var selectedCircuitParseObject = $scope.parseCircuitObject
																.findParseObject(parentScopedCircuit);

														ParseObject
																.setHiddenData({
																	circuit : selectedCircuitParseObject,
																	ACL : new Parse.ACL(
																			Parse.User
																					.current()),
																	owner : Parse.User
																			.current()
																});

														// define a new query
														var query = ParseObject
																.fetchAllQuery();
														query
																.equalTo(
																		'circuit',
																		selectedCircuitParseObject);
														// populates the client
														// object
														query.include('client');

														$scope.$parent.$parent.ParseCrud = ParseObject;

														// load data using the
														// new query
														$scope.$parent.$parent
																.loadData(query);
													}
												});
							}

						} ]);

controllerModule.controller('MainCtrl', [
		'$scope',
		'$location',
		'$timeout',
		'$routeSegment',
		'ParseService',
		function($scope, $location, $timeout, $routeSegment, ParseService) {

			angular.isUndefinedOrNull = function(val) {
				return angular.isUndefined(val) || val === null;
			};

			$scope.ParseAccount = ParseService.Account;
			$scope.$routeSegment = $routeSegment;

			$scope.go = function(path) {
				$location.path(path);
			};

			$scope.logout = function() {
				ParseService.Account.logout();
				$scope.go('login');
			};

			// auto direct based on login status
			$scope.$on('routeSegmentChange', function() {
				if (!angular.isUndefinedOrNull($scope.$routeSegment)
						&& !angular
								.isUndefinedOrNull($scope.$routeSegment.name)) {
					if (!$scope.$routeSegment.contains('login')
							&& !$scope.ParseAccount.isLoggedIn()) {
						$scope.go('login');
					}
					if ($scope.$routeSegment.contains('login')
							&& $scope.ParseAccount.isLoggedIn()) {
						$scope.go('home');
					}
				}
			});

		} ]);

var ModalSimpleOkCancelInstanceCtrl = function($scope, $modalInstance, name) {

	$scope.name = name;

	$scope.ok = function() {
		$modalInstance.close(true);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
};