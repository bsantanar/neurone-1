import { Meteor } from 'meteor/meteor';

import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import angularTranslate from 'angular-translate';
import angularTranslateLoader from 'angular-translate-loader-static-files';

import template from './app.html';

import { name as Auth } from './auth/auth';
import { name as Home } from './views/home';
import { name as Navigation } from './views/navigation';

import { name as Search } from '../search/search';
import { name as Showcase } from '../showcase/showcase';

import { name as ActionBlocker } from './services/actionBlocker';
import { name as Logger } from '../logger/logger';
import LoggerConfigs from '../logger/loggerConfigs';

class App {}

const name = 'app';

// create a module
export default angular.module(name, [
  angularMeteor,
  uiRouter,
  angularTranslate,
  angularTranslateLoader,
  Logger,
  ActionBlocker,
  Home,
  Auth,
  Navigation,
  Showcase,
  Search
])
.component(name, {
  template,
  controllerAs: name,
  controller: App
})
.directive('ngOnload', ngOnloadDirective)
.config(config)
.run(run)
.run(setTrackers);

function config($locationProvider, $urlRouterProvider, $translateProvider) {
  'ngInject';
 
  // uiRouter settings
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/home');

  // angularTranslate settings
  $translateProvider.useStaticFilesLoader({
      prefix: 'i18n/locale-',
      suffix: '.json'
    });
  $translateProvider.useSanitizeValueStrategy('escape');
  $translateProvider.preferredLanguage('en');
};

function run($rootScope, $state) {
  'ngInject';

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'AUTH_REQUIRED') {
        $state.go('login');
      }
    }
  );
};

function setTrackers($rootScope, KMTrackService, LinkTrackService, ActionBlockerService) {
  'ngInject';

  lts = LinkTrackService;
  kmts = KMTrackService;
  abs = ActionBlockerService;

  $rootScope.$on('$viewContentLoaded', function (event) {
    if (Meteor.user()) {
      var state = 'BEGIN';
      lts.saveVisitedLink(state);
      kmts.service();
      abs.service();
    }
    else {
      kmts.antiService();
      abs.antiService();
    }
  });

  $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
    if (Meteor.user()) {
      var state = 'END';
      lts.saveVisitedLink(state);
      kmts.service();
      abs.service();
    }
    else {
      kmts.antiService();
      abs.antiService();
    }
  });

  // http://stackoverflow.com/a/16204326
  // http://stackoverflow.com/a/27984921
};

// From https://gist.github.com/mikaturunen/f0b45def06bc83ccea9e
function ngOnloadDirective() {
  return {
    restrict: "A",
      scope: {
        callback: "&ngOnload"
      },
      link: function(scope, element, attrs) {
        // hooking up the onload event
        element.on("load", () => scope.callback());
      }
  };
};