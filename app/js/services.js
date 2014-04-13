'use strict';

/* Services */

var app = angular.module('GuardSwiftApp.services', [ 'ngAnimate',
		'parse-angular', 'parse-angular.enhance', 'ngTable' ]);
app.service('ParseService', function() {

	Parse.initialize("Application ID",
			"Javascript Key");

	this.Account = new function() {

		this.isLoggedIn = function() {
			if (Parse.User.current()) {
				return true;
			}
			return false;
		};

		this.getCurrentUser = function() {
			return Parse.User.current();
		};

		this.login = function(username, password, callback) {
			Parse.User.logIn(username, password, callback);
		};

		this.logout = function() {
			Parse.User.logOut();
		};

	};

});
app
		.factory(
				'StandardParseObject',
				function() {

					var StandardParseObject = function(construct) {

						// extinding parse using parse-angular-patch to generate
						// setters/getters
						Parse.Object.extend({
							className : construct.objectname,
							attrs : construct.attrs
						});

						var hiddenData = {};

						var parseObjectHolder = [];

						this.storeParseObject = function(parseObject) {
							var holder = {
								id : parseObject.id,
								object : parseObject
							};
							parseObjectHolder.push(holder);
						};

						this.findParseObject = function(scopedParseObject) {
							var neel = '';
							angular.forEach(parseObjectHolder, function(
									storedParseObject) {
								var sameObjectId = angular.equals(
										storedParseObject.id,
										scopedParseObject.objectId);
								if (sameObjectId) {
									neel = storedParseObject.object;
								}
							});
							return neel;
						};

						// returns a safe copy of the empty template
						this.getTemplate = function() {
							return angular.copy(construct.emptyTemplate);
						};

						this.setHiddenData = function(data) {
							hiddenData = data;
						};

						this.addHiddenData = function(propertyName,
								propertyValue) {
							hiddenData[propertyName] = propertyValue;
						};

						/*
						 * returns an object with filled based on a parseObject
						 * and template_filled the parseObject will be set to
						 * the property parseobject
						 */
						this.getScopeFriendlyObject = function(parseObject) {
							var scopedObject = construct
									.filledTemplate(parseObject);
							scopedObject.objectId = parseObject.id;
							this.storeParseObject(parseObject);
							return scopedObject;
						};

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
						};

						var _this = this;

						// adds a new object using current properties
						this.add = function(data, promise) {
							// ensure that the data adheres to the template
							if (verifyDataAgainstTemplate(data,
									construct.emptyTemplate)) {
								// align with filled template (in case of
								// default values such as ACL)
								var aligned_data = alignDataWithTemplate(data);

								new Parse.Object(construct.objectname).save(
										aligned_data).then(function(result) {
									_this.storeParseObject(result);
									promise.resolve(result);
								}, function(error) {
									promise.reject(error);
								});
							} else {
								promise.reject("data does not match template");
								throw "data does not match template "
										+ objectKeysStringified(data)
										+ " !== "
										+ objectKeysStringified(construct.emptyTemplate);
							}
							;
						};

						// updates an existing object
						this.update = function(scopedParseObject) {
							var parseObject = this
									.findParseObject(scopedParseObject);
							if (parseObject) {
								// extract data and align with template
								var aligned_data = alignDataWithTemplate(
										scopedParseObject, construct
												.filledTemplate(parseObject));

								return parseObject.save(aligned_data);
							} else {
								return new Parse.promise.error(
										'Did not find a parseObject with id '
												+ scopedParseObject.objectId);
							}
						};

						this.remove = function(scopedParseObject) {
							var parseObject = this
									.findParseObject(scopedParseObject);
							if (parseObject) {
								return parseObject.destroy();
							} else {
								return new Parse.promise.error(
										'Did not find a parseObject with id '
												+ scopedParseObject.objectId);
							}
						};

						this.fetchAllQuery = function() {
							return new Parse.Query(construct.objectname);
						};

						this.fetchAll = function(query) {
							if (!query) {
								query = this.fetchAllQuery();
							}
							return query.find();
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
							for ( var attrname in hiddenData) {
								if (!data.hasOwnProperty(attrname)) {
									data[attrname] = hiddenData[attrname];
									console.log('add hidden ' + attrname);
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

					return StandardParseObject;

				});

app.factory('ParseObjects', [
		'ParseService',
		'StandardParseObject',
		function(ParseService, StandardParseObject) {

			var factory = {};

			factory.ParseGuardObject = new StandardParseObject({
				objectname : 'Guard',
				attrs : [ 'guardId', 'name' ],
				emptyTemplate : {
					guardId : '',
					name : ''
				},
				filledTemplate : function(guard) {
					return {
						guardId : guard.getGuardId(),
						name : guard.getName()
					};
				}
			});

			factory.ParseClientObject = new StandardParseObject({
				objectname : 'Client',
				attrs : [ 'number', 'name', 'addressName', 'addressNumber',
						'cityName', 'zipcode', 'email' ],
				emptyTemplate : {
					number : '',
					name : '',
					addressName : '',
					addressNumber : '',
					cityName : '',
					zipcode : '',
					email : ''
				},
				filledTemplate : function(client) {
					return {
						number : client.getNumber(),
						name : client.getName(),
						addressName : client.getAddressName(),
						addressNumber : client.getAddressNumber(),
						cityName : client.getCityName(),
						zipcode : client.getZipcode(),
						email : client.getEmail()
					};
				}
			});
			factory.ParseCircuitObject = new StandardParseObject({
				objectname : 'Circuit',
				attrs : [ 'name', 'timeStart', 'timeEnd' ],
				emptyTemplate : {
					name : '',
					timeStart : '',
					timeEnd : ''
				},
				filledTemplate : function(circuit) {
					return {
						name : circuit.getName(),
						timeStart : circuit.getTimeStart(),
						timeEnd : circuit.getTimeEnd()
					};
				}
			});

			factory.ParseCircuitunitObject = new StandardParseObject({
				objectname : 'CircuitUnit',
				attrs : [ 'name', 'client', 'timeStart', 'timeEnd' ],
				emptyTemplate : {
					name : '',
					client : '',
					timeStart : '',
					timeEnd : ''
				},
				filledTemplate : function(circuitunit) {
					return {
						name : circuitunit.getName(),
						client : circuitunit.getClient(),
						timeStart : circuitunit.getTimeStart(),
						timeEnd : circuitunit.getTimeEnd()
					};
				}
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
