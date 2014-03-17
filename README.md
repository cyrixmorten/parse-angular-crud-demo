parse-angular-crud-demo
=======================

Easy-to-deploy CRUD interface for simple Parse objects

	new ParseService.StandardParseObject({
		objectname : 'Guard',
		attrs : [ 'guardId', 'name' ]
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
    
The above is 90% of the code needed to define a CRUD enabled ParseObject.

StandardParseObject takes 4 arguments:
1. An object defining the name of the ParseObject and a list of attributes. The list of attributes is used by parse-angular-patch to automatically generate setters/getters. You do not need to specify all of the cols of your ParseObject, only those you want to expose to CRUD features.
2. An empty template of the cols you would like to expose to CRUD features. Should be a subset of the attrs from the first argument.
3. A filled template using the automatically generated getters.
4. A default template. This template is automatically applied to any create or edit action, which is suitable for ACL definitions or owner relations as shown above.


### Pojects used to create this demo:

- [angular-seed](https://github.com/angular/angular-seed) Provided initial structure for this project
- [angular-route-segment](https://github.com/artch/angular-route-segment) Supports child scopes in partials 
- [parse-angular-patch](https://github.com/brandid/parse-angular-patch) Makes working with Parse easier
- [ng-table](https://github.com/esvit/ng-table) Nice Angular table

### Running the demo

1. Navigate to parse-angular-crud-demo/app/js/services and replace `Application ID` and `Javascript Key` in Parse.initialize
2. Install node.js and run `parse-angular-crud-demo/node scripts/web-server.js`
3. Open a browser and navigate to `http://localhost:8000/app/index.html`
















