'use strict';
const DnnGeneratorBase = require('../lib/DnnGeneratorBase');
const chalk = require('chalk');
const fs = require('fs');

module.exports = class extends DnnGeneratorBase {
  prompting() {
    const prompts = [
      {
        when: !this.options.hccType,
        type: 'list',
        name: 'hccType',
        message: 'Which Hotcakes Commerce extenion point do you want to build?',
        choices: [
          { name: 'Order Workflow', value: 'workflow' },
          {
            name: chalk.gray('Action Delegate Integration'),
            value: 'actiondelegate',
            disabled: chalk.gray('Coming Soon')
          },
          {
            name: chalk.gray('Credit Card Gateway'),
            value: 'creditcardgateway',
            disabled: chalk.gray('Coming Soon')
          },
          {
            name: chalk.gray('Gift Card Gateway'),
            value: 'giftcardgateway',
            disabled: chalk.gray('Coming Soon')
          },
          {
            name: chalk.gray('Payment Method'),
            value: 'paymentmethod',
            disabled: chalk.gray('Coming Soon')
          },
          {
            name: chalk.gray('Tax Provider'),
            value: 'taxprovider',
            disabled: chalk.gray('Coming Soon')
          },
          {
            name: chalk.gray('Viewset'),
            value: 'viewset',
            disabled: chalk.gray('Coming Soon')
          }
        ]
      },
      {
        when: !this.options.company,
        type: 'input',
        name: 'company',
        message: 'Namespace for your Hotcakes Commerce extension point (Usually a company name)?',
        store: true,
        validate: str => {
          return str.length > 0;
        }
      },
      {
        when: !this.options.name,
        type: 'input',
        name: 'name',
        message: 'What is the name of your Hotcakes Commerce extension point?',
        default: this.appname,
        validate: str => {
          return str.length > 0;
        }
      },
      {
        when: !this.options.description,
        type: 'input',
        name: 'description',
        message: 'Describe your Hotcakes Commerce extension point:',
        validate: str => {
          return str.length > 0;
        }
      },
      {
        when: !this.options.companyUrl,
        type: 'input',
        name: 'companyUrl',
        message: 'Company Website:',
        store: true,
        validate: str => {
          return str.length > 0;
        }
      },
      {
        when: !this.options.emailAddy,
        type: 'input',
        name: 'emailAddy',
        message: 'Your e-mail address:',
        store: true,
        validate: str => {
          return str.length > 0;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      props.currentDate = new Date();
      props.namespace = this._pascalCaseName(props.company);
      props.extensionName = this._pascalCaseName(props.name);
      props.extensionType = "Hotcakes";
      props.fullNamespace = props.namespace + "." + props.extensionType + "." + props.extensionName;
      props.guid = this._generateGuid();

      this.props = props;
    });
  }

  writing() {
    this.log(
      chalk.white("Creating Hotcakes Commerce extension point.")
    );
	
    // mod: this follows the Upendo development/solution pattern
    switch (this.props.extensionType) {
      case "workflow", "actiondelegate":
        this.destinationRoot("Libraries/");
        break;
      case "viewset":
        this.destinationRoot("Viewsets/");
        break;
      default:
        this.destinationRoot("Hotcakes/");
        break;
    }

    let namespace = this.props.namespace;
    let extensionName = this.props.extensionName;
    let currentDate = this.props.currentDate;
    let fullNamespace = this.props.fullNamespace;
    let guid = this.props.guid;

    let template = {
      namespace: namespace,
      extensionName: extensionName,
      moduleFriendlyName: this.props.name,
      description: this.props.description,
      companyUrl: this.props.companyUrl,
      emailAddy: this.props.emailAddy,
      currentYear: currentDate.getFullYear(),
      version: '1.0.0',
      menuLinkName: this.props.menuLinkName,
      parentMenu: this.props.parentMenu,
      extensionType: this.props.extensionType,
      fullNamespace: this.props.fullNamespace,
      guid: this.props.guid
    };

    this.fs.copyTpl(
      this.templatePath('../../common/packaging-hcc/**'),
      this.destinationPath(extensionName + '/'),
      template
    );

    this.fs.copyTpl(
      this.templatePath('../../common/src-library/**'),
      this.destinationPath(extensionName + '/'),
      template
    );

    this.fs.copyTpl(
      this.templatePath('Properties/**'),
      this.destinationPath(extensionName + '/Properties/'),
      template
    );

    this.fs.copyTpl(
      this.templatePath('Tasks/**'),
      this.destinationPath(extensionName + '/Tasks/'),
      template
    );

    this.fs.copyTpl(
      this.templatePath('extension.csproj'),
      this.destinationPath(extensionName + '/' + fullNamespace + '.csproj'),
      template
    );

    this.fs.copyTpl(
      this.templatePath('extension.sln'),
      this.destinationPath(extensionName + '/' + fullNamespace + '.sln'),
      template
    );

    this.fs.copyTpl(
      this.templatePath('manifest.dnn'),
      this.destinationPath(extensionName + '/' + extensionName + '.dnn'),
      template
    );

    this.fs.copyTpl(
      this.templatePath('MyWorkflow.cs'),
      this.destinationPath(extensionName + '/MyWorkflow.cs'),
      template
    );

    this.fs.copyTpl(
      this.templatePath('ReadMe.txt'),
      this.destinationPath(extensionName + '/ReadMe.txt'),
      template
    );

    this.fs.copyTpl(
      this.templatePath('symbols.dnn'),
      this.destinationPath(extensionName + '/' + extensionName + '_Symbols.dnn'),
      template
    );
  }

  install() { }

  end() {
    process.chdir('../');
    this.log(chalk.green('All Ready!'));
  }
};
