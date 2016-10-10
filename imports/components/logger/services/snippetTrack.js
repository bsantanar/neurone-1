import { Meteor } from 'meteor/meteor';

import Utils from '../loggerUtils';
import LoggerConfigs from '../loggerConfigs';

export default class SnippetTrackService {
  constructor($translate) {
    'ngInject';

    this.$translate = $translate;
  }

  saveSnippet() {
    var iframeElement = document.getElementById(LoggerConfigs.iframeId),
         iframeWindow = iframeElement ? iframeElement.contentWindow || iframeElement : null,
              snippet = iframeWindow ? iframeWindow.getSelection().toString() || window.getSelection().toString() : window.getSelection().toString();
    
    if (Meteor.user() && !Utils.isEmpty(snippet)) {
      var snippetObject = {
        owner: Meteor.userId(),
        username: Meteor.user().emails[0].address,
        snipped_text: snippet,
        title: document.title,
        url: window.location.href,
        local_time: Utils.getTimestamp()
      };

      Meteor.call('storeSnippet', snippetObject, (err, result) => {
        if (!err) {
          var msg = this.$translate.instant('alerts.snippetSaved');
          Utils.logToConsole('Snippet Saved!', snippetObject.url, snippetObject.snipped_text, snippetObject.local_time);
          return msg;
        }
        else {
          var msg = this.$translate.instant('alerts.error');
          Utils.logToConsole('Unknown Error');
          return msg;
        }
      });
    }
  }
}