const { is } = require('express/lib/request');
const TORSection = require('./torSections');

class TORObject {
  constructor() {
    this.sections = {
      evaluationTitle: new TORSection('001', 'Evaluation Title', 'Title of the Evaluation', 1, 'Please provide the evaluation title.', {}),
      backgroundAndContext: new TORSection('002', 'Background and Context', 'Background and context of the evaluation', 2, 'Describe the background and context.', {}),
      evaluationPurpose: new TORSection('003', 'Evaluation Purpose', 'Purpose of the evaluation', 3, 'State the purpose of the evaluation.', {}),
      evaluationScope: new TORSection('004', 'Evaluation Scope', 'Scope of the evaluation', 4, 'Define the scope of the evaluation.', {}),
      evaluationObjectives: new TORSection('005', 'Evaluation Objectives', 'Objectives of the evaluation', 5, 'List the objectives of the evaluation.', {}),
      evaluationCriteria: new TORSection('006', 'Evaluation Criteria', 'Criteria for evaluation', 6, 'Specify the criteria for evaluation.', {}),
      keyEvaluationQuestions: new TORSection('007', 'Key Evaluation Questions', 'Key questions for the evaluation', 7, 'What are the key questions for the evaluation?', {}),
      suggestedMethodology: new TORSection('008', 'Suggested Methodology', 'Suggested methodology for the evaluation', 8, 'Suggest a methodology for the evaluation.', {}),
      expectedDeliverables: new TORSection('009', 'Expected Deliverables', 'Expected deliverables from the evaluation', 9, 'What are the expected deliverables?', {}),
      evaluationTeamComposition: new TORSection('010', 'Evaluation Team Composition', 'Composition of the evaluation team', 10, 'Describe the evaluation team composition.', {}),
      evaluationTimeframe: new TORSection('012', 'Evaluation Timeframe', 'Timeframe for the evaluation', 11, 'Specify the evaluation timeframe.', {}),
    };
    
  }

  getSection(name) {
    // Adjust to ensure the name matches exactly
    const sectionName = Object.keys(this.sections).find(key => key.toLowerCase().replace(/ /g, '') === name.toLowerCase().replace(/ /g, ''));
    return this.sections[sectionName];
  }

  updateSection(name, value, isTextField = true) {
    const section = this.getSection(name);
    if (section) {
      console.log(`Updating section: ${name} with value: ${value}`);
      section.VALUE = value;  // Uses setter
      section.ISTEXTFIELD = isTextField;  // Uses setter
    } else {
      console.warn(`Section ${name} not found.`);
    }
  }
  

  getSectionsForRendering() {
    return Object.values(this.sections).map(section => ({
      NAME: section.NAME,
      DESCRIPTION: section.DESCRIPTION,
      isTextField: section.ISTEXTFIELD,
      prompt: section._prompt,
      VALUE: section.VALUE
      
    }));
  }
}

module.exports = TORObject;
