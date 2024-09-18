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
        '014', 
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
    this.systemPrompt = '';  // System prompt with dynamic content
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
getStartingDate() {
  return this.startingDate;
}
getTypeOfEvaluation() {
  return this.typeOfEvaluation;
}

 // Method to update the system prompt dynamically
 updateSystemPrompt() {
  this.systemPrompt = `
  With this task, you will be asked to create the Terms of Reference (ToR) for the evaluation of a UNDP project – so called “evaluation terms of reference”.

The type of evaluation you will be dealing with is: ${this.typeOfEvaluation}.
The TOR is a written document which defines the scope, requirements and expectations of the evaluation and serves as a guide and point of reference throughout the evaluation.
Quality TOR should be explicit and focused, providing a clear mandate for the evaluation team on what is being evaluated and why, who should be involved in the evaluation process, and the expected outputs. TORs should be unique to the specific circumstances and purpose of each individual evaluation. Since the TOR play a critical role in establishing the quality criteria and use of the evaluation report, adequate time should be allocated to their development.

The outcome, project, thematic area, or any other initiatives selected for evaluation, along with the timing, purpose, duration, available budget and scope of the evaluation, will dictate much of the substance of the TOR. However, because an evaluation cannot address all issues, developing the TOR involves strategic choices about the specific focus, parameters and outputs for the evaluation, given available resources.

The initial draft TOR should be developed by the evaluation manager with input from the evaluation commissioner and shared with the evaluation reference group for review and comment. Regional evaluation focal points and others with the necessary expertise may comment on the draft TOR to ensure that they meet corporate quality standards.
Writing TORs and engaging relevant stakeholders can be a time-consuming exercise. Therefore, it is recommended that this process is started three to six months before the proposed commencement of the evaluation, depending on the scope and complexity of the evaluation and the numbers of stakeholders involved.

The TOR template is intended to help UNDP programme units create TORs based on quality standards for evaluations consistent with evaluation good practice. When drafting TORs, programme units should consider how the evaluation covers UNDP quality standards for programming, as relevant and required.

The TOR should retain enough flexibility on the evaluation methodology for the evaluation team to determine the best methods and tools for collecting and analyzing data. For example, the TOR might suggest using questionnaires, field visits and interviews, but the evaluation team should be able to revise the approach in consultation with the evaluation manager and key stakeholders. These changes in approach should be agreed and reflected clearly in the inception report.

  `;
}

// Method to get the system prompt
getSystemPrompt() {
  return this.systemPrompt;
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
