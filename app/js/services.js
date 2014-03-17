'use strict';

/* Services */

var app = angular.module('GuardSwiftApp.services', [ 'ngAnimate',
		'parse-angular', 'parse-angular.enhance', 'ngTable' ]);
app
		.service(
				'ParseService',
				function() {

					Parse.initialize(
							"Application ID",
							"Javascript Key");

					this.Account = new function() {

						this.isLoggedIn = function() {
							if (Parse.User.current()) {
								return true;
							}
							return false;
						}

						this.getCurrentUser = function() {
							return Parse.User.current();
						}

						this.login = function(username, password, callback) {
							Parse.User.logIn(username, password, callback);
						}

						this.logout = function() {
							Parse.User.logOut();
						}

					};

					var StandardParseObject = function(construct,
							template_empty, template_filled, template_default) {

						// Define an object with static methods
						var StandardParseObject = Parse.Object.extend({
							className : construct.objectname,
							attrs : construct.attrs
						},
						// Static methods
						{
							loadAll : function() {
								var query = new Parse.Query(
										construct.objectname);
								return query.find();
							}
						});

						this.getTemplate = function() {
							return angular.copy(template_empty);
						};

						/*
						 * returns an object with filled based on a parseObject
						 * and template_filled the parseObject will be set to
						 * the property parseobject
						 */
						this.getScopeFriendlyObject = function(parseObject) {
							var scopedObject = template_filled(parseObject);
							scopedObject.parseobject = parseObject;
							return scopedObject;
						}

						/*
						 * returns an array of objects with properties based on
						 * a parseObject and template_filled
						 */
						this.getScopeFriendlyObjects = function(parseObjects) {
							var scopedObjects = [];
							for ( var index in parseObjects) {
								var scopedGuard = this
										.getScopeFriendlyObject(parseObjects[index]);
								scopedObjects.push(scopedGuard);
							}
							return scopedObjects;
						}

						// adds a new object using current properties
						this.add = function(data, callback) {
							// ensure that the data adheres to the template
							if (verifyDataAgainstTemplate(data, template_empty)) {
								// align with filled template (in case of
								// default values such as ACL)
								var aligned_data = alignDataWithTemplate(data);

								return new Parse.Object(construct.objectname)
										.save(aligned_data, callback);
							} else {
								throw "data does not match template "
										+ objectKeysStringified(data) + " !== "
										+ objectKeysStringified(template_empty);
							}
						};

						this.save = function(scopedParseObject, callback) {
							if (scopedParseObject) {

								var parseObject = scopedParseObject.parseobject;

								// extract data and align with template
								var aligned_data = alignDataWithTemplate(
										scopedParseObject,
										template_filled(parseObject));

								parseObject.save(aligned_data, callback);
							}
						}

						this.fetchAll = function(callback) {
							StandardParseObject.loadAll().then(callback);
						};

						/**
						 * Removes properties that does not belong to the object
						 * Adds missing properties based on template
						 */
						function alignDataWithTemplate(data,
								optional_filled_template) {
							// var dataCopy = angular.copy(data); // do not
							// alter original data
							// console.log(template_default);
							if (optional_filled_template) {
								// delete unknown properties
								for ( var attrname in data) {
									if (!optional_filled_template
											.hasOwnProperty(attrname)) {
										delete data[attrname];
										// console.log('delete ' + attrname);
									}
								}
								// add missing properties
								for ( var attrname in optional_filled_template) {
									if (!data.hasOwnProperty(attrname)) {
										data[attrname] = optional_filled_template[attrname];
										console.log('add filled ' + attrname);
									}
								}
							}

							// add missing properties
							for ( var attrname in template_default) {
								if (!data.hasOwnProperty(attrname)) {
									data[attrname] = template_default[attrname];
									console.log('add default ' + attrname);
								}
							}
							return data;
						}

						function objectKeysStringified(object) {
							return JSON.stringify(Object.keys(object).sort());
						}

						function verifyDataAgainstTemplate(data, template) {
							return objectKeysStringified(data) === objectKeysStringified(template);
						}

					};

					this.StandardParseObject = StandardParseObject;

				});
app.factory('ParseGuardObject', [ 'ParseService', function(ParseService) {

	var factory = {};

	factory.getParseObject = new ParseService.StandardParseObject({
		objectname : 'Guard',
		attrs : [ 'owner', 'guardId', 'name' ]
	}, {
		guardId : '',
		name : ''
	}, function(guard) {
		return {
			guardId : guard.getGuardId(),
			name : guard.getName()
		}
	}, {
		ACL : new Parse.ACL(ParseService.Account.getCurrentUser()),
		owner : ParseService.Account.getCurrentUser()
	});

	return factory;

} ]);
app.factory('ClientObject', [
		'ParseService',
		function(ParseService) {

			var factory = {};

			factory.getParseObject = new ParseService.StandardParseObject({
				objectname : 'Client',
				attrs : [ 'owner', 'name', 'addressName', 'addressNumber',
						'cityName', 'zipcode', 'email' ]
			}, {
				name : '',
				addressName : '',
				addressNumber : '',
				cityName : '',
				zipcode : '',
				email : ''
			}, function(client) {
				return {
					name : client.getName(),
					addressName : client.getAddressName(),
					addressNumber : client.getAddressNumber(),
					cityName : client.getCityName(),
					zipcode : client.getZipcode(),
					email : client.getEmail()
				}
			}, {
				ACL : new Parse.ACL(ParseService.Account.getCurrentUser()),
				owner : ParseService.Account.getCurrentUser()
			});

			return factory;

		} ]);
app.factory('CircuitObject', [ 'ParseService', function(ParseService) {

	var factory = {};

	factory.getParseObject = new ParseService.StandardParseObject({
		objectname : 'Circuit',
		attrs : [ 'name', 'guard', 'units' ]
	}, {
		name : ''
	}, function(circuit) {
		return {
			name : circuit.getName()
		}
	}, {
		ACL : new Parse.ACL(ParseService.Account.getCurrentUser()),
		owner : ParseService.Account.getCurrentUser()
	});

	return factory;

} ]);

app.factory('StandardNgTable', [
		'$filter',
		'ngTableParams',
		function($filter, ngTableParams) {

			var factory = {
				getTable : function(data) {
					return new ngTableParams({
						page : 1, // show first page
						count : 25, // count per page
						// filter : {
						// name: 'M' // initial filter
						// },
						sorting : {
						// name: 'asc' // initial sorting
						}
					}, {
						counts : [],
						total : data.length, // length of data
						getData : function($defer, params) {
							// use build-in angular filter
							var filteredData = params.filter() ? $filter(
									'filter')(data, params.filter()) : data;
							var orderedData = params.sorting() ? $filter(
									'orderBy')(filteredData, params.orderBy())
									: data;

							params.total(orderedData.length); // set total
							// for
							// recalc pagination
							$defer.resolve(orderedData.slice(
									(params.page() - 1) * params.count(),
									params.page() * params.count()));
						}
					});
				}
			}

			return factory;
		} ]);
