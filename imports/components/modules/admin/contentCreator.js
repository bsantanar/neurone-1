import Utils from '../../globalUtils';
import Configs from '../../globalConfigs';

import template from './contentCreator.html';

import { FlowComponents } from '../../../database/flowComponents/index';
import { Locales } from '../../../database/assets/locales';
import { Modals } from '../../../database/assets/modals';
import { Templates } from '../../../database/assets/templates';
import { Images } from '../../../database/assets/images';

// dgacitua: Remember to load new states for stages in this array!
const availableStages = ['instructions', 'affective', 'taskQuestions', 'tutorial', 'search', 'collection', 'criticalEval', 'synthesis', 'end'];

class ContentCreator {
  constructor($scope, $reactive, ModalService, LoadingService) {
    'ngInject';

    this.modal = ModalService;
    this.loading = LoadingService;

    $reactive(this).attach($scope);

    this.panel = {
      locale: false,
      domain: false,
      task: false,
      stage: false,
      asset: false
    };

    this.availableStages = availableStages;

    this.subscribe('flowComponents');
    this.subscribe('locales');
    this.subscribe('modals');
    this.subscribe('templates');
    this.subscribe('images');

    this.helpers({
      locales: () => FlowComponents.find({ type: 'locale' }),
      domains: () => FlowComponents.find({ type: 'domain' }),
      tasks: () => FlowComponents.find({ type: 'task' }),
      stages: () => FlowComponents.find({ type: 'stage'}),
      localeAssets: () => Locales.find().cursor,
      modalAssets: () => Modals.find().cursor,
      templateAssets: () => Templates.find().cursor,
      imageAssets: () => Images.find().cursor
    });

    console.log('ContentCreator loaded!');
  }

  addModal(type) {
    let modalOpts = {};

    if (type === 'locale') {
      modalOpts = {
        title: 'Add new locale',
        templateAsset: 'adminAssets/adminLocaleModal.html',
        buttonType: 'save'
      };
    }
    else if (type === 'domain') {
      modalOpts = {
        title: 'Add new domain',
        templateAsset: 'adminAssets/adminDomainModal.html',
        buttonType: 'save'
      };
    }
    else if (type === 'task') {
      modalOpts = {
        title: 'Add new task',
        templateAsset: 'adminAssets/adminTaskModal.html',
        buttonType: 'save'
      };
    }
    else if (type === 'stage') {
      modalOpts = {
        title: 'Add new stage',
        templateAsset: 'adminAssets/adminStageModal.html',
        buttonType: 'save',
        fields: {
          stages: this.availableStages,
          modals: this.modalAssets,
          templates: this.templateAssets,
          images: this.imageAssets
        }
      };
    }
    else {
      console.error('Invalid content option!');
    }

    if (!Utils.isEmptyObject(modalOpts) && !!type) {
      this.modal.openModal(modalOpts, (err, res) => {
        if (!err && res.answers) {
          let newFlowComponent = res.answers;
          newFlowComponent.type = type;

          FlowComponents.insert(newFlowComponent, (err, res) => {
            if (!err) console.log('Flow Component created!', type, res);
            else console.error('Error while creating Flow Component!', err);
          });
        }
      });
    }
  }

  editModal(type, element) {
    let modalOpts = {};
    let elementRef = angular.copy(element);

    if (type === 'locale') {
      modalOpts = {
        title: 'Edit locale',
        templateAsset: 'adminAssets/adminLocaleModal.html',
        buttonType: 'save',
        fields: {
          content: elementRef
        }
      };
    }
    else if (type === 'domain') {
      modalOpts = {
        title: 'Edit domain',
        templateAsset: 'adminAssets/adminDomainModal.html',
        buttonType: 'save',
        fields: {
          content: elementRef
        }
      };
    }
    else if (type === 'task') {
      modalOpts = {
        title: 'Edit task',
        templateAsset: 'adminAssets/adminTaskModal.html',
        buttonType: 'save',
        fields: {
          content: elementRef
        }
      };
    }
    else if (type === 'stage') {
      modalOpts = {
        title: 'Edit stage',
        templateAsset: 'adminAssets/adminStageModal.html',
        buttonType: 'save',
        fields: {
          stages: this.availableStages,
          modals: this.modalAssets,
          templates: this.templateAssets,
          images: this.imageAssets,
          content: elementRef
        }
      };
    }
    else {
      console.error('Invalid content option!');
    }

    if (!Utils.isEmptyObject(modalOpts) && !!type && !!element) {
      this.modal.openModal(modalOpts, (err, res) => {
        if (!err && res.answers) {
          let editedFlowComponent = res.answers;
          editedFlowComponent.type = type;
          delete editedFlowComponent._id;

          FlowComponents.update(element._id, { $set: editedFlowComponent }, (err, res) => {
            if (!err) console.log('Flow Component edited!', type, res);
            else console.error('Error while editing Flow Component!', err);
          });
        }
      });
    }
  }

  removeModal(element) {
    FlowComponents.remove(element._id, (err, res) => {
      if (!err) console.log('Flow Component removed!', type, res);
      else console.error('Error while removing Flow Component!', err);
    });
  }

  uploadFile(uploadedFile, type) {
    let targetCollection = {};

    if (type === 'locale') targetCollection = Locales;
    else if (type === 'modal') targetCollection = Modals;
    else if (type === 'template') targetCollection = Templates;
    else if (type === 'image') targetCollection = Images;
    else return false;

    const uploader = targetCollection.insert({
      file: uploadedFile,
      streams: 'dynamic',
      chunkSize: 'dynamic'
    }, false);

    uploader.on('start', () => {
      let params = { message: `Loading ${type}...` };
      this.loading.start(params);
    });

    uploader.on('end', (err, fileObj) => {
      if (!err) {
        this.loading.stop();
        console.log('File uploaded!', type, fileObj._id, fileObj.name);
        alert('File uploaded!');
      }
      else {
        this.loading.stop();
        console.error('Error while uploading file!', err);
        alert('Error while uploading file!');
      }
    });

    uploader.start();
  }

  downloadFile(fileObj, type) {
    let targetCollection = {};

    if (type === 'locale') targetCollection = Locales;
    else if (type === 'modal') targetCollection = Modals;
    else if (type === 'template') targetCollection = Templates;
    else if (type === 'image') targetCollection = Images;
    else return false;

    return targetCollection.link(fileObj);
  }

  removeFile(fileObj, type) {
    let targetCollection = {};

    if (type === 'locale') targetCollection = Locales;
    else if (type === 'modal') targetCollection = Modals;
    else if (type === 'template') targetCollection = Templates;
    else if (type === 'image') targetCollection = Images;
    else return false;

    targetCollection.remove(fileObj._id, (err, res) => {
      if (!err) {
        console.log('File removed!', type, fileObj._id, fileObj.name);
        alert('File removed!');
      }
      else {
        console.error('Error while removing file!', err);
        alert('Error while removing file!');
      }
    });
  }
}

const name = 'contentCreator';

export default angular.module(name, [
])
.component(name, {
  template: template.default,
  controllerAs: name,
  controller: ContentCreator
});