'use strict';

/* Controllers */

var controllerModule = angular.module('GuardSwiftApp.controllers', [
		'GuardSwiftApp.services', 'ui.bootstrap' ])
;

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

			ParseService.Account.logout();

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
							console.log('CRUDCtrl');
							$scope.ParseCrud = {};

							$scope.editData = {};
							$scope.performingEdit = false;

							$scope
									.$watch(
											'ParseCrud',
											function(newValue) {

												if ($scope.ParseCrud instanceof ParseService.StandardParseObject) {
													console
															.log('ParseCrud changed is StandardParseObject');
													console
															.log($scope.ParseCrud);

													// fill the createData
													// object with an empty
													// template
													$scope.createData = $scope.ParseCrud
															.getTemplate();

													$scope.ParseCrud
															.fetchAll(function(
																	result) {

																$scope.crudObjects = $scope.ParseCrud
																		.getScopeFriendlyObjects(result);

																$scope.tableParams = StandardNgTable
																		.getTable($scope.crudObjects);

															});
												} else {
													console
															.log('ParseCrud changed not StandardParseObject');
													console
															.log($scope.ParseCrud);
												}

											});

							$scope.add = function() {
								$scope.ParseCrud
										.add(
												$scope.createData,
												{
													success : function(result) {
														var scopedGuard = $scope.ParseCrud
																.getScopeFriendlyObject(result);

														$scope.crudObjects
																.push(scopedGuard);

														$scope.createData = $scope.ParseCrud
																.getTemplate();
													},
													error : function(result,
															error) {
														console.log(error.code);
														console.log(error);
													}
												});
							}

							$scope.edit = function(scopedParseGuard) {
								$scope.performingEdit = true;
							}

							$scope.save = function(scopedParseGuard) {

								var index = $scope.crudObjects
										.indexOf(scopedParseGuard);

								$scope.ParseCrud
										.save(
												scopedParseGuard,
												{
													success : function(result) {
														// update the scoped
														// object
														$scope.crudObjects[index] = $scope.ParseCrud
																.getScopeFriendlyObject(result);
														console
																.log($scope.crudObjects[index]);
													},
													error : function(result,
															error) {
														// reset the scoped
														// object
														$scope.crudObjects[index] = $scope.ParseCrud
																.getScopeFriendlyObject(result);
														console.log(error.code);
														console.log(error);
													}
												});
								$scope.performingEdit = false;
							}

							$scope.remove = function(scopedParseGuard) {

								var parseobject = scopedParseGuard.parseobject;

								var modalInstance = $modal
										.open({
											templateUrl : 'views/dialog.delete.html',
											controller : ModalSimpleOkCancelInstanceCtrl,

											resolve : {
												name : function() {
													return scopedParseGuard.name;
												}
											}

										});

								modalInstance.result.then(function() {
									var index = $scope.crudObjects
											.indexOf(scopedParseGuard)
									 $scope.crudObjects.splice(index,
											1);
									parseobject.destroy({
										success : function(result) {
										},
										failure : function(result, e) {
											// reinsert into the array
											console.log(e.message);
											$scope.crudObjects.splice(index, 0,
													scopedParseGuard);
											// TODO show information about the
											// error
										}
									});
								});
							}

						} ]).directive('crudEditDelete', function() {
						    return {
						        restrict: 'E',
						        transclude: true,
						        templateUrl: 'views/crud.edit.delete.html'
						      };
						    });;

controllerModule.controller('GuardCtrl', [ '$scope', 'ParseGuardObject',
		function($scope, ParseGuardObject) {

			$scope.$parent.ParseCrud = ParseGuardObject.getParseObject;

		} ]);

controllerModule.controller('ClientCtrl', [ '$scope', 'ClientObject',
		function($scope, ClientObject) {

			$scope.$parent.ParseCrud = ClientObject.getParseObject;

		} ]);

controllerModule.controller('CircuitCtrl', [ '$scope', 'CircuitObject',
		function($scope, CircuitObject) {

			$scope.$parent.ParseCrud = CircuitObject.getParseObject;

		} ]);

controllerModule.controller('MainCtrl', [
		'$scope',
		'$location',
		'$timeout',
		'$routeSegment',
		'ParseService',
		function($scope, $location, $timeout, $routeSegment, ParseService) {

			$scope.ParseAccount = ParseService.Account;
			$scope.$routeSegment = $routeSegment;

			$scope.go = function(path) {
				$location.path(path);
			};

			console.log('logged in ' + $scope.ParseAccount.isLoggedIn());

			if (!$scope.ParseAccount.isLoggedIn()
					&& $scope.$routeSegment.name !== '/login') {
				$scope.go('login');
			}

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