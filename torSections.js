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
      case "013": this._prompt = section013Prompt; break;
      case "014": this._prompt = section014Prompt; break;
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
const section001Prompt = "Extract from the Project Document the official project title";
const section002Prompt = "Based on the analysis of the Project and the type of evaluation provided manually, estimate the number of days needed for the evaluation process and include it here. Be conservative with the estimation by keeping the number of days in the range of 15 to 35.";
const section003Prompt = "In this section include a one paragraph introduction of the evaluation. The information in this paragraph should be without bullet points and it should summarize the information provided in the Cover Page, as well as provide additional information about the UNDP country office that is commissioning the evaluation, and other information. The following is a sample from another project that can be used as an example for the formulation of this section: In accordance with UNDP and GEF M&E policies and procedures, all full- and medium-sized UNDP-supported GEF-financed projects are required to undergo a Terminal Evaluation (TE) at the end of the project. This Terms of Reference (ToR) sets out the expectations for the TE of the full- sized project titled Moldova Sustainable Green Cities – Catalyzing investment in sustainable green cities in the Republic of Moldova using a holistic integrated urban planning approach (PIMS# 5492) implemented through the Ministry ofAgriculture, Regional Development and Environment with the UNDP Moldova’s Support to National Implementation Modality (Support to NIM). The project started on the 08 November 2017 and is in its sixth year of implementation. The TE process must follow the guidance outlined in the document ‘Guidance for Conducting Terminal Evaluations of UNDP-Supported, GEF-Financed Projects’.";
const section004Prompt = "In this section provide an analysis of the project’s background and context based on the information provided in the Project Document. The information in this paragraph should about 4 to 5 paragraphs and it should be without bullet points. The following should be used as requirement for the formulation of this section. -Detail the social, economic, political, geographic and demographic factors (at the time of programme / project design and of the evaluation).-Clearly describe the intervention to be evaluated (scale and complexity). -Provide details of project beneficiaries (gender, disability, vulnerable groups, and human rights issues). -Present outcomes, outputs, main achievements, results and the theory of change.";
const section005Prompt = "In this section provide a short description of the purpose of the evaluation. The information in this section should be one paragraph and it should be without bullet points. The following should be used as requirement for the formulation of this section.-Detail why the evaluation is being conducted, who will use or act on the evaluation findings and recommendations and how. The following is a sample from another project that can be used as an example for the formulation of this section: The overall purpose of this evaluation is to assess the results of the projects in the expected outcomes and their associated outputs. The evaluation will assess the implementation approaches, the progress made, challenges faced, the lessons learned and good practices and make recommendations for the future.";
const section006Prompt = "In this section provide a short description of the scope of the evaluation. The information in this section should be one paragraph and it should be without bullet points. The following should be used as requirement for the formulation of this section. -Define the parameters and focus of the evaluation. The following is a sample from another project that can be used as an example for the formulation of this section: The evaluation will cover the totality of project activities and will assess the key dimensions of the project – relevance, coherence, effectiveness, efficiency, and sustainability. In addition, the evaluation will also probe into cross-cutting issues, in particular, risk management, social inclusion and women’s empowerment and gender equality.";
const section007Prompt = `In this section provide a short description of the objectives of the evaluation.
The information in this section should be a set of bullet points. The following
should be used as requirement for the formulation of this section.
-Include an objective related to gender equality and women’s
empowerment, disability and other cross-cutting issues – if possibly relevant to the context of the project. If not, then do not include any
such objective.
The following is a sample from another project that can be used as an
example for the formulation of this section:
-The broad objectives of the evaluation are as follows:
- Assess the performance of the project in terms of achieving the intended
project output results and contribution to outcomes according to the
project’s theory of change
-Assess the project’s unique value proposition and sources of comparative
advantage relative to other initiatives
- Assess the project’s partnership strategies and performance in achieving
intended results through collaboration with ecosystem partners
-Assess the relevance, coherence, efficiency and effectiveness of the
project activities and the sustainability of the results achieved towards the
intended output and outcome level results at:
- Downstream level: directly empowering young people
- Midstream level: strengthening the ecosystem to support youth
entrepreneurship, innovation, and leadership
- Upstream level: working with governments to enhance the enabling
environment for youth entrepreneurship, innovation, and leadership
- Identify challenges and factors that have affected the achievement of project results and assess the effectiveness of the approaches that the project has adopted to address these challenges
- Assess to what extent the project has adopted human rights-based, gender
responsive and leave no one behind (LNOB) / diversity and inclusion approaches
- Identify lessons learnt from the project and provide concrete and forward-
looking recommendations to inform the design of the next project cycle
- Assess to what extent the project has contributed to the implementation of
UNDP China CPD 2016 – 2020, 2021 – 2025, as well as the Strategic
Plan 2018 – 2021, 2021 – 2025, and the project’s contribution to the
mainstreaming of the youth empowerment agenda.
- Evaluate to which extent the project has solved the needs and problems as
identified in the China’s 13th and 14th Five-Year Plan and 14th’s.`

const section008Prompt = `In this section provide three or four
evaluation questions that will be used to
assess the relevance of the project. The
evaluation questions should concise and
clearly formulated.
Evaluation questions define the information
that the evaluation will generate. This
section proposes the questions that, when
answered, will give intended users of the
evaluation the information they seek in
order to make decisions, take actions or
increase knowledge.
The following are some sample evaluation
questions related to the relevance criterion,
which can be used as examples, but should
be adjusted to the project in question on the
basis of the information presented in the
Project Document:
To what extent was the project in line with
national development priorities, country
programme outputs and outcomes, the
UNDP Strategic Plan, and the SDGs? ▪ To
what extent does the project contribute to
the theory of change for the relevant
country programme outcome? ▪ To what
extent were lessons learned from other
relevant projects considered in the design? ▪
To what extent has the project been
appropriately responsive to political, legal,
economic, institutional, etc., changes in the
country?`;
const section009Prompt = `In this section provide three or four
evaluation questions that will be used to
assess the effectiveness of the project. The
evaluation questions should concise and
clearly formulated.
Evaluation questions define the information
that the evaluation will generate. This
section proposes the questions that, when
answered, will give intended users of the

7
evaluation the information they seek in
order to make decisions, take actions or
increase knowledge.
The following are some sample evaluation
questions related to the effectiveness
criterion, which can be used as examples,
but should be adjusted to the project in
question on the basis of the information
presented in the Project Document:
To what extent were the project outputs
achieved, considering men, women, and
vulnerable groups?
What factors have contributed to achieving,
or not, intended country programme outputs
and outcomes? ▪ To what extent has the
UNDP partnership strategy been
appropriate and effective? ▪ What factors
contributed to effectiveness or
ineffectiveness? ▪ In which areas does the
project have the greatest achievements?
Why and what have been the supporting
factors? How can the project build on or
expand these achievements? ▪ In which
areas does the project have the fewest
achievements? What have been the
constraining factors and why? How can or
could they be overcome? ▪ What, if any,
alternative strategies would have been more
effective in achieving the project
objectives?`;
const section010Prompt = `In this section provide three or four
evaluation questions that will be used to
assess the efficiency of the project. The
evaluation questions should concise and
clearly formulated.
Evaluation questions define the information
that the evaluation will generate. This
section proposes the questions that, when
answered, will give intended users of the
evaluation the information they seek in
order to make decisions, take actions or
increase knowledge.
The following are some sample evaluation
questions related to the efficiency criterion,
which can be used as examples, but should

8
be adjusted to the project in question on the
basis of the information presented in the
Project Document:
To what extent was the project management
structure as outlined in the project
document efficient in generating the
expected results? ▪ To what extent were
resources used to address inequalities in
general, and gender issues in particular? ▪
To what extent have the UNDP project
implementation strategy and execution been
efficient and cost-effective? ▪ To what
extent has there been an economical use of
financial and human resources? Have
resources (funds, male and female staff,
time, expertise, etc.) been allocated
strategically to achieve outcomes? ▪ To
what extent have resources been used
efficiently? Have activities supporting the
strategy been cost-effective? ▪ To what
extent have project funds and activities been
delivered in a timely manner? ▪ To what
extent do the M&amp;E systems utilized by
UNDP ensure effective and efficient project
management?`;
const section011Prompt = `In this section provide three or four
evaluation questions that will be used to
assess the relevance of the project. The
evaluation questions should concise and
clearly formulated.
Evaluation questions define the information
that the evaluation will generate. This
section proposes the questions that, when
answered, will give intended users of the
evaluation the information they seek in
order to make decisions, take actions or
increase knowledge.
The following are some sample evaluation
questions related to the relevance criterion,
which can be used as examples, but should
be adjusted to the project in question on the
basis of the information presented in the
Project Document:
Are the project’s implementation strategies
consistent with its theory of change or

9
logical framework?
To what extent does the project
complement, duplicate, or potentially
overlap with other interventions or
programs funded by the same or different
donors?
How does the project’s design and
implementation align with global or
regional priorities and international
agreements relevant to the sector?
Are the project’s partnerships and
collaborations with external stakeholders
(e.g., local governments, NGOs, private
sector) coherent with its overall goals?`;
const section012Prompt = `In this section provide three or four
evaluation questions that will be used to
assess the sustainability of the project
results. The evaluation questions should
concise and clearly formulated.
Evaluation questions define the information
that the evaluation will generate. This
section proposes the questions that, when
answered, will give intended users of the
evaluation the information they seek in
order to make decisions, take actions or
increase knowledge.
The following are some sample evaluation
questions related to the sustainability
criterion, which can be used as examples,
but should be adjusted to the project in
question on the basis of the information
presented in the Project Document:
Are there any financial risks that may
jeopardize the sustainability of project
outputs affecting women, men and
vulnerable groups? ▪ To what extent will
targeted men, women and vulnerable people
benefit from the project interventions in the
long-term? ▪ To what extent will financial
and economic resources be available to
sustain the benefits achieved by the project?
▪ Are there any social or political risks that
may jeopardize sustainability of project
outputs and the project contributions to
country programme outputs and outcomes?
▪ Do the legal frameworks, policies and

10
governance structures and processes within
which the project operates pose risks that
may jeopardize sustainability of project
benefits? ▪ To what extent did UNDP
actions pose an environmental threat to the
sustainability of project outputs, possibly
affecting project beneficiaries (men and
women) in a negative way? To what extent
do mechanisms, procedures and policies
exist to allow primary stakeholders to carry
forward the results attained on gender
equality, empowerment of women, human
rights and human development?`;
const section013Prompt = `In this section provide three or four
evaluation questions that will be used to
assess the cross-cutting aspects of the
project. The evaluation questions should
concise and clearly formulated.
Evaluation questions define the information
that the evaluation will generate. This
section proposes the questions that, when
answered, will give intended users of the
evaluation the information they seek in
order to make decisions, take actions or
increase knowledge.
The following are some sample evaluation
questions related to the cross-cutting
aspects, which can be used as examples, but
should be adjusted to the project in question
on the basis of the information presented in
the Project Document:

▪ To what extent have gender equality and
the empowerment of women been addressed
in the design, implementation and
monitoring of the project? ▪ Is the gender
marker assigned to this project
representative of reality? ▪ To what extent
has the project promoted positive changes
in gender equality and the empowerment of
women? Did any unintended effects emerge
for women, men or vulnerable groups? To
what extent were perspectives of men and
women who could affect the outcomes, and
those who could contribute information or
other resources to the attainment of stated

11
results, taken into account during project
design processes? ▪ To what extent does the
project contribute to gender equality, the
empowerment of women and the human
rights-based approach? To what extent have
poor, indigenous and physically challenged,
women, men and other disadvantaged and
marginalized groups benefited from the
work of UNDP in the country?`;
const section014Prompt = ``;


module.exports = TORSection;
