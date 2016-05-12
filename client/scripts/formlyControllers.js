'use strict';

/* Controllers */

//angular.module('myApp.controllers', [])
angular.module('myApp.controllers')


// SFormlyCtrl ---------------------------------------------------------------------------------
.controller('SFormlyCtrl', 
          ['$rootScope','$scope', '$state', '$location', 'Session', '$log', '$timeout','ENV','formlyConfig',
     function($rootScope, $scope,  $state, $location,     Session,   $log,   $timeout, ENV, formlyConfig ) {
    
  $log.debug('SFormlyCtrl>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');                                 

 
    var vm = this;
    var unique = 1;


    formlyConfig.setType({
      name: 'repeatSection',
      template: `<div>
        <div class="panel panel-default">
        <div class="panel-heading">{{to.btnText}}</div>
        <div class="panel-body">
        <div class="{{hideRepeat}}">
          <p>{{options.key | json}}</p>
          <div class="repeatsection" ng-repeat="element in model[options.key]" ng-init="fields = copyFields(to.fields)">
            <formly-form fields="fields"
                         model="element"
                         form="form">
            </formly-form>
              <button type="button" class="btn btn-sm btn-danger col-xs-3" ng-click="model[options.key].splice($index, 1)">
                Remove
              </button>
            <hr>
         </div>
        <p class="AddNewButton">
          <button type="button" class="btn btn-primary btn-block" ng-click="addNew()" >{{to.btnText}}</button>
        </p>
        </div>
       </div>
       </div>`,
      controller: function($scope) {
        $scope.formOptions = {formState: $scope.formState};
        $scope.addNew = addNew;
        $scope.copyFields = copyFields;
        
        function copyFields(fields) {
          fields = angular.copy(fields);
          addRandomIds(fields);
          return fields;
        }
        
        function addNew() {
          $scope.model[$scope.options.key] = $scope.model[$scope.options.key] || [];
          var repeatsection = $scope.model[$scope.options.key];
          var lastSection = repeatsection[repeatsection.length - 1];
          var newsection = {};
          if (lastSection) {
            newsection = angular.copy(lastSection);
          }
          repeatsection.push(newsection);
        }
        
        function addRandomIds(fields) {
          unique++;
          angular.forEach(fields, function(field, index) {
            if (field.fieldGroup) {
              addRandomIds(field.fieldGroup);
              return; // fieldGroups don't need an ID
            }
            
            if (field.templateOptions && field.templateOptions.fields) {
              addRandomIds(field.templateOptions.fields);
            }
            
            field.id = field.id || (field.key + '_' + index + '_' + unique + getRandomInt(0, 9999));
          });
        }
        
        function getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        }
      }
    });
    


    vm.id = 'form01';
    vm.showError = true;

    // funcation assignment
    vm.onSubmit = onSubmit;

    // variable assignment

    vm.author = { // optionally fill in your info below :-)
      name: 'Kent C. Dodds',
      url: 'https://twitter.com/kentcdodds' // a link to your twitter/github/blog/whatever
    };

    vm.exampleTitle = 'Introduction';

    vm.env = {
      angularVersion: angular.version.full,
      formlyVersion: '1.0.0'
    };

    vm.model = {
      awesome: true,
      nucleo: [
          {
            CognomeNome:'abc',
            DataNascita:(new Date()).toDateString(),
            CodiceFiscale:''
          }
      ]
    };

    vm.errors = {};

    vm.options = {
      formState: {
        awesomeIsForced: false
      }
    };
    
    vm.fields = [
      {
        key: 'text',
        type: 'input',
        templateOptions: {
          label: 'Text',
          placeholder: 'insert ...',
          required: true
        },
        validators : { 
          isUnique: function($viewValue, $modelValue, scope){
            var value = $viewValue || $modelValue;
            console.log(value);
            if (value == "aaaa" || value == "") {
              //throw new Error('IS aaaa');
              return false;
            } else {
              return true;
            }
          },
          message: '$viewValue + " is not a valid IP Address"'
        },
        validation: {
         messages: {
              required: 'to.label + " is required"'
         }
        }
      },
      {
        key: 'certo',
        type: 'input',
        templateOptions: {
          label: 'Certo',
          placeholder: 'visible se text presente',
          required: true
        },
        expressionProperties: {
          hideExpression: '!model.text',
          'templateOptions.disabled': function($viewValue, $modelValue, scope){
              var value = $viewValue || $modelValue;
              if (scope.model.text == "aaaaaaa" ) {
              //throw new Error('IS aaaa');
              return false;
            } else {
              return true;
            }
          }
        }
      },

      {
        template : '<hr/>'
      },

      {
        key: 'nested.story',
        type: 'textarea',
        templateOptions: {
          label: 'Some sweet story',
          placeholder: 'It allows you to build and maintain your forms with the ease of JavaScript :-)',
          description: ''
        },
        expressionProperties: {
          'templateOptions.focus': 'formState.awesomeIsForced',
          'templateOptions.description': function(viewValue, modelValue, scope) {
            if (scope.formState.awesomeIsForced) {
              return 'And look! This field magically got focus!';
            }
          }
        }
      },

      {
        key: 'awesome',
        type: 'checkbox',
        templateOptions: { label: '' },
        expressionProperties: {
          'templateOptions.disabled': 'formState.awesomeIsForced',
          'templateOptions.label': function(viewValue, modelValue, scope) {
            if (scope.formState.awesomeIsForced) {
              return 'Too bad, formly is really awesome...';
            } else {
              return 'Is formly totally awesome? (uncheck this and see what happens)';
            }
          }
        }
      },

      {
        key: 'whyNot',
        type: 'textarea',
        expressionProperties: {
          'templateOptions.placeholder': function(viewValue, modelValue, scope) {
            if (scope.formState.awesomeIsForced) {
              return 'Too bad... It really is awesome! Wasn\'t that cool?';
            } else {
              return 'Type in here... I dare you';
            }
          },
          'templateOptions.disabled': 'formState.awesomeIsForced'
        },
        hideExpression: 'model.awesome',
        templateOptions: {
          label: 'Why Not?',
          placeholder: 'Type in here... I dare you'
        },
        watcher: {
          listener: function(field, newValue, oldValue, formScope, stopWatching) {
            if (newValue) {
              stopWatching();
              formScope.model.awesome = true;
              formScope.model.whyNot = undefined;
              field.hideExpression = null;
              formScope.options.formState.awesomeIsForced = true;
            }
          }
        }
      },
      
      {
        key: 'nucleo',
        type: 'repeatSection',
        //templateUrl: 'templates/formly-custom-template.html',
        templateOptions: 
        {
          btnText:'Nuova persona',
          fields: [
            {
              className: 'row',
              fieldGroup: 
              [
                {
                  type: 'input',
                  className: 'col-xs-3',
                  key: 'CognomeNome',
                  templateOptions: 
                  {
                    label: 'Cognome nome:',
                    required: true
                  }
                },
                {
                  type: 'input',
                  key: 'DataNascita',
                  className: 'col-xs-3',
                  templateOptions: 
                  {
                    label: 'DataNascita',
                    placeholder: 'dd/mm/yyyy such as 20/05/2015',
                    dateFormat: 'DD, d  MM, yy',
                    required: true
                  }
                },
                {
                  type: 'input',
                  key: 'CodiceFiscale',
                  className: 'col-xs-3',
                  templateOptions: 
                  {
                        label: 'Codice Fiscale',
                        required: true
                  }
                },
                {
                  template: '</div></div>'
                }

              ] // fieldGroup
            }
          ], //fields
        } //templateOptions
      },
      
      {
        key: 'custom',
        type: 'custom',
        templateOptions: {
          label: 'Custom template inlined',
        }
      },
      {
        key: 'exampleDirective',
        template: '<div example-directive></div>',
        templateOptions: {
          label: 'Example Directive',
        }
      }
    ];

    // function definition
    function onSubmit() {
      alert(JSON.stringify(vm.model), null, 2);
    }
                                 
}]);