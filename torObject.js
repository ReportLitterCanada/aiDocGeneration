const TORSection = require('./torSections');

class TORObject {
  constructor() {
    this.sections = {
      titleOfTheProject: new TORSection('001', 'Title of the Project', 'Title of the Project', 1, "", {}),
      durationOfEvaluationProcess: new TORSection('002', 'Duration of Evaluation Process', 'Duration of Evaluation Process', 2, "", {}),
      introduction: new TORSection('003', 'Introduction', 'Introduction', 3, "", {}),
      projectBackgroundAndContext: new TORSection('004', 'Project Background and Context', 'Project Background and Context', 4, "", {}),
      
      purpose: new TORSection('005', 'Purpose', 'Purpose', 5, "", {}),
      scope: new TORSection('006', 'Scope', 'Scope', 6, "", {}),
      objectives: new TORSection('007', 'Objectives', 'Objectives', 7, "", {}), 
      
      evaluationCriteriaSection: new TORSection(
        '013', 
        'Evaluation Criteria', 
        'Which evaluation criteria do you want to include in the Terms of Reference?', 
        14, 
        "", 
        [
          { code: 'relevance', name: 'Relevance' },
          { code: 'effectiveness', name: 'Effectiveness' },
          { code: 'efficiency', name: 'Efficiency' },
          { code: 'coherence', name: 'Coherence' },
          { code: 'sustainability', name: 'Sustainability' },
          { code: 'crosscutting', name: 'CrossCutting' },
        ]
      ),
    };
    this.typeOfEvaluation = '';  // Holds the selected evaluation type
    this.startingDate = '';  // Holds the selected start date
    // Call generatePrompt for each section to initialize prompts with dynamic content
    Object.values(this.sections).forEach(section => section.generatePrompt());
  }

   // Method to set the type of evaluation
   setTypeOfEvaluation(type) {
    const allowedTypes = ['Project Evaluation', 'Outcome Evaluation', 'Thematic Evaluation'];
    if (allowedTypes.includes(type)) {
      this.typeOfEvaluation = type;
      console.log(`Type of Evaluation set to: ${type}`);
    } else {
      console.warn(`Invalid type of evaluation: ${type}`);
    }
  }

  // Method to set the starting date
  setStartingDate(date) {
    // Basic date validation (you can improve this further)
    const isValidDate = !isNaN(Date.parse(date));
    if (isValidDate) {
      this.startingDate = date;
      console.log(`Starting Date set to: ${date}`);
    } else {
      console.warn(`Invalid date: ${date}`);
    }
  }
 // Method to render the Type of Evaluation and Starting Date
 getAdditionalInfoForRendering() {
  return {
    typeOfEvaluation: this.typeOfEvaluation,
    startingDate: this.startingDate
  };
}

  addEvaluationCriteriaSections(selectedCriteria) {
    const criteriaMap = {
      relevance: new TORSection('008', 'Relevance', 'Relevance', 8, "", {}),
      effectiveness: new TORSection('009', 'Effectiveness', 'Effectiveness', 9, "", {}),
      efficiency: new TORSection('010', 'Efficiency', 'Efficiency', 10, "", {}),
      coherence: new TORSection('011', 'Coherence', 'Coherence', 11, "", {}),
      sustainability: new TORSection('012', 'Sustainability', 'Sustainability', 12, "", {}),
      crossCutting: new TORSection('013', 'crossCutting', 'crossCutting', 13, "", {}),
    };

    selectedCriteria.forEach(criteriaCode => {
      const section = criteriaMap[criteriaCode];
      if (section && !this.sections[criteriaCode]) {
        this.sections[criteriaCode] = section;
        section.generatePrompt();  // Generate the prompt for the newly added section
        console.log(`Added section: ${section.NAME}`);
      }
    });
  }

  // Method to get a section by its name
  getSection(name) {
    const sectionName = Object.keys(this.sections).find(key => key.toLowerCase().replace(/ /g, '') === name.toLowerCase().replace(/ /g, ''));
    return this.sections[sectionName];
  }

  // Method to update a section's value and text field status
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

  // Method to get all sections formatted for rendering
  getSectionsForRendering() {
    return Object.values(this.sections).map(section => ({
      NAME: section.NAME,
      DESCRIPTION: section.DESCRIPTION,
      isTextField: section.ISTEXTFIELD,
      prompt: section._prompt,
      VALUE: section.VALUE,
      extraPromptParameters: section.extraPromptParameters
    }));
  }

  // Method to get the evaluation criteria sections
  getCriteriaSections() {
    return {
      relevance: this.sections.relevance,
      effectiveness: this.sections.effectiveness,
      efficiency: this.sections.efficiency,
      coherence: this.sections.coherence,
      sustainability: this.sections.sustainability,
      crossCutting: this.sections.crossCutting
    };
  }
}

module.exports = TORObject;
