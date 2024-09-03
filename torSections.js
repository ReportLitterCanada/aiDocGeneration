// In TORSection.js
class TORSection {
  constructor(code, name, description, index, prompt, extraPromptParameters) {
    this.CODE = code;
    this.NAME = name;
    this.DESCRIPTION = description;
    this.INDEX = index;
    this._prompt = prompt;
    this._extraPromptParameters = extraPromptParameters;

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
}

module.exports = TORSection;
