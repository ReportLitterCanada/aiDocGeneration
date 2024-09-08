class TORSection {
  constructor(code, name, description, index, prompt = '', extraPromptParameters = {}) {
    this.CODE = code;
    this.NAME = name;
    this.DESCRIPTION = description;
    this.INDEX = index;
    this._prompt = prompt;
    this._extraPromptParameters = extraPromptParameters; // Correctly initialized

    this._value = ''; 
    this._isTextField = true; // Assume text fields by default
  }

  // Getters and Setters
  get VALUE() {
    return this._value;
  }

  set VALUE(value) {
    this._value = value;
  }

  get ISTEXTFIELD() {
    return this._isTextField;
  }

  set ISTEXTFIELD(isTextField) {
    this._isTextField = isTextField;
  }
  get extraPromptParameters() {
    return this._extraPromptParameters;  // Return the extraPromptParameters object
  }

  generatePrompt() {
    // Assign prompt based on CODE
    switch (this.CODE) {
      case "001": this._prompt = section001Prompt; break;
      case "002": this._prompt = section002Prompt; break;
      case "003": this._prompt = section003Prompt; break;
      case "004": this._prompt = section004Prompt; break;
      case "005": this._prompt = section005Prompt; break;
      case "006": this._prompt = section006Prompt; break;
      case "007": this._prompt = section007Prompt; break;
      case "008": this._prompt = section008Prompt; break;
      case "009": this._prompt = section009Prompt; break;
      case "010": this._prompt = section010Prompt; break;
      case "011": this._prompt = section011Prompt; break;
      case "012": this._prompt = section012Prompt; break;
      default: throw new Error(`Unknown section code: ${this.CODE}`);
    }

    // Replace placeholders in the prompt if extra parameters are provided
    if (Object.keys(this._extraPromptParameters).length > 0) {
      let dynamicPrompt = this._prompt;
      for (const [key, value] of Object.entries(this._extraPromptParameters)) {
        dynamicPrompt = dynamicPrompt.replace(`{${key}}`, value);
      }
      this._prompt = dynamicPrompt;
    }
  }
}

// Prompt definitions with placeholders
const section001Prompt = "Please provide a title for the evaluation.";
const section002Prompt = "Please provide background and context for the evaluation.";
const section003Prompt = "Please provide the purpose of the evaluation.";
const section004Prompt = "Please provide the scope of the evaluation.";
const section005Prompt = "Please provide the objectives of the evaluation. Specify the {objectiveType} and include details for {stakeholders}.";
const section006Prompt = "Please provide the criteria for evaluation.";
const section007Prompt = "Please provide key questions for the evaluation.";
const section008Prompt = "Please provide the suggested methodology for the evaluation.";
const section009Prompt = "Please provide the expected deliverables from the evaluation.";
const section010Prompt = "Please provide the composition of the evaluation team.";
const section011Prompt = "Please provide the timeframe for the evaluation.";
const section012Prompt = "Please provide the budget for the evaluation.";

module.exports = TORSection;
