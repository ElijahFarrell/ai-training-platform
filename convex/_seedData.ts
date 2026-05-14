export type SeedModule = {
  slug: string;
  title: string;
  summary: string;
  agencyTag: string;
  audience: string;
  estimatedMinutes: number;
  order: number;
  lessons: Array<{
    title: string;
    type: "video" | "reading" | "document";
    body: string;
    videoUrl?: string;
    documentTitle?: string;
    documentUrl?: string;
  }>;
  quiz: {
    title: string;
    passingScore: number;
    questions: Array<{
      prompt: string;
      options: Array<{ id: string; label: string }>;
      correctOptionId: string;
      explanation: string;
    }>;
  };
};

export const SEED_MODULES: SeedModule[] = [
  {
    slug: "ai-basics-at-harborline",
    title: "AI basics at Harborline",
    summary:
      "A non-technical introduction for staff at Harborline Cooperative, a fictional research cooperative: what generative AI does, where it belongs in everyday work, and the limits of the sample policy.",
    agencyTag: "All staff",
    audience: "All employees",
    estimatedMinutes: 35,
    order: 1,
    lessons: [
      {
        title: "What generative AI actually does",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/2IK3DFHRFfw",
        body: "Harborline Cooperative is a fictional organization used only as sample curriculum. Nothing in this course describes a real employer, agency, or contract.\n\nModern generative AI systems are pattern completion engines trained on very large text collections. They predict a likely next token given the input and the text the model has already produced.\n\nWhy this matters at Harborline:\n- The model is not a database of facts. It is a statistical model of language. It can sound confident while being wrong.\n- It does not look at the open internet during a response unless a tool is attached that does.\n- It cannot reliably cite sources unless retrieval is wired in.\n\nOperating principle for this sample course: treat model output as a draft to be checked, never as an authoritative record.",
      },
      {
        title: "Where AI fits in everyday work",
        type: "reading",
        body: "At Harborline, AI is a reasonable fit for:\n- Summarizing long public documents into briefing notes.\n- Drafting first-pass language for routine correspondence.\n- Translating technical material into plain English.\n- Searching an internal library when the assistant is connected to that library.\n\nAI is a poor fit, or simply unsafe, for:\n- Making a consequential decision about a person without a human who can overrule it.\n- Pasting confidential client or personnel files into a tool that is not approved for that data.\n- Producing quantitative analyses where exact arithmetic matters.\n- Producing legally binding text without review by counsel.\n\nSample rule: any AI-assisted output that leaves Harborline in an official capacity must be reviewed by a person authorized to issue that content.",
      },
      {
        title: "Harborline responsible use standard",
        type: "document",
        documentTitle:
          "Further reading: NIST AI Risk Management Framework (AI 100-1)",
        documentUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
        body: "The link is a public risk-management guide for optional further reading. It is not a Harborline policy, and Harborline Cooperative is not a real organization.\n\nThe sample standard staff are asked to remember has three obligations:\n1. Inventory: every AI use in your team is listed with the person who owns it.\n2. Impact: uses that affect people's pay, access, safety, or eligibility need an extra review before launch.\n3. Human review: when a model output affects a person, a qualified person must be able to override it and must have the information to do so.\n\nWhen a use does not fit these rules, pause and ask the team's AI steward before deploying it.",
      },
    ],
    quiz: {
      title: "AI basics knowledge check",
      passingScore: 70,
      questions: [
        {
          prompt: "Which statement most accurately describes a generative AI model?",
          options: [
            { id: "a", label: "A real-time database of verified facts" },
            { id: "b", label: "A pattern-completion engine trained on text" },
            { id: "c", label: "A reasoning system that always cites its sources" },
            { id: "d", label: "A search engine for the open internet" },
          ],
          correctOptionId: "b",
          explanation:
            "Generative models predict a likely next token given context. They are not databases and do not browse the live internet unless a tool does that for them.",
        },
        {
          prompt:
            "A staff member wants an AI assistant to make the final call on whether a person qualifies for a Harborline benefit. Under the sample standard, this is:",
          options: [
            { id: "a", label: "Encouraged, because it speeds up service" },
            { id: "b", label: "Acceptable as long as the model is open source" },
            {
              id: "c",
              label:
                "An impactful use that needs a human who can review the case and override the model",
            },
            { id: "d", label: "Forbidden under all circumstances" },
          ],
          correctOptionId: "c",
          explanation:
            "The sample standard requires a qualified person with override authority when a model output affects someone's eligibility or access.",
        },
        {
          prompt:
            "Which of these is the safest first use of generative AI for a communications team?",
          options: [
            {
              id: "a",
              label: "Drafting plain-English versions of documents that are already public",
            },
            { id: "b", label: "Writing legal opinions for senior leadership" },
            { id: "c", label: "Pasting confidential personnel files into an unapproved tool" },
            { id: "d", label: "Generating financial projections that must be exact" },
          ],
          correctOptionId: "a",
          explanation:
            "Plain-language drafts of public material are a low-risk first use. The other three are outside the sample standard without a specific approval.",
        },
      ],
    },
  },
  {
    slug: "prompting-with-sources",
    title: "Prompting with sources",
    summary:
      "A working guide to structured prompting, source grounding, and the verification habits Harborline staff bring to AI tools in this sample course.",
    agencyTag: "Knowledge work",
    audience: "Knowledge workers",
    estimatedMinutes: 25,
    order: 2,
    lessons: [
      {
        title: "The four-part prompt",
        type: "reading",
        body: "A reliable prompt in this course has four parts:\n\n1. Role: the perspective the model should take. (\"You are a research analyst at Harborline.\")\n2. Task: the specific outcome you want. (\"Summarize the attached note into three bullets and one suggested reply.\")\n3. Constraints: tone, length, audience, and what the model must not invent. (\"Plain English. Do not invent statistics. If the source is unclear, say so.\")\n4. Source: the material the model should reason about, pasted in or retrieved from the library.\n\nWithout a source, the model reaches for plausible patterns from its training data. With a source, you can trace each claim back to a real document.",
      },
      {
        title: "Recognizing a hallucination",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/cwOH2-WSlbY",
        body: "A hallucination is a confidently stated claim with no basis in the source material or in anything you can check.\n\nCommon patterns:\n- Specific numbers, dates, names, or citations you did not provide.\n- \"Studies show\" or \"the policy states\" without a reference you can open.\n- Confident answers about private Harborline facts the model was never given.\n\nVerification habit: for any factual claim that will leave your desk, open the source. If the model cannot show you one, treat the claim as unverified.",
      },
      {
        title: "Verification checklist",
        type: "reading",
        body: "Before any AI-assisted output leaves your desk:\n\n- Does every factual claim have a source you can open and read?\n- Did you compare numbers in the output with the numbers in the source?\n- Did you remove anything the model invented, such as names, citations, or quotations?\n- Is the tone appropriate for the audience?\n- Did you record the tool, the prompt, and the date, in case the output is questioned later?\n\nIf you cannot answer yes to all five, the output is a draft, not a deliverable.",
      },
    ],
    quiz: {
      title: "Prompting knowledge check",
      passingScore: 70,
      questions: [
        {
          prompt: "Which prompt is most likely to produce an output you can check?",
          options: [
            { id: "a", label: "Tell me everything about workplace training." },
            {
              id: "b",
              label:
                "You are a research analyst. Summarize the attached Harborline note into three bullets for a non-expert. Cite the paragraph for each claim.",
            },
            { id: "c", label: "Write a memo about training." },
            { id: "d", label: "Be helpful." },
          ],
          correctOptionId: "b",
          explanation:
            "Role, task, constraints, and a source produce an output you can audit. The other three invite invention or are too vague to use.",
        },
        {
          prompt:
            "An assistant gives you a specific dollar figure for next year's Harborline budget. You should:",
          options: [
            { id: "a", label: "Use it directly in the briefing." },
            {
              id: "b",
              label: "Treat it as unverified until you find the figure in an authoritative source.",
            },
            { id: "c", label: "Ask the model to make the figure more specific." },
            { id: "d", label: "Round it down to be safe." },
          ],
          correctOptionId: "b",
          explanation:
            "A specific number from a model is a classic hallucination pattern. Check it against the source of record before anyone else relies on it.",
        },
      ],
    },
  },
  {
    slug: "harborline-literacy-tracks",
    title: "Harborline literacy tracks",
    summary:
      "How staff at the fictional Harborline Cooperative build AI skill on three tracks, who each track is for, and how progress is recorded in the learning log.",
    agencyTag: "All staff",
    audience: "All employees",
    estimatedMinutes: 30,
    order: 3,
    lessons: [
      {
        title: "Why Harborline wrote a literacy guide",
        type: "reading",
        body: "Harborline Cooperative is fictional. The literacy guide in this module is sample course content, not a published government or industry mandate.\n\nMost AI failures in the story are not technology failures. They are skill failures: a tool was turned on before people understood what it could and could not do.\n\nThe Harborline AI Literacy Guide is the cooperative's own baseline. It says what every staff member should know about AI, what people who interpret AI outputs should know, and what people who own an AI system should know. Practice happens in short blocks inside the workday, not in week-long offsites that pull teams out of operations.\n\nThe guide gives a lead a concrete answer to \"how do you know your staff can use this tool responsibly?\" The answer is the track, the practiced task, and the learning-log entry.",
      },
      {
        title: "The three tracks",
        type: "reading",
        body: "The guide groups skill into three tracks.\n\nFoundational is for everyone. It covers what AI systems actually do, what Harborline's fictional Signalboard dashboard does and does not do, how to read a model output in context, and when a person must overrule the model. It also introduces the cooperative's responsible-use standard.\n\nIntermediate is for staff who interpret outputs and act on them. It covers reading trends at the team level, comparing Signalboard figures with the fictional Quarterpulse staff survey, practicing on sample data, and keeping a person in the loop: the model recommends, an authorized person decides.\n\nAdvanced is for program owners and senior analysts. It covers watching model quality, recognizing unreliable outputs, explaining results to leadership, and the accountability that sits with the named owner.",
      },
      {
        title: "Recording progress in the learning log",
        type: "reading",
        body: "Finishing a track is not the goal. Showing you can do the work is the goal.\n\nFor each module, the learning log tracks three things:\n\n1. Demonstration: did you perform the task without someone walking you through it?\n2. Adoption: are you using the tool in your real work afterward, and how often?\n3. Operating signals: how confident you feel, how often you ask for help, and how long adoption took.\n\nOutside certificates can support the same skills. They are optional. None of them, by itself, replaces the learning log.",
      },
    ],
    quiz: {
      title: "Literacy tracks knowledge check",
      passingScore: 70,
      questions: [
        {
          prompt:
            "A team lead who must read Signalboard outputs and decide when to escalate a finding should be working in which track?",
          options: [
            { id: "a", label: "Foundational only." },
            { id: "b", label: "Intermediate, after completing Foundational." },
            { id: "c", label: "Advanced only." },
            { id: "d", label: "No track is required for leads." },
          ],
          correctOptionId: "b",
          explanation:
            "Reading outputs and acting on them is the Intermediate track. Foundational comes first. Advanced adds owner-level governance on top of that.",
        },
        {
          prompt:
            "Which of the following is the right way to show that a staff member can operate an AI tool?",
          options: [
            { id: "a", label: "They watched the training video." },
            { id: "b", label: "They passed the end-of-module quiz." },
            {
              id: "c",
              label:
                "Their learning log records a demonstration, sustained adoption, and operating signals.",
            },
            { id: "d", label: "They hold an outside AI certificate." },
          ],
          correctOptionId: "c",
          explanation:
            "The sample guide tracks demonstration, adoption, and operating signals in the learning log. A video, a quiz, or an outside certificate can help, but none of them is the standard by itself.",
        },
        {
          prompt:
            "Why does the guide use short modules instead of multi-day classroom blocks?",
          options: [
            { id: "a", label: "Short modules are always cheaper to produce." },
            {
              id: "b",
              label:
                "Teams cannot spare people for long blocks, and skill sticks better when practice happens inside the real work.",
            },
            { id: "c", label: "Harborline policy bans any course longer than a day." },
            { id: "d", label: "Adults cannot focus for longer than 30 minutes." },
          ],
          correctOptionId: "b",
          explanation:
            "The guide is explicit: training has to fit an operating tempo, and people retain a skill better when they practice it in the workflow.",
        },
      ],
    },
  },
  {
    slug: "signalboard-risk-practice",
    title: "Risk practice for Signalboard",
    summary:
      "A practical walkthrough of four risk questions for Harborline program owners, applied to Signalboard, the cooperative's fictional internal analytics tool.",
    agencyTag: "Program owners",
    audience: "Program owners and analysts",
    estimatedMinutes: 35,
    order: 4,
    lessons: [
      {
        title: "Four questions before you trust a tool",
        type: "reading",
        body: "Harborline does not ask program owners to memorize a regulation. It asks them to answer four questions about any AI system they own: Govern, Map, Measure, and Manage.\n\nThese names are a teaching device in this fictional course. They echo the structure of public risk guides, including the NIST AI Risk Management Framework linked from the earlier module, but the scenario below is Harborline's, and Harborline is not real.\n\nYou do not need the whole public guide. You need one clear answer for each question, written down where another person can find it.",
      },
      {
        title: "Govern, Map, Measure, Manage",
        type: "reading",
        body: "Govern. Who is accountable for outcomes from this system? Which policy covers it? Who can stop it? Governance continues for as long as the system runs.\n\nMap. What is the system actually doing, for whom, with what inputs, and toward what outcome? Write down who uses it, who is affected, what success means, and which failures are foreseeable.\n\nMeasure. How do you quantify quality, before launch and on a schedule after? Measurement needs numbers tied to thresholds, not adjectives.\n\nManage. When the measurements show drift or an unexpected effect, what is the response? Who decides whether to retrain, restrict, or retire the system?\n\nThe four questions are not phases. They stay open while the system is in operation.",
      },
      {
        title: "Applying the questions to Signalboard",
        type: "reading",
        body: "Signalboard is a fictional analytics tool in this course. It is not a real product.\n\nGovern: the program owner is the named accountable person. Signalboard runs under Harborline's responsible-use standard, inside the cooperative's approved workspace. There is a written stop switch: the owner can return the workflow to manual review at any time.\n\nMap: the tool reads operational metrics and writes team-level findings. Users are analysts and program owners. People affected are the staff whose teams are included. Foreseeable failures include sparse team data, mislabeled fields, and stale baselines.\n\nMeasure: outputs are checked against a held-out manual review each quarter. Targets are set per output type. Quarterpulse survey results are a second signal. When the numbers and the survey disagree, someone investigates. Neither source is ignored.\n\nManage: when measured quality drops below the threshold, a refresh is scheduled. When a finding has an unexpected side effect, the owner can pause publication while it is reviewed.\n\nThat is the practice working as intended: a habit, not a binder.",
        documentTitle: "NIST AI Risk Management Framework (AI 100-1)",
        documentUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
      },
    ],
    quiz: {
      title: "Risk practice knowledge check",
      passingScore: 70,
      questions: [
        {
          prompt:
            "In this course, what is the relationship between Harborline's four questions and the public NIST risk guide?",
          options: [
            { id: "a", label: "They conflict, so a team must pick one and ignore the other." },
            {
              id: "b",
              label:
                "The four questions are Harborline's teaching device, and they echo the structure of the public guide.",
            },
            { id: "c", label: "The public guide replaced Harborline's questions." },
            { id: "d", label: "Neither applies to an internal tool." },
          ],
          correctOptionId: "b",
          explanation:
            "Harborline uses four questions as the working habit. The public guide is optional further reading with a similar shape. The Signalboard story is fictional.",
        },
        {
          prompt: "Which question names the accountable owner of an AI system?",
          options: [
            { id: "a", label: "Map" },
            { id: "b", label: "Measure" },
            { id: "c", label: "Govern" },
            { id: "d", label: "Manage" },
          ],
          correctOptionId: "c",
          explanation:
            "Govern covers accountability, policy, and who can stop the system. Map describes context, Measure quantifies performance, and Manage responds to what Measure finds.",
        },
        {
          prompt:
            "Signalboard's quarterly check falls below the defined quality threshold. Which question covers the immediate response?",
          options: [
            { id: "a", label: "Map. The use has changed, so start over." },
            { id: "b", label: "Manage. A measured miss needs a defined response." },
            { id: "c", label: "Govern. The whole standard must be rewritten first." },
            { id: "d", label: "No action is required until the next annual review." },
          ],
          correctOptionId: "b",
          explanation:
            "Manage handles a measured miss: retrain, restrict, or retire. Govern is involved if accountability or the standard itself needs to change as a result.",
        },
      ],
    },
  },
  {
    slug: "owning-an-ai-tool",
    title: "Owning an AI tool",
    summary:
      "An advanced-track module for Harborline program owners: watching model quality, recognizing unreliable outputs, explaining results to leadership, and the accountability of the named owner.",
    agencyTag: "Program owners",
    audience: "Program owners",
    estimatedMinutes: 30,
    order: 5,
    lessons: [
      {
        title: "What ownership of an AI system means",
        type: "reading",
        body: "When Harborline uses an AI tool to inform a decision, one named person is accountable for the outcomes that tool influences. That person is the program owner. Harborline Cooperative is fictional, and so is this ownership story.\n\nOwning an AI system is not the same as managing a software project. It includes:\n\n- Authority. The owner can pause, restrict, or retire the system. That authority is written down where a third party can find it.\n- Visibility. The owner sees quality against defined thresholds on a schedule, not only after something breaks.\n- Decision rights. When the system's output and a person's judgment disagree, the written standard says who decides and on what basis. If the output affects a person, a qualified human can override it.\n- Communication. The owner translates model behavior into language leadership can act on. Leadership should not need to read a confusion matrix to know whether the system is working.\n\nIf any of those four are unclear, the system is running without an owner, whatever the org chart says.",
      },
      {
        title: "Spotting unreliable outputs",
        type: "reading",
        body: "Model quality rarely fails with a flashing light. It drifts. Noticing drift is part of the owner's job.\n\nFour patterns:\n\n1. Confidence without grounding. The output sounds more certain than the data supports. Spot-check against source data on a schedule, not only when someone challenges it.\n2. Distribution shift. The people or records the model sees now are not the ones it was built on. Reorganizations, policy changes, and seasonal patterns all cause this.\n3. Sparse-cell instability. At the team level, small denominators produce volatile findings. A 100% rate on a group of three is not the same signal as a 100% rate on a group of three hundred.\n4. Triangulation failure. The quantitative finding disagrees with Quarterpulse survey results or with what frontline staff report. Either signal could be the wrong one. The point is to investigate.\n\nNone of these is automatically a defect. Each one is a prompt to look closer before acting.",
      },
      {
        title: "Explaining an AI finding to leadership",
        type: "reading",
        body: "Leadership rarely needs the model. They need the decision the model is informing.\n\nA briefing that holds up has five parts:\n\n1. The finding, in one plain sentence. (\"Three teams show a sustained gap in completion rates over the last four quarters.\")\n2. The basis: the data, the time window, the model output, and how it was checked.\n3. The confidence: the measured quality on this kind of output, and the known limits of this finding, such as small denominators or a recent reorganization.\n4. The recommended action, with the human decision-maker named. The model recommends. An authorized person decides.\n5. The trail: where the data lives, where the model output lives, and where the decision will be recorded.\n\nThat structure gives leadership enough to act, and it keeps the system inside the posture the owner is accountable for.",
      },
    ],
    quiz: {
      title: "Ownership knowledge check",
      passingScore: 70,
      questions: [
        {
          prompt:
            "A quarterly check shows a 100% adverse finding for a team of four people. As program owner, your first action is to:",
          options: [
            { id: "a", label: "Brief leadership immediately on the 100% finding." },
            {
              id: "b",
              label:
                "Check sparse-cell instability. A percentage on a denominator of four is not comparable to one on a much larger group.",
            },
            { id: "c", label: "Retrain the model immediately." },
            { id: "d", label: "Hide the finding from the dashboard." },
          ],
          correctOptionId: "b",
          explanation:
            "Sparse-cell instability is one of the patterns to watch. Investigate the basis of the finding before escalating it or acting on it.",
        },
        {
          prompt:
            "When an AI result affects a person's access or eligibility, the sample standard requires that:",
          options: [
            { id: "a", label: "A second model independently confirm the result." },
            { id: "b", label: "A qualified person can override the result." },
            { id: "c", label: "The result be published to the whole cooperative." },
            { id: "d", label: "The model be retrained after every result." },
          ],
          correctOptionId: "b",
          explanation:
            "A qualified person with the authority and the information to override the model is the sample standard, and it is the owner's job to make that real.",
        },
        {
          prompt: "Which of the following belongs in a briefing to leadership on an AI-derived finding?",
          options: [
            { id: "a", label: "The model's full architecture diagram." },
            { id: "b", label: "Only the headline finding, so leadership stays focused." },
            {
              id: "c",
              label:
                "The finding, the basis, the confidence and known limits, the recommended action with the named decision-maker, and the trail.",
            },
            { id: "d", label: "The raw model output, unedited, so leadership can interpret it alone." },
          ],
          correctOptionId: "c",
          explanation:
            "Leadership needs to act, not to reproduce the analysis. The five-part briefing gives them the decision and keeps the system inside its governance posture.",
        },
      ],
    },
  },
];
