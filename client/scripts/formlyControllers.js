'use strict';

/* Controllers */

//angular.module('myApp.controllers', [])
angular.module('myApp.controllers')


// SFormlyCtrl ---------------------------------------------------------------------------------
.controller('SFormlyCtrl', 
          ['$rootScope','$scope', '$state', '$location', 'Session', '$log', '$timeout','ENV','formlyConfig','$q','$http','formlyValidationMessages',
     function($rootScope, $scope,  $state, $location,     Session,   $log,   $timeout, ENV, formlyConfig,$q, $http,formlyValidationMessages ) {
    
  $log.debug('SFormlyCtrl>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');                                 

 
    var vm = this;
    var unique = 1;

    var ElencoPlessi = [
      {
        "id": "LA VELA - Torre Pedrera",
        "label":"LA VELA - Torre Pedrera"
      },
      {
        "id": "IL VOLO - Rimini Centro",
        "label":"IL VOLO - Rimini Centro"
      },
      {
        "id": "IL DELFINO - Bellariva",
        "label":"IL DELFINO - Bellariva"
      }
    ];


  var attributes = [
    'date-disabled',
    'custom-class',
    'show-weeks',
    'starting-day',
    'init-date',
    'min-mode',
    'max-mode',
    'format-day',
    'format-month',
    'format-year',
    'format-day-header',
    'format-day-title',
    'format-month-title',
    'year-range',
    'shortcut-propagation',
    'datepicker-popup',
    'show-button-bar',
    'current-text',
    'clear-text',
    'close-text',
    'close-on-date-selection',
    'datepicker-append-to-body'
  ];

  var bindings = [
    'datepicker-mode',
    'min-date',
    'max-date'
  ];

  
  function camelize(string) {
    string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
    // Ensure 1st char is always lowercase
    return string.replace(/^([A-Z])/, function(match, chr) {
      return chr ? chr.toLowerCase() : '';
    });
  };

  function refreshAddresses(address, field) {
      var promise;
      if (!address) {
        promise = $q.when({data: {results: []}});
      } else {
        var params = {address: address, sensor: false};
        var endpoint = '//maps.googleapis.com/maps/api/geocode/json';
        promise = $http.get(endpoint, {params: params});
      }
      return promise.then(function(response) {
        field.templateOptions.options = response.data.results;
      });
  };

  var ngModelAttrs = {};

  angular.forEach(attributes, function(attr) {
    ngModelAttrs[camelize(attr)] = {attribute: attr};
  });

  angular.forEach(bindings, function(binding) {
    ngModelAttrs[camelize(binding)] = {bound: binding};
  });

  formlyConfig.extras.removeChromeAutoComplete = true;

  formlyConfig.setWrapper({    
        name: 'panel',
        templateUrl: 'templates/formly-wrapper-panel-template.html'
  });


  formlyConfig.setWrapper([
      {
        templateUrl: 'templates/formly-input-with-error-template.html',
        types: 'inputWithError'
      },
      {
        template: [
          '<div class="checkbox formly-template-wrapper-for-checkboxes form-group">',
          '<label for="{{::id}}">',
          '<formly-transclude></formly-transclude>',
          '</label>',
          '</div>'
        ].join(' '),
        types: 'checkbox'
      }
    ]);
  

   
    formlyConfig.setType({
      name: 'ui-select-single',
      extends: 'select',
      templateUrl: 'templates/formly-ui-select-single-template.html'
    });

    formlyConfig.setType({
      name: 'ui-select-single-select2',
      extends: 'select',
      templateUrl: 'templates/formly-ui-select2-single-template.html'
    });

    formlyConfig.setType({
      name: 'ui-select-single-search',
      extends: 'select',
      templateUrl: 'templates/formly-ui-select-single-async-template.html'
    });

    formlyConfig.setType({
      name: 'ui-select-multiple',
      extends: 'select',
      templateUrl: 'templates/formly-ui-select-multiple-template.html'
    });

  formlyConfig.setType({
    name: 'datepicker',
    templateUrl:  'templates/formly-datepicker-bootstrap-template.html',
    wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    defaultOptions: {
      ngModelAttrs: ngModelAttrs,
      templateOptions: {
        datepickerOptions: {
          format: 'dd/MM/yyyy',
          initDate: new Date()
        }
      }
    },
    controller: ['$scope', function ($scope) {
      $scope.datepicker = {};
      $scope.datepicker.opened = false;
      $scope.datepicker.open = function ($event) {
        $scope.datepicker.opened = !$scope.datepicker.opened;
      };
    }]
  });


    formlyConfig.setType({
      name: 'repeatSection',
      templateUrl: 'templates/formly-repeatSection-template.html',
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
    


    formlyConfig.setType({
      name: 'uploadFile',
      templateUrl: 'templates/formly-file-upload-template.html',
      controller: function($scope) {
        $scope.formOptions = {formState: $scope.formState};
        $scope.addNew = addNew;
        $scope.copyFields = copyFields;
        
        function showEv(f){
          console.log(f);
        }

        $scope.onErrorHandler = function (event, reader, fileList, fileObjs, file) {
          console.log('onErrorHandler');
          console.log(event);
          console.log(reader);
          console.log(fileList);
          console.log(fileObjs);
          console.log(file);
        }

        $scope.onAfterValidateFunc = function (event, fileObjs, fileList) {
          console.log('onAfterValidate');
          console.log(event);
          console.log(fileObjs);
          console.log(fileList);
        }

        $scope.onChangeHandlerFunc = function (event, fileList){
          console.log('onChangeHandlerFunc');
          console.log(event);
          console.log(fileList);
        }

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
    
    formlyValidationMessages.messages.required = 'to.label + " è obbligatorio"';
    formlyValidationMessages.messages.email = '$viewValue + " is not a valid email address"';
    formlyValidationMessages.addTemplateOptionValueMessage('minlength', 'minlength', '', '#### is the minimum length', '**** Too short');
    formlyValidationMessages.addTemplateOptionValueMessage('maxlength', 'maxlength', '', '## is the maximum length', '** **Too long');
/*
*/
    vm.id = 'form01';
    vm.showError = true;

    // function assignment
    vm.onSubmit = onSubmit;

    // variable assignment

    vm.author = { // optionally fill in your info below :-)
      name: 'RR',
      url: 'https://www.comune.rimini.it' // a link to your twitter/github/blog/whatever
    };

    vm.exampleTitle = 'Modulo di test 2016';
    vm.exampleDescription = 'Descrizione operativa del modulo';

    vm.env = {
      angularVersion: angular.version.full,
      formlyVersion: '1.0.0'
    };

    vm.model = {
      showErrorState: true
      /*
      awesome: true,
      nucleo: [
          {
            CognomeNome:'abc',
            DataNascita:(new Date()).toDateString(),
            CodiceFiscale:''
          }
      ]
      */
    };

    vm.errors = {};

    vm.options = {
      formState: {
        awesomeIsForced: false
      }
    };
    
    vm.fields = [
    /*
    {
        key: 'singleOption',
        type: 'ui-select-single',
        templateOptions: {
          optionsAttr: 'bs-options',
          ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
          label: 'Single Select',
          valueProp: 'id',
          labelProp: 'label',
          placeholder: 'Select option',
          description: 'Template includes the allow-clear option on the ui-select-match element',
          options: testData
        }
      },
      {
        key: 'multipleOption',
        type: 'ui-select-multiple',
        templateOptions: {
          optionsAttr: 'bs-options',
          ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
          label: 'Multiple Select',
          valueProp: 'id',
          labelProp: 'label',
          placeholder: 'Select options',
          options: testData
        }
      },
      {
        key: 'singleOptionAsync',
        type: 'ui-select-single-search',
        templateOptions: {
          optionsAttr: 'bs-options',
          ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
          label: 'Async Search',
          valueProp: 'formatted_address',
          labelProp: 'formatted_address',
          placeholder: 'Search',
          options: [],
          refresh: refreshAddresses,
          refreshDelay: 0
        }
      },
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
      },*/
      /*
      {
        key: 'image',
        type: 'uploadFile',
        templateOptions: {
          label: '',
          maxsize: '500'
        }
      },
      */
      {
        key: 'DICHIARANTI',
        wrapper: 'panel',
        className: 'to-uppercase',
        templateOptions: { 
          label: '1.0 Dichiaranti',
          info: 'In questa sezione devono essere indicati i dichiaranti',
          help: 'In questa sezione devono essere indicati i dichiaranti'
        },
        fieldGroup: [
        {
          key: 'DichiarantePadre',
          type: 'input',
          wrapper: 'inputWithError',
          templateOptions: {
            required: true,
            placeholder: 'This is required min 3 max 8 ...',
            label: 'Il sottoscritto (padre)',
            maxlength: 8,
            minlength: 3
          }
        },
        {
          key: 'DichiaranteMadre',
          type: 'input',
          wrapper: 'inputWithError',
          templateOptions: {
            required: true,
            type: 'text',
            label: 'La sottoscritta (madre)'
          }
        }
        ]
      },
      /*
      {
        key: 'FATTURAZIONE',
        wrapper: 'panel',
        templateOptions: { 
          label: '2.0 Dati fatturazione',
          info: 'Inserire in questa sezione i dati relativi alla fatturazione',
          help: 'Inserire in questa sezione i dati relativi alla fatturazione'
        },
        fieldGroup: [
        {
          key: 'CodiceFiscale',
          type: 'input',
          templateOptions: {
            required: true,
            type: 'text',
            label: 'Codice Fiscale'
          }
        },
        {
          key: 'NatoA',
          type: 'input',
          templateOptions: {
            required: true,
            type: 'text',
            label: 'Nato A:'
          }
        },
        {
          key: 'DataNascita',
          type: 'datepicker',
          templateOptions: {
              label: 'Data Nascita',
              type: 'text',
              datepickerPopup: 'dd-MMMM-yyyy'
            }
         }

        ]
      },
      */
      {
        key: 'PLESSO',
        wrapper: 'panel',
        templateOptions: { 
          label: '3.0 Scelta del centro estivo',
          info: 'La sceltaInserire in questa sezione i dati relativi alla fatturazione</br>LA VELA</br>IL VOLO</br>DELFINO',
          warn: 'La sceltaInserire in questa sezione i dati relativi alla fatturazione',
          help: 'Inserire in questa sezione i dati relativi alla fatturazione'
        },
        fieldGroup: [
      {
        key: 'PLESSISELEZIONE',
        type: 'ui-select-multiple',
        wrapper: 'inputWithError',
         validators: {
          conteggio: {
            expression: function(viewValue, modelValue) {
              console.log(modelValue);
              console.log(viewValue);
              var value = modelValue || viewValue;
              if(modelValue){
                if ((modelValue.length > 0) && (modelValue.length < 3))  {
                  return true;
                } else {
                  return false;
                }
              } else {
                return false;
              }
            },
            message: '$viewValue + " o uno o due"'
          }
        },
        templateOptions: {
          required: true,
          optionsAttr: 'bs-options',
          ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
          label: 'Selezionare una o due scuole in ordine di scelta',
          valueProp: 'id',
          labelProp: 'label',
          placeholder: 'Cliccare qui per selezionare',
          options: ElencoPlessi
        }
      }
        ]
      },
      /*
      {
        key: 'SITUAZIONEPARENTALE',
        wrapper: 'panel',
        templateOptions: { 
          label: '99.0 Situazione parentale',
          info: '---',
          warn: '--',
          help: '---'
        },
        fieldGroup: [
              {
                key: 'SITUAZIONEPARENTALE_1',
                type: 'multiCheckbox',
                templateOptions: {
                  label: 'Nucleo inco......',
                  options: [{id: 1, title : "Stato uno"}, 
                            {id: 2, title : "Stato due "},
                            {id: 3, title : "Stato tre"}],
                  valueProp: 'id',
                  labelProp: 'title'
                }
              },
              {
                template: '<p>Description ...</p>'
              },
              {
                key: 'SITUAZIONEPARENTALE_2',
                type: 'multiCheckbox',
                templateOptions: {
                  label: 'Presenza altri dati',
                  options: [{id: 1, title : "Stato 1"}, {id: 2, title : "Stato 2"}],
                  valueProp: 'id',
                  labelProp: 'title'
                }
              }
            ]
      },
      */

      /*
      {
        key: 'certo',
        type: 'input',
        templateOptions: {
          label: 'CertoLabel',
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
      */
      /*
      {
        key: 'UPLOADDATA',
        type: 'uploadSection',
        wrapper: 'panel',
        //templateOptions: { label: 'Address', info: 'info!' },
        //templateUrl: 'templates/formly-custom-template.html',
        templateOptions: 
        {
          label: 'X.0 CARICAMENTO DATI', 
          info: 'A tal fine .... ai sensi della La sceltaInserire in questa sezione i dati relativi alla fatturazione</br>LA VELA</br>IL VOLO</br>DELFINO',
          warn: 'La sceltaInserire in questa sezione i dati relativi alla fatturazione',
          btnText:'Nuova persona',
          help: 'help......',
          fields: [
            {
              //className: 'row',
              fieldGroup: 
              [
              {
                  key: 'TipoDato',
                  className: 'col-md-2',
                  type: 'select',
                  templateOptions: {
                    label: '',
                    options: [
                      {label: 'CI', id: 'CI'},
                      {label: 'AA', id: 'AA'},
                      {label: 'FF', id: 'FF'}
                    ],
                    ngOptions: 'option as option.label group by option.gender for option in to.options'
                  }
                },
                {
                  type: 'input',
                  className: 'col-md-3',
                  key: 'Description',
                  templateOptions: 
                  {
                    label: '',
                    required: true
                  }
                },
                {
                  type: 'input',
                  key: 'CodiceFiscale',
                  className: 'col-md-2',
                  templateOptions: 
                  {
                        label: '',
                        required: true
                  }
                },

              ] // fieldGroup
            }
          ], //fields
        } //templateOptions
      },
      */
      {
        key: 'UPLOADFILE',
        type: 'repeatSection',
        wrapper: 'panel',
        //templateOptions: { label: 'Address', info: 'info!' },
        //templateUrl: 'templates/formly-custom-template.html',
        templateOptions: 
        {
          label: 'labelUpload', 
          info: 'infoUpload',
          warn: 'wUpload',
          btnText:'Nuovo elemento btn',
          help: 'helpUpload',
          fields: [
            {
              //className: 'row',
              fieldGroup: 
              [
              {
                  key: 'TipoDocumento',
                  className: 'col-md-3',
                  type: 'select',
                  templateOptions: {
                    required: true,
                    label: 'Tipo documento',
                    options: [
                      {name: 'Carta Identità', value: 'Carta Identità'},
                      {name: 'Patente', value: 'Patente'}
                    ]
                  }
                },
                {
                  key: 'image',
                  className: 'col-md-8',
                  type: 'uploadFile',
                  templateOptions: {
                    //required: true,
                    label: 'Selezione file:',
                    maxsize: '500'
                  }
                }
              ] // fieldGroup
            }
          ], //fields
        } //templateOptions
      },





      {
        key: 'NUCLEOFAMILIARE',
        type: 'repeatSection',
        wrapper: 'panel',
        //templateOptions: { label: 'Address', info: 'info!' },
        //templateUrl: 'templates/formly-custom-template.html',
        templateOptions: 
        {
          label: '4.0 DICHIARAZIONE NUCLEO FAMILIARE', 
          info: 'La sceltaInserire in questa sezione i dati rela',
          warn: 'La sceltaInserire in questa sezione i dati relativi alla fatturazione',
          btnText:'Aggiungi nuovo membro del nucleo familiare',
          help: 'help......',
          fields: [
            {
              //className: 'row',
              fieldGroup: 
              [
              {
                  key: 'TipoMembro',
                  className: 'col-md-3',
                  type: 'select',
                  templateOptions: {
                    label: 'Tipo dichiarante',
                    options: [
                      {name: 'DICHIARANTE', value: 'DICHIARANTE'},
                      {name: 'ALTRO GENITORE', value: 'ALTRO GENITORE'},
                      {name: 'FIGLIO O AFFIDATO', value: 'FIGLIO O AFFIDATO'}
                    ]
                  }
                },
                {
                  type: 'input',
                  className: 'col-md-4',
                  key: 'CognomeNome',
                  templateOptions: 
                  {
                    label: 'Cognome Nome',
                    required: true
                  }
                },
                {
                  type: 'input',
                  key: 'CodiceFiscale',
                  className: 'col-md-4',
                  templateOptions: 
                  {
                        label: 'Codice Fiscale',
                        required: true
                  }
                }
              ] // fieldGroup
            }
          ], //fields
        } //templateOptions
      }
      /*  
      ,
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
      */
    ];


    vm.originalFields = angular.copy(vm.fields);

    // function definition
    function onSubmit() {
       if (vm.form.$valid) {
          vm.options.updateInitialValue();
          alert(JSON.stringify(vm.model), null, 2);
        }
    }
                                 
}]);