import Utils from '../../globalUtils';
import Configs from '../../globalConfigs';

import { FlowComponents } from '../../../database/flowComponents/index';

import template from './documentLoader.html';

class DocumentLoader {
  constructor($scope, $reactive) {
    'ngInject';

    $reactive(this).attach($scope);

    this.subscribe('flowComponents');

    this.helpers({
      locales: () => FlowComponents.find({ type: 'locale' }),
      domains: () => FlowComponents.find({ type: 'domain' }),
      tasks: () => FlowComponents.find({ type: 'task' })
    });

    this.doc = {};
    this.route = '';
    this.state = 'wait';

    console.log('DocumentLoader loaded!');
  }

  downloadDocument() {
    this.state = 'load';

    if (this.form.$valid) {
      this.docObj = this.parseDocumentForm();

      console.log('Document download request sent!', this.docObj);

      this.apply('fetchDocument', [ this.docObj ], { noRetry: true }, (err, res) => {
        if (!err) {
          // console.log(res);
          this.doc = res;
          this.route = res.route;
          this.state = 'show';  
        }
        else {
          console.error('Error while downloading document', err);
          this.doc = {};
          this.route = '';
          this.state = 'error';    
        }
      });
    }
    else {
      console.error('Invalid document form!');
      this.doc = {};
      this.route = '';
      this.state = 'error';
    }
  }

  previewDocument() {
    this.state = 'load';
    
    if (this.form.$valid) {
      this.docObj = this.parseDocumentForm();

      console.log('Document preview request sent!', this.docObj);

      this.apply('previewDocument', [ this.docObj ], { noRetry: true }, (err, res) => {
        if (!err) {
          // console.log(res);
          this.doc = res;
          this.route = res.route;
          this.state = 'show';  
        }
        else {
          console.error('Error while downloading document', err);
          this.doc = {};
          this.route = '';
          this.state = 'error';    
        }
      });
    }
    else {
      console.error('Invalid document form!');
      this.doc = {};
      this.route = '';
      this.state = 'error';
    }
  }

  parseDocumentForm() {
    // TODO check change test-topic
    let form = {
      docName: this.docName,
      title: this.title,
      locale: this.locale || '', //!!(this.locale) ? this.locale[0].properties.code : '',
      relevant: this.relevant || false,
      task: !!this.task ? Utils.forceArray(this.task) : [],
      domain: !!this.domain ? Utils.forceArray(this.domain) : [],
      keywords: !!(this.keywords) && (this.keywords.length > 1) ? this.keywords.split(',').map((kw) => { return kw.trim() }) : [],
      url: this.url,
      maskedUrl: this.maskedUrl,
      searchSnippet: this.snippet || '',
    };

    return form;
  }
}

const name = 'documentLoader';

export default angular.module(name, [
])
.component(name, {
  template: template.default,
  controllerAs: name,
  controller: DocumentLoader
});