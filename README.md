parse-angular-crud-demo
=======================

Easy-to-deploy CRUD interface for Parse objects

Making it possible for end-users to **Cr**eate, **U**pdate and **D**elete objects using [parse.com](www.parse.com) as backend.

> Due to a lot of refactoring and posibly a lot of changes to come, I choose not to write an extensive how-to and rather leave the simplest example of one of the objects used in the demo. Luckily the demo is easy to run, so feel free to try it and explore the code.

Model definition of a ParseObject `/js/services.js`:

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
            
Controller code exposing CRUD features:

	controllerModule.controller('GuardCtrl', [ '$scope', 'ParseObjects',
			function($scope, ParseObjects) {
				// get object from the factory
				var ParseObject = ParseObjects.ParseGuardObject;
	
				// apply standard values that are not visible in UI
				ParseObject.setHiddenData({
					ACL : new Parse.ACL(Parse.User.current()),
					owner : Parse.User.current()
				});
	
				// attatch the ParseObject to the parent controller CRUDCtrl
				$scope.$parent.ParseCrud = ParseObject;
				
				// load the data
				$scope.$parent.loadData();
	
			} ]);
            
And finally the View that talks to GuardCtrl can be found at `/partials/crud/guards.html`

The following part of `/js/app.js` ensures that the Controller `CRUDCtrl` is a parent for `GuardCtrl`:

	segment('crud', {templateUrl: 'partials/crud.html', controller: 'CRUDCtrl'}).
    within().
		segment('guards', {templateUrl: 'partials/crud/guards.html', controller: 'GuardCtrl'})

### Pojects used to create this demo:

- [angular-seed](https://github.com/angular/angular-seed) Provided initial structure for this project
- [angular-route-segment](https://github.com/artch/angular-route-segment) Supports child scopes in partials 
- [parse-angular-patch](https://github.com/brandid/parse-angular-patch) Makes working with Parse easier
- [ng-table](https://github.com/esvit/ng-table) Nice Angular table
- [angular-translate](https://github.com/angular-translate/angular-translate) Using basic translation

### Running the demo

1. Navigate to parse-angular-crud-demo/app/js/services and replace `Application ID` and `Javascript Key`
2. Install node.js and run `parse-angular-crud-demo/node scripts/web-server.js`
3. Open a browser and navigate to `http://localhost:8000/app/index.html`