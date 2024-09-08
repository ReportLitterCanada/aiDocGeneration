const TORSection = require('./torSections');

class TORObject {
  constructor() {
    this.sections = {
      evaluationTitle: new TORSection('001', 'Evaluation Title', 'Title of the Evaluation', 1, "", {}),
      backgroundAndContext: new TORSection('002', 'Background and Context', 'Background and context of the evaluation', 2, "", {}),
      evaluationPurpose: new TORSection('003', 'Evaluation Purpose', 'Purpose of the evaluation', 3, "", {}),
      evaluationScope: new TORSection('004', 'Evaluation Scope', 'Scope of the evaluation', 4, "", {}),
      
      evaluationObjectives: new TORSection('005', 'Evaluation Objectives', 'Objectives of the evaluation', 5, "", [
        { code: 'objectiveType', name: 'Objective Type', options: ['Outcome Objective', 'Impact Objective', 'Process Objective'] },
        { code: 'stakeholders', name: 'Stakeholders', options: ['Government', 'NGOs', 'Private Sector', 'Community Groups'] }
      ]),
      evaluationCriteria: new TORSection('006', 'Evaluation Criteria', 'Criteria for evaluation', 6, "", {}),
      keyEvaluationQuestions: new TORSection('007', 'Key Evaluation Questions', 'Key questions for the evaluation', 7, "", [
        { code: 'questionType', name: 'Question Type', options: ['Descriptive', 'Comparative', 'Causal'] },
        { code: 'questionCategory', name: 'Question Category', options: ['Impact', 'Outcome', 'Process'] }
   ]),
      suggestedMethodology: new TORSection('008', 'Suggested Methodology', 'Suggested methodology for the evaluation', 8, "", {}),
      expectedDeliverables: new TORSection('009', 'Expected Deliverables', 'Expected deliverables from the evaluation', 9, "", {}),
      evaluationTeamComposition: new TORSection('010', 'Evaluation Team Composition', 'Composition of the evaluation team', 10, "", {}),
      evaluationTimeframe: new TORSection('011', 'Evaluation Timeframe', 'Timeframe for the evaluation', 11, "", {}),
      evaluationBudget: new TORSection('012', 'Evaluation Budget', 'Budget for the evaluation', 12, "", {}),
    };

    // Call generatePrompt for each section to initialize prompts with dynamic content
    Object.values(this.sections).forEach(section => section.generatePrompt());
  }

  getSection(name) {
    const sectionName = Object.keys(this.sections).find(key => key.toLowerCase().replace(/ /g, '') === name.toLowerCase().replace(/ /g, ''));
    return this.sections[sectionName];
  }

  updateSection(name, value, isTextField = true) {
    const section = this.getSection(name);
    if (section) {
      console.log(`Updating section: ${name} with value: ${value}`);
      section.VALUE = value;
      section.ISTEXTFIELD = isTextField;
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
      VALUE: section.VALUE,
      extraPromptParameters: section.extraPromptParameters  // Now includes extraPromptParameters
    }));
  }
}

module.exports = TORObject;
